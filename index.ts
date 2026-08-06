import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import path from "node:path";
import fs from "node:fs";
import {
  openSessionAdminDb,
  listSessions,
  getSession,
  upsertSession,
  deleteSession,
  getMessages,
  listAgentIds,
  listChannels,
  type SessionRow,
} from "./db.js";
import {
  syncAllSessions,
  syncSessionTranscript,
  resolveStateDir,
  extractAgentIdFromSessionKey,
} from "./sync.js";
import { ADMIN_PAGE_HTML } from "./ui.js";

// ── Database singleton ──────────────────────────────────────────────────

let dbInstance: ReturnType<typeof openSessionAdminDb> | null = null;
let syncTimer: ReturnType<typeof setInterval> | null = null;

function getDb(stateDir?: string) {
  if (!dbInstance) {
    const actualStateDir = stateDir || resolveStateDir();
    const dbPath = path.join(actualStateDir, "session-admin.db");
    dbInstance = openSessionAdminDb(dbPath);
  }
  return dbInstance;
}

// ── Inbound claim hook: write sender name into session label ───────────

function registerInboundClaimHook(api: unknown) {
  const a = api as {
    on: (event: string, handler: (event: unknown, ctx: unknown) => Promise<void>) => void;
    runtime: {
      agent: {
        session: {
          getSessionEntry: (opts: { sessionKey: string }) => { label?: string } | undefined;
          patchSessionEntry: (opts: {
            sessionKey: string;
            preserveActivity: boolean;
            update: () => { label: string };
          }) => Promise<void>;
        };
      };
    };
  };
  a.on("inbound_claim", async (event, ctx) => {
    const ev = event as { isGroup?: boolean; senderName?: string };
    const c = ctx as { sessionKey?: string };
    if (!ev.senderName || !c.sessionKey) return;
    const isGroup = !!ev.isGroup;
    try {
      // Only patch the runtime session label for 1:1 chats (preserve prior behavior).
      if (!isGroup) {
        const entry = a.runtime.agent.session.getSessionEntry({ sessionKey: c.sessionKey });
        if (!entry?.label) {
          await a.runtime.agent.session.patchSessionEntry({
            sessionKey: c.sessionKey,
            preserveActivity: true,
            update: () => ({ label: ev.senderName! }),
          });
        }
      }
      // Also sync to our SQLite (records group sessions too, flagged via is_group).
      try {
        const db = getDb();
        const sessionId = extractSessionId(a, c.sessionKey);
        if (sessionId) {
          upsertSession(db, {
            session_key: c.sessionKey,
            session_id: sessionId,
            agent_id: extractAgentIdFromSessionKey(c.sessionKey),
            label: ev.senderName,
            sender_name: ev.senderName,
            is_group: isGroup ? 1 : 0,
            updated_at: Date.now(),
          });
        }
      } catch {
        // ignore db sync errors
      }
    } catch {
      // silently ignore
    }
  });
}

function extractSessionId(api: { runtime: { agent: { session: {
  getSessionEntry: (opts: { sessionKey: string }) => { sessionId?: string } | undefined;
}}}}, sessionKey: string): string | null {
  try {
    const entry = api.runtime.agent.session.getSessionEntry({ sessionKey });
    return entry?.sessionId ?? null;
  } catch {
    return null;
  }
}

// ── Sync all sessions from runtime registry into SQLite ────────────────

function syncSessionRegistry(api: unknown) {
  const a = api as {
    runtime: {
      agent: {
        session: {
          listSessionEntries: (opts?: { agentId?: string }) => Array<{
            sessionKey: string;
            entry: {
              sessionId?: string;
              label?: string;
              displayName?: string;
              category?: string;
              updatedAt?: number;
              lastActivityAt?: number;
              origin?: { provider?: string; label?: string };
            };
          }>;
        };
      };
      config?: {
        current?: () => { agents?: { list?: Array<{ id?: string }> } };
      };
    };
  };
  const db = getDb();
  try {
    const entries = a.runtime.agent.session.listSessionEntries();
    for (const { sessionKey, entry } of entries) {
      if (!entry.sessionId) continue;
      const now = Date.now();
      const lastActivity = entry.lastActivityAt ?? 0;
      let status: "idle" | "active" | "finished" | "stopped" = "idle";
      if (lastActivity && now - lastActivity < 5 * 60 * 1000) {
        status = "active";
      } else if (entry.category === "finished") {
        status = "finished";
      } else if (entry.category === "stopped") {
        status = "stopped";
      }
      upsertSession(db, {
        session_key: sessionKey,
        session_id: entry.sessionId,
        agent_id: extractAgentIdFromSessionKey(sessionKey),
        label: entry.label ?? undefined,
        display_name: entry.displayName ?? undefined,
        channel: entry.origin?.provider ?? undefined,
        sender_name: entry.origin?.label ?? undefined,
        status,
        updated_at: entry.updatedAt ?? now,
      });
    }
  } catch {
    // ignore
  }
}

// ── Page handler ──
// ── Page handler ───────────────────────────────────────────────────────

function createAdminPageHandler(api: unknown) {
  return async (req: { url?: string; headers: { authorization?: string } }, res: {
    statusCode: number;
    setHeader: (name: string, value: string) => void;
    end: (body: string) => void;
  }): Promise<boolean> => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;
    if (pathname !== "/plugins/session-admin" && pathname !== "/plugins/session-admin/") {
      return false;
    }
    res.statusCode = 200;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("cache-control", "no-store, max-age=0");
    res.end(ADMIN_PAGE_HTML);
    return true;
  };
}

// ── API handler ────────────────────────────────────────────────────────

function createAdminApiHandler(api: unknown) {
  return async (req: { url?: string; method?: string; headers: { authorization?: string } }, res: {
    statusCode: number;
    setHeader: (name: string, value: string) => void;
    end: (body: string) => void;
  }): Promise<boolean> => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;

    // ── CORS: allow opaque-origin iframe fetch ──────────────────
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return true;
    }

    // Agents list
    if (pathname === "/plugins/session-admin/api/agents" && req.method === "GET") {
      try {
        const db = getDb();
        const agents = listAgentIds(db);
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ agents }));
      } catch {
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ agents: ["main"] }));
      }
      return true;
    }

    // Data sources (distinct channels)
    if (pathname === "/plugins/session-admin/api/sources" && req.method === "GET") {
      try {
        const db = getDb();
        const channels = listChannels(db);
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ channels }));
      } catch {
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ channels: [] }));
      }
      return true;
    }

    // Sessions list (from SQLite)
    if (pathname === "/plugins/session-admin/api/sessions" && req.method === "GET") {
      try {
        const db = getDb();
        // First sync registry to ensure we have latest session metadata
        syncSessionRegistry(api);

        const search = url.searchParams.get("search")?.trim() || undefined;
        const agentId = url.searchParams.get("agentId")?.trim() || undefined;
        const status = url.searchParams.get("status") || undefined;
        const channel = url.searchParams.get("channel")?.trim() || undefined;
        const dateFrom = url.searchParams.get("dateFrom")?.trim() || undefined;
        const dateTo = url.searchParams.get("dateTo")?.trim() || undefined;
        const sortBy = url.searchParams.get("sortBy") || "updated_at";
        const sortDir = (url.searchParams.get("sortDir") || "desc") as "asc" | "desc";
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;
        const limit = parseInt(url.searchParams.get("limit") || "50", 10) || 50;

        const result = listSessions(db, {
          search,
          agentId,
          status,
          channel,
          dateFrom,
          dateTo,
          sortBy,
          sortDir,
          offset,
          limit,
        });
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          sessions: result.sessions.map((s: SessionRow) => ({
            session_key: s.session_key,
            session_id: s.session_id,
            agent_id: s.agent_id,
            label: s.label,
            display_name: s.display_name,
            channel: s.channel,
            sender_name: s.sender_name,
            is_group: s.is_group === 1,
            status: s.status,
            updated_at: s.updated_at,
            created_at: s.created_at,
            token_input: s.token_input,
            token_output: s.token_output,
            token_cache_read: s.token_cache_read,
            token_cache_write: s.token_cache_write,
            message_count: s.message_count,
          })),
          total: result.total,
        }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: String(err) }));
      }
      return true;
    }

    // Delete session
    if (pathname === "/plugins/session-admin/api/sessions" && req.method === "DELETE") {
      try {
        const key = url.searchParams.get("key")?.trim();
        if (!key) {
          res.statusCode = 400;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Missing session key" }));
          return true;
        }
        const db = getDb();
        deleteSession(db, key);
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: true, deleted: key }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: String(err) }));
      }
      return true;
    }

    // Messages (from SQLite)
    if (pathname === "/plugins/session-admin/api/messages" && req.method === "GET") {
      try {
        const key = url.searchParams.get("key")?.trim();
        const limit = parseInt(url.searchParams.get("limit") || "200", 10) || 200;
        if (!key) {
          res.statusCode = 400;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Missing session key" }));
          return true;
        }
        const db = getDb();

        // Ensure session exists in our db
        const session = getSession(db, key);
        if (!session) {
          // Try to sync from runtime first
          syncSessionRegistry(api);
        }

        // Incremental sync for this session's transcript
        const currentSession = getSession(db, key);
        if (currentSession) {
          try {
            await syncSessionTranscript(db, key, currentSession.session_id);
          } catch {
            // ignore sync errors, serve what we have
          }
        }

        const beforeSeq = url.searchParams.get("beforeSeq")?.trim();
        const before = beforeSeq ? parseInt(beforeSeq, 10) : undefined;
        const search = url.searchParams.get("search")?.trim() || undefined;
        const result = getMessages(db, key, limit, before, search);
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          messages: result.messages.map((m) => ({
            id: m.id,
            seq: m.seq,
            role: m.role,
            type: m.type,
            content_json: m.content_json,
            model: m.model,
            provider: m.provider,
            tool_name: m.tool_name,
            tool_call_id: m.tool_call_id,
            is_error: m.is_error === 1,
            token_input: m.token_input,
            token_output: m.token_output,
            timestamp: m.timestamp,
            parent_id: m.parent_id,
          })),
          totalMessages: result.total,
          sessionKey: key,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          messages: [],
          totalMessages: 0,
          error: `Failed to read messages: ${message}`,
        }));
      }
      return true;
    }

    // Manual sync trigger
    if (pathname === "/plugins/session-admin/api/sync" && req.method === "GET") {
      try {
        const db = getDb();
        // First sync session metadata from runtime
        syncSessionRegistry(api);
        // Then sync transcripts
        const result = await syncAllSessions(db);
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: String(err) }));
      }
      return true;
    }

    return false;
  };
}

// ── Periodic background sync ───────────────────────────────────────────

function startBackgroundSync(api: unknown, intervalMinutes: number = 5) {
  if (syncTimer) return;
  const doSync = async () => {
    try {
      const db = getDb();
      syncSessionRegistry(api);
      await syncAllSessions(db);
    } catch {
      // silently ignore background sync errors
    }
  };
  // Initial sync after 2s
  setTimeout(doSync, 2000);
  syncTimer = setInterval(doSync, intervalMinutes * 60 * 1000);
}

// ── Plugin entry ───────────────────────────────────────────────────────

export default definePluginEntry({
  id: "session-label-from-sender",
  name: "Session Label from Sender",
  description:
    "Auto-label sessions with sender name across all channels, plus a session admin WebUI with SQLite-backed search, filtering, and conversation viewing.",
  register(api: unknown) {
    registerInboundClaimHook(api);

    const a = api as {
      session: {
        controls: {
          registerControlUiDescriptor: (desc: {
            surface: string;
            id: string;
            label: string;
            description: string;
            path: string;
            icon: string;
            group: string;
          }) => void;
        };
      };
      registerHttpRoute: (route: {
        path: string;
        auth: string;
        match: string;
        gatewayRuntimeScopeSurface?: string;
        handler: (req: unknown, res: unknown) => Promise<boolean>;
      }) => void;
    };

    a.session.controls.registerControlUiDescriptor({
      surface: "tab",
      id: "admin",
      label: "会话管理",
      description: "浏览、搜索和查看所有会话记录",
      path: "/plugins/session-admin",
      icon: "search",
      group: "control",
    });

    a.registerHttpRoute({
      path: "/plugins/session-admin",
      auth: "plugin",
      match: "exact",
      handler: createAdminPageHandler(api),
    });

    a.registerHttpRoute({
      path: "/plugins/session-admin/api",
      auth: "plugin",
      match: "prefix",
      handler: createAdminApiHandler(api),
    });

    // Start background sync
    startBackgroundSync(api, 5);
  },
});
