import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
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
  type DatabaseSync,
} from "./db.js";
import {
  syncAllSessions,
  syncSessionTranscript,
  resolveStateDir,
  extractAgentIdFromSessionKey,
  listAgentDirs,
  reconcileIsGroup,
  channelFromSessionKey,
  computeSenderName,
  computeDisplayName,
} from "./sync.js";
import { renderListPage, renderDetailPage, buildExportText } from "./ui.js";

// ── Database singleton ──────────────────────────────────────────────────

let dbInstance: ReturnType<typeof openSessionAdminDb> | null = null;
let syncTimer: ReturnType<typeof setInterval> | null = null;

// Resolve the extension's own directory by walking up from the loaded
// bundle until we find openclaw.plugin.json. This keeps the plugin's data
// self-contained next to the code (extensions/session-label-from-sender/data)
// instead of polluting openclaw's stateDir root with the db/-shm/-wal files.
function resolveExtensionDir(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "openclaw.plugin.json"))) return dir;
    dir = path.dirname(dir);
  }
  return path.dirname(fileURLToPath(import.meta.url));
}

function resolveDbPath(): string {
  return path.join(resolveExtensionDir(), "data", "session-admin.db");
}

function getDb(_stateDir?: string) {
  if (!dbInstance) {
    const dbPath = resolveDbPath();
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
            sender_name: computeSenderName(c.sessionKey, ev.senderName),
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
    };
  };
  const db = getDb();
  // Enumerate every agent that has transcript data on disk, then sync each
  // one's session registry. (listSessionEntries() with no agentId only returns
  // the "main" agent, which is why sub-agent sessions were previously skipped.)
  const stateDir = resolveStateDir();
  const agentIds = listAgentDirs(stateDir);
  for (const agentId of agentIds) {
    try {
      const entries = a.runtime.agent.session.listSessionEntries({ agentId });
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
        // 姓名列：WebUI -> "admin"；IM 渠道有名字用名字，否则用发送人 ID
        const senderName = computeSenderName(sessionKey, entry.origin?.label);
        upsertSession(db, {
          session_key: sessionKey,
          session_id: entry.sessionId,
          agent_id: extractAgentIdFromSessionKey(sessionKey),
          label: entry.label ?? undefined,
          display_name: computeDisplayName(sessionKey, entry.displayName, senderName),
          channel: channelFromSessionKey(sessionKey),
          sender_name: senderName,
          is_group: reconcileIsGroup(sessionKey),
          status,
          updated_at: entry.updatedAt ?? now,
        });
      }
    } catch {
      // ignore this agent's errors and continue with the next
    }
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
    const params = url.searchParams;
    const db = getDb();

    // Conversation detail (server-rendered; works without client JavaScript)
    const sessionKey = params.get("session");
    if (sessionKey) {
      const session = getSession(db, sessionKey);
      if (session) {
        try {
          await syncSessionTranscript(db, sessionKey, session.session_id);
          const g = reconcileIsGroup(sessionKey);
          upsertSession(db, { session_key: sessionKey, session_id: session.session_id, is_group: g });
        } catch {
          // ignore sync errors, serve what we have
        }
      }
      const detail = getSession(db, sessionKey);
      if (!detail) {
        res.statusCode = 404;
        res.setHeader("content-type", "text/html; charset=utf-8");
        res.end("<!DOCTYPE html><meta charset=\"utf-8\"><title>未找到</title><body style=\"font-family:sans-serif;padding:40px\">未找到该会话，可能尚未同步。<br><a href=\"?\">返回列表</a></body>");
        return true;
      }
      const msearch = params.get("msearch")?.trim() || undefined;
      const result = getMessages(db, sessionKey, 300, undefined, msearch);
      if (params.get("dl") === "1") {
        const text = buildExportText(detail, result.messages).text;
        res.statusCode = 200;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.setHeader("content-disposition", "attachment; filename=\"conversation_" + encodeURIComponent(sessionKey) + ".txt\"");
        res.end(text);
        return true;
      }
      const html = renderDetailPage({ session: detail, messages: result.messages, msearch });
      res.statusCode = 200;
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.setHeader("cache-control", "no-store, max-age=0");
      res.end(html);
      return true;
    }

    // Session list (server-rendered; client JS enhances when scripts are allowed)
    try { syncSessionRegistry(api); } catch {
      // ignore
    }
    const search = params.get("search")?.trim() || undefined;
    const agentId = params.get("agent")?.trim() || undefined;
    const channel = params.get("channel")?.trim() || undefined;
    const dateFrom = params.get("dateFrom")?.trim() || undefined;
    const dateTo = params.get("dateTo")?.trim() || undefined;
    const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    const list = listSessions(db, {
      search, agentId, channel, dateFrom, dateTo,
      sortBy: "updated_at", sortDir: "desc", offset, limit: pageSize,
    });
    const agents = listAgentIds(db);
    const channels = listChannels(db);
    const html = renderListPage({
      sessions: list.sessions,
      total: list.total,
      page, pageSize,
      agents, channels,
      filters: { search, agentId, channel, dateFrom, dateTo },
    });
    res.statusCode = 200;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("cache-control", "no-store, max-age=0");
    res.end(html);
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

    // Agents list — derived from the sessions table (GROUP BY agent_id).
    // Using the DB as the source of truth keeps historical rows aligned even
    // if openclaw.json config changes later.
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
            // Recompute group classification from the sessionKey (authoritative).
            const g = reconcileIsGroup(key);
            upsertSession(db, {
              session_key: key,
              session_id: currentSession.session_id,
              is_group: g,
            });
          } catch {
            // ignore sync errors, serve what we have
          }
        }

        const beforeSeq = url.searchParams.get("beforeSeq")?.trim();
        const before = beforeSeq ? parseInt(beforeSeq, 10) : undefined;
        const afterSeq = url.searchParams.get("afterSeq")?.trim();
        const after = afterSeq ? parseInt(afterSeq, 10) : undefined;
        const search = url.searchParams.get("search")?.trim() || undefined;
        const dateFrom = url.searchParams.get("dateFrom")?.trim();
        const dateTo = url.searchParams.get("dateTo")?.trim();
        const startTs = dateFrom ? new Date(dateFrom).getTime() : undefined;
        const endTs = dateTo ? new Date(dateTo).getTime() + 86400000 : undefined;
        const result = getMessages(db, key, limit, before, search, after, startTs, endTs);
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

    // Export conversation as a downloadable .txt attachment. We do this
    // server-side (separate endpoint with Content-Disposition: attachment)
    // instead of letting the iframe generate a Blob URL because programmatic
    // <a download>.click() inside a sandboxed iframe is silently blocked by
    // Chrome — only user-gesture navigations (e.g. window.open) get a real
    // download. Returns text/plain so window.open(...) saves it directly.
    if (pathname === "/plugins/session-admin/api/export" && req.method === "GET") {
      try {
        const key = url.searchParams.get("key")?.trim();
        if (!key) {
          res.statusCode = 400;
          res.setHeader("content-type", "text/plain; charset=utf-8");
          res.end("Missing session key\n");
          return true;
        }
        const db = getDb();
        let session = getSession(db, key);
        if (!session) syncSessionRegistry(api);
        session = getSession(db, key);
        if (!session) {
          res.statusCode = 404;
          res.setHeader("content-type", "text/plain; charset=utf-8");
          res.end("Session not found\n");
          return true;
        }
        // Best-effort incremental sync so the export reflects the latest
        // transcript before we read it.
        try {
          await syncSessionTranscript(db, key, session.session_id);
          const g = reconcileIsGroup(key);
          upsertSession(db, {
            session_key: key,
            session_id: session.session_id,
            is_group: g,
          });
        } catch {}
        const result = getMessages(db, key, 100000);
        // 单会话导出上限 10MB：超过则截断并提示，避免超大会话打爆内存 / 剪贴板卡死。
        const EXPORT_BYTE_BUDGET = 10 * 1024 * 1024;
        const built = buildExportText(session, result.messages, EXPORT_BYTE_BUDGET);
        const text = built.text;
        const truncated = built.truncated;
        const displayName = session.display_name || session.sender_name || "会话";
        const safeName = displayName.replace(/[\\/:*?"<>|\r\n\t]+/g, "_").slice(0, 60);
        const filename = `会话记录_${safeName}_${Date.now()}.txt`;
        // The header value must be Latin-1 (RFC 7230). Strip non-ASCII chars
        // from the plain `filename` parameter and put the UTF-8 version in
        // `filename*` (RFC 5987) for browsers / OSes that honor it.
        const asciiName = (displayName || "export").replace(/[^\x20-\x7E]+/g, "_").slice(0, 60) || "export";
        const asciiFilename = `session_${asciiName}_${Date.now()}.txt`;
        res.statusCode = 200;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.setHeader(
          "content-disposition",
          `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        );
        if (truncated) res.setHeader("X-Export-Truncated", "1");
        // BOM so macOS / Windows open it in the user's default editor as UTF-8.
        res.end("\ufeff" + text);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.statusCode = 500;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.end("Export failed: " + message + "\n");
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
            order?: number;
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
      order: 3,
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
