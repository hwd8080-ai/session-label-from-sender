import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import type { DatabaseSync } from "node:sqlite";
import {
  getSession,
  insertMessage,
  renumberSeq,
  updateSyncCursor,
  upsertSession,
  type MessageRow,
} from "./db.js";

/**
 * Resolve the JSONL transcript file path for a session.
 *
 * OpenClaw stores transcripts at:
 *   <stateDir>/agents/<agentId>/sessions/<sessionId>.jsonl
 */
export function resolveTranscriptPath(
  stateDir: string,
  agentId: string,
  sessionId: string,
): string {
  return path.join(stateDir, "agents", agentId, "sessions", `${sessionId}.jsonl`);
}

export function resolveTrajectoryPath(
  stateDir: string,
  agentId: string,
  sessionId: string,
): string {
  return path.join(stateDir, "agents", agentId, "sessions", `${sessionId}.trajectory.jsonl`);
}

export function resolveStateDir(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  return process.env.OPENCLAW_STATE_DIR || path.join(home, ".openclaw");
}

export function extractAgentIdFromSessionKey(sessionKey: string): string {
  if (sessionKey.startsWith("agent:")) {
    return sessionKey.split(":")[1] ?? "main";
  }
  return "main";
}

/**
 * The channel a session belongs to, derived from the sessionKey.
 * openclaw's `entry.origin.provider` is unreliable (it reports "webchat" for
 * openclaw-weixin sessions), so we trust the key instead.
 */
export function channelFromSessionKey(
  sessionKey: string,
): "feishu" | "weixin" | "webchat" {
  if (sessionKey.includes(":feishu:")) return "feishu";
  if (sessionKey.includes(":openclaw-weixin:")) return "weixin";
  return "webchat";
}

export function isImChannel(sessionKey: string): boolean {
  const ch = channelFromSessionKey(sessionKey);
  return ch === "feishu" || ch === "weixin";
}

/** True for raw openclaw/weixin identifiers that are NOT human-readable names. */
export function looksLikeOpenId(s: string | null | undefined): boolean {
  if (!s) return false;
  if (/^ou_[a-zA-Z0-9]+$/.test(s)) return true; // feishu openid
  if (/@im\.wechat$/.test(s)) return true; // weixin id
  if (/^oc_[a-zA-Z0-9]+$/.test(s)) return true; // feishu chat/group id
  if (/^o[A-Za-z0-9_-]{10,}$/.test(s)) return true; // weixin openid form
  return false;
}

/**
 * Pull the counterpart id out of a sessionKey:
 *   agent:main:feishu:direct:ou_xxx               -> ou_xxx
 *   agent:main:feishu:group:oc_xxx                -> oc_xxx
 *   agent:main:openclaw-weixin:direct:o9..@im.wechat -> o9..@im.wechat
 */
export function extractSenderId(sessionKey: string): string {
  const parts = sessionKey.split(":");
  const last = parts[parts.length - 1] || "";
  if (looksLikeOpenId(last)) return last;
  const idx = parts.findIndex((p) => p === "direct" || p === "group");
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return last || sessionKey;
}

/**
 * The "姓名" (sender) column value.
 *  - WebUI / webchat / dashboard sessions -> "admin"
 *  - IM (feishu/weixin) with a real name  -> that name
 *  - IM with only an id available         -> the sender id
 */
export function computeSenderName(
  sessionKey: string,
  originLabel?: string | null,
): string {
  const ch = channelFromSessionKey(sessionKey);
  if (ch === "webchat") return "admin";
  if (originLabel && !looksLikeOpenId(originLabel)) return originLabel;
  return extractSenderId(sessionKey);
}

/**
 * The conversation title (list row title). Always non-empty.
 *  - openclaw-provided displayName first (dashboard first message, feishu group title…)
 *  - else the counterpart name/id (IM sessions)
 *  - else a generic channel title
 */
export function computeDisplayName(
  sessionKey: string,
  displayName?: string | null,
  senderName?: string | null,
): string {
  if (displayName) return displayName;
  const ch = channelFromSessionKey(sessionKey);
  if (ch === "webchat") return "Web 会话";
  return senderName || "会话";
}

/**
 * True when openclaw's sessionKey explicitly encodes a group conversation
 * (e.g. `agent:main:feishu:group:oc_xxx`). OpenClaw already classifies
 * group vs direct in the key, so this is the authoritative signal.
 */
export function isGroupSessionKey(sessionKey: string): boolean {
  return sessionKey.includes(":group:");
}



/**
 * Decide whether a session is a group chat.
 *
 * OpenClaw encodes the group/direct distinction directly in the sessionKey
 * (`:group:` = group, `:direct:` = direct), so that is the authoritative and
 * only signal we trust. We deliberately do NOT inspect message content for a
 * `senderId: text` prefix — Feishu single (direct) chats also store every user
 * message with that `ou_xxx: ...` prefix, so a content heuristic cannot tell
 * single from group chats and would misclassify every Feishu direct chat as a
 * group.
 *
 * Returns `1` for a group, `0` for a direct/single chat.
 */
export function reconcileIsGroup(sessionKey: string): number {
  return isGroupSessionKey(sessionKey) ? 1 : 0;
}

/**
 * Enumerate all agent directories on disk.
 *
 * OpenClaw stores each agent's sessions separately under
 *   <stateDir>/agents/<agentId>/sessions/
 * We scan the filesystem for agent directories so we capture EVERY agent that
 * has transcript data — independent of openclaw.json config changes (which
 * would otherwise desync historical rows from the current config).
 */
export function listAgentDirs(stateDir?: string): string[] {
  const actualStateDir = stateDir || resolveStateDir();
  const agentsRoot = path.join(actualStateDir, "agents");
  if (!fs.existsSync(agentsRoot)) return ["main"];
  try {
    const entries = fs.readdirSync(agentsRoot, { withFileTypes: true });
    const dirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((name) => {
        const sessDir = path.join(agentsRoot, name, "sessions");
        return fs.existsSync(sessDir);
      });
    return dirs.length > 0 ? dirs : ["main"];
  } catch {
    return ["main"];
  }
}

type TranscriptEvent = {
  id?: string;
  type?: string;
  role?: string;
  message?: Record<string, unknown>;
  timestamp?: number | string;
  model?: string;
  provider?: string;
  content?: unknown;
  toolName?: string;
  toolCallId?: string;
  isError?: boolean;
  parentId?: string;
  tokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    cacheReadInputTokens?: number;
    cacheWriteInputTokens?: number;
  };
  [key: string]: unknown;
};

/**
 * Incrementally sync one session's JSONL transcript into SQLite.
 * Reads from the last sync_cursor position to EOF.
 */
export async function syncSessionTranscript(
  db: DatabaseSync,
  sessionKey: string,
  sessionId: string,
  stateDir?: string,
): Promise<{ newMessages: number; newBytes: number }> {
  const agentId = extractAgentIdFromSessionKey(sessionKey);
  const actualStateDir = stateDir || resolveStateDir();
  let transcriptPath = resolveTranscriptPath(actualStateDir, agentId, sessionId);
  let isTrajectory = false;

  // Fall back to trajectory format if standard JSONL doesn't exist
  if (!fs.existsSync(transcriptPath)) {
    const trajPath = resolveTrajectoryPath(actualStateDir, agentId, sessionId);
    if (fs.existsSync(trajPath)) {
      transcriptPath = trajPath;
      isTrajectory = true;
    } else {
      return { newMessages: 0, newBytes: 0 };
    }
  }

  // Route to trajectory parser
  if (isTrajectory) {
    return syncTrajectoryFile(db, sessionKey, sessionId, transcriptPath, actualStateDir);
  }

  const session = getSession(db, sessionKey);
  const startOffset = session?.sync_cursor ?? 0;
  const fileSize = fs.statSync(transcriptPath).size;

  if (startOffset >= fileSize) {
    return { newMessages: 0, newBytes: 0 };
  }

  let newMessages = 0;
  let seq = 0;
  let bytesRead = 0;
  let tokenInput = session?.token_input ?? 0;
  let tokenOutput = session?.token_output ?? 0;
  let tokenCacheRead = session?.token_cache_read ?? 0;
  let tokenCacheWrite = session?.token_cache_write ?? 0;
  let lastTimestamp = session?.updated_at ?? 0;

  // Stream from startOffset
  const stream = fs.createReadStream(transcriptPath, {
    encoding: "utf-8",
    start: startOffset,
  });

  // Track current position in the file
  let currentOffset = startOffset;

  await new Promise<void>((resolve) => {
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    rl.on("line", (line) => {
      const lineLen = Buffer.byteLength(line, "utf-8") + 1; // +1 for newline
      currentOffset += lineLen;
      bytesRead += lineLen;

      if (!line.trim()) return;

      let evt: TranscriptEvent;
      try {
        evt = JSON.parse(line);
      } catch {
        return;
      }

      // Unwrap message envelope if present
      const msg = evt.message && typeof evt.message === "object"
        ? (evt.message as TranscriptEvent)
        : evt;

      const id = msg.id || evt.id || `msg-${seq}`;
      const type = msg.type || evt.type || "message";
      const role = msg.role || (evt as { role?: string }).role || "unknown";

      // Skip non-message events (reset, compaction, etc.) but count them in seq
      seq++;

      // Determine if this is a visible message
      const isMessage =
        role === "user" ||
        role === "assistant" ||
        role === "tool" ||
        role === "toolResult" ||
        type === "message" ||
        type === "tool_call" ||
        type === "tool_result" ||
        type === "tool_use" ||
        !!msg.content;

      if (!isMessage) return;

      const timestamp = parseTimestamp(msg.timestamp ?? evt.timestamp);
      if (timestamp > lastTimestamp) lastTimestamp = timestamp;

      // Token usage
      const usage = msg.tokenUsage;
      if (usage) {
        tokenInput += usage.inputTokens ?? 0;
        tokenOutput += usage.outputTokens ?? 0;
        tokenCacheRead += usage.cacheReadInputTokens ?? 0;
        tokenCacheWrite += usage.cacheWriteInputTokens ?? 0;
      }

      const contentJson = msg.content !== undefined
        ? JSON.stringify(msg.content)
        : null;

      const row: MessageRow = {
        id,
        session_key: sessionKey,
        seq,
        role,
        type,
        content_json: contentJson,
        model: (msg.model as string) ?? null,
        provider: (msg.provider as string) ?? null,
        tool_name: (msg.toolName as string) ?? null,
        tool_call_id: (msg.toolCallId as string) ?? null,
        is_error: msg.isError === true ? 1 : 0,
        token_input: usage?.inputTokens ?? 0,
        token_output: usage?.outputTokens ?? 0,
        timestamp,
        parent_id: (msg.parentId as string) ?? null,
      };

      try {
        insertMessage(db, row);
        newMessages++;
      } catch {
        // duplicate id, skip
      }
    });

    rl.on("close", () => {
      resolve();
    });

    rl.on("error", () => {
      resolve();
    });
  });

  // Update session metadata
  if (newMessages > 0 || bytesRead > 0) {
    const currentMessageCount = session?.message_count ?? 0;
    upsertSession(db, {
      session_key: sessionKey,
      session_id: sessionId,
      agent_id: agentId,
      updated_at: lastTimestamp || Date.now(),
      token_input: tokenInput,
      token_output: tokenOutput,
      token_cache_read: tokenCacheRead,
      token_cache_write: tokenCacheWrite,
      message_count: currentMessageCount + newMessages,
    });
  }

  updateSyncCursor(db, sessionKey, currentOffset);

  // Keep `seq` a contiguous, time-ordered index (see renumberSeq).
  if (newMessages > 0 || bytesRead > 0) renumberSeq(db, sessionKey);

  return { newMessages, newBytes: bytesRead };
}

function parseTimestamp(ts: number | string | undefined): number {
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  const parsed = Date.parse(ts);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Sync all known sessions in the database.
 * Returns summary stats.
 */
export async function syncAllSessions(
  db: DatabaseSync,
  stateDir?: string,
): Promise<{ sessionsSynced: number; totalNewMessages: number }> {
  const stmt = db.prepare(
    "SELECT session_key, session_id FROM sessions ORDER BY updated_at DESC",
  );
  const rows = stmt.all() as { session_key: string; session_id: string }[];

  let sessionsSynced = 0;
  let totalNewMessages = 0;

  for (const row of rows) {
    try {
      const result = await syncSessionTranscript(
        db,
        row.session_key,
        row.session_id,
        stateDir,
      );
      // Recompute group classification from the sessionKey (authoritative signal).
      const g = reconcileIsGroup(row.session_key);
      upsertSession(db, {
        session_key: row.session_key,
        session_id: row.session_id,
        is_group: g,
      });
      if (result.newMessages > 0) {
        sessionsSynced++;
        totalNewMessages += result.newMessages;
      }
    } catch {
      // skip failed sessions
    }
  }

  return { sessionsSynced, totalNewMessages };
}

/**
 * Sync a session from a trajectory-format transcript file.
 *
 * Trajectory format (openclaw-trajectory schema v1):
 *   {"type":"session.started", "seq":1, "ts":"...", ...}
 *   {"type":"trace.metadata", "seq":2, ...}
 *   {"type":"context.compiled", "seq":3, "data":{...}}
 *   {"type":"prompt.submitted", "seq":4, "data":{...}}
 *   {"type":"model.completed", "seq":5, "data":{"messagesSnapshot":[...], "usage":{...}}}
 *   {"type":"trace.artifacts", "seq":6, ...}
 *   {"type":"session.ended", "seq":7, ...}
 *
 * Messages live inside model.completed.data.messagesSnapshot[],
 * each with {role, content (array), timestamp}.
 */
async function syncTrajectoryFile(
  db: DatabaseSync,
  sessionKey: string,
  sessionId: string,
  transcriptPath: string,
  stateDir: string,
): Promise<{ newMessages: number; newBytes: number }> {
  const session = getSession(db, sessionKey);
  const startOffset = session?.sync_cursor ?? 0;
  const fileSize = fs.statSync(transcriptPath).size;

  // Do NOT skip when startOffset === 0 && message_count > 0: a /new (or any
  // sessionId rotation) resets sync_cursor to 0 on purpose, and would otherwise
  // have its freshly-created transcript skipped here. Re-reading is safe because
  // message inserts use INSERT OR IGNORE (no duplicate rows).
  if (startOffset >= fileSize) {
    return { newMessages: 0, newBytes: 0 };
  }

  let newMessages = 0;
  let bytesRead = 0;
  let currentOffset = startOffset;
  let tokenInput = session?.token_input ?? 0;
  let tokenOutput = session?.token_output ?? 0;
  let tokenCacheRead = session?.token_cache_read ?? 0;
  let tokenCacheWrite = session?.token_cache_write ?? 0;
  let lastTimestamp = session?.updated_at ?? 0;

  // Track the last event seq to generate unique message seqs
  let baseSeq = session?.message_count ?? 0;

  const stream = fs.createReadStream(transcriptPath, {
    encoding: "utf-8",
    start: startOffset,
  });

  await new Promise<void>((resolvePost) => {
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    rl.on("line", (line) => {
      const lineLen = Buffer.byteLength(line, "utf-8") + 1;
      currentOffset += lineLen;
      bytesRead += lineLen;

      if (!line.trim()) return;

      let evt: Record<string, unknown>;
      try {
        evt = JSON.parse(line);
      } catch {
        return;
      }

      // Only model.completed events carry messages in trajectory format
      if (evt.type !== "model.completed") return;

      const data = evt.data as Record<string, unknown> | undefined;
      if (!data) return;

      const snapshot = data.messagesSnapshot as Array<Record<string, unknown>> | undefined;
      if (!snapshot || !Array.isArray(snapshot)) return;

      const modelId = (evt.modelId as string) ?? null;
      const provider = (evt.provider as string) ?? null;
      const evtTs = typeof evt.ts === "string" ? Date.parse(evt.ts) : 0;

      // Accumulate token usage
      const usage = data.usage as Record<string, number> | undefined;
      if (usage) {
        tokenInput += usage.input ?? 0;
        tokenOutput += usage.output ?? 0;
        tokenCacheRead += usage.cacheRead ?? 0;
        tokenCacheWrite += usage.cacheWrite ?? 0;
      }

      for (let i = 0; i < snapshot.length; i++) {
        const msg = snapshot[i];
        const role = (msg.role as string) || "unknown";
        const content = msg.content;
        const ts = (msg.timestamp as number) ?? evtTs;

        if (ts > lastTimestamp) lastTimestamp = ts;

        const isMessage =
          role === "user" ||
          role === "assistant" ||
          role === "tool" ||
          role === "toolResult";

        if (!isMessage) continue;

        // Index-based id. Trajectory snapshots are cumulative (later
        // model.completed events are supersets of earlier ones), and the event
        // `seq` field is NOT unique per event (multiple events can share seq=5),
        // so keying on seq would either collide (undercount) or fail to dedupe
        // (overcount). Index-based ids let INSERT OR IGNORE dedupe identical
        // messages across cumulative snapshots down to the unique final set.
        const id = `${sessionId}-m${i}`;
        baseSeq++;
        const contentJson = content !== undefined
          ? JSON.stringify(content)
          : null;

        // Determine content type
        let msgType = "message";
        if (role === "toolResult" || role === "tool") msgType = "tool_result";

        const row: MessageRow = {
          id,
          session_key: sessionKey,
          seq: baseSeq,
          role,
          type: msgType,
          content_json: contentJson,
          model: modelId,
          provider,
          tool_name: null,
          tool_call_id: null,
          is_error: 0,
          token_input: 0,
          token_output: 0,
          timestamp: ts,
          parent_id: null,
        };

        try {
          insertMessage(db, row);
          newMessages++;
        } catch {
          // duplicate id, skip
        }
      }
    });

    rl.on("close", () => resolvePost());
    rl.on("error", () => resolvePost());
  });

  // Update session metadata
  if (newMessages > 0 || bytesRead > 0) {
    const currentCount = session?.message_count ?? 0;
    upsertSession(db, {
      session_key: sessionKey,
      session_id: sessionId,
      agent_id: extractAgentIdFromSessionKey(sessionKey),
      updated_at: lastTimestamp || Date.now(),
      token_input: tokenInput,
      token_output: tokenOutput,
      token_cache_read: tokenCacheRead,
      token_cache_write: tokenCacheWrite,
      message_count: currentCount + newMessages,
    });
  }

  updateSyncCursor(db, sessionKey, currentOffset);

  // Keep `seq` a contiguous, time-ordered index (see renumberSeq).
  if (newMessages > 0 || bytesRead > 0) renumberSeq(db, sessionKey);

  return { newMessages, newBytes: bytesRead };
}
