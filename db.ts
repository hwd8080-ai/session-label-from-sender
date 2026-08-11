import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

export type SessionRow = {
  session_key: string;
  session_id: string;
  agent_id: string;
  label: string | null;
  display_name: string | null;
  channel: string | null;
  sender_name: string | null;
  is_group: number;
  status: "idle" | "active" | "finished" | "stopped";
  updated_at: number;
  created_at: number;
  token_input: number;
  token_output: number;
  token_cache_read: number;
  token_cache_write: number;
  message_count: number;
  sync_cursor: number; // JSONL 字节偏移
  synced_at: number;
};

export type MessageRow = {
  id: string;
  session_key: string;
  seq: number;
  role: string;
  type: string;
  content_json: string;
  model: string | null;
  provider: string | null;
  tool_name: string | null;
  tool_call_id: string | null;
  is_error: number;
  token_input: number;
  token_output: number;
  timestamp: number;
  parent_id: string | null;
};

export function openSessionAdminDb(dbPath: string): DatabaseSync {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA synchronous = NORMAL");
  db.exec("PRAGMA foreign_keys = ON");
  initSchema(db);
  return db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_key TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      agent_id TEXT NOT NULL DEFAULT 'main',
      label TEXT,
      display_name TEXT,
      channel TEXT,
      sender_name TEXT,
      is_group INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'idle',
      updated_at INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT 0,
      token_input INTEGER NOT NULL DEFAULT 0,
      token_output INTEGER NOT NULL DEFAULT 0,
      token_cache_read INTEGER NOT NULL DEFAULT 0,
      token_cache_write INTEGER NOT NULL DEFAULT 0,
      message_count INTEGER NOT NULL DEFAULT 0,
      sync_cursor INTEGER NOT NULL DEFAULT 0,
      synced_at INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_label ON sessions(label);
    CREATE INDEX IF NOT EXISTS idx_sessions_sender_name ON sessions(sender_name);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT NOT NULL,
      session_key TEXT NOT NULL,
      seq INTEGER NOT NULL,
      role TEXT NOT NULL,
      type TEXT NOT NULL,
      content_json TEXT,
      model TEXT,
      provider TEXT,
      tool_name TEXT,
      tool_call_id TEXT,
      is_error INTEGER NOT NULL DEFAULT 0,
      token_input INTEGER NOT NULL DEFAULT 0,
      token_output INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL DEFAULT 0,
      parent_id TEXT,
      PRIMARY KEY (session_key, id)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session_seq ON messages(session_key, seq DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
  `);

  // Content-level dedup: the same underlying message can be re-ingested by
  // different parsers (standard .jsonl vs cumulative trajectory) or after a
  // sessionId rotation (/new). Their generated ids differ, so the primary key
  // can't catch the duplicates. This unique index guarantees one row per
  // (session, role, type, timestamp, content-prefix) regardless of source.
  // Guarded so a stray duplicate in an old DB can't fail schema init.
  try {
    db.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_dedup ON messages(" +
      "session_key, role, type, timestamp, substr(COALESCE(content_json, ''), 1, 200)" +
      ")",
    );
  } catch {
    // Index already exists, or a residual duplicate blocked creation. Non-fatal:
    // a follow-up dedup pass can be run; the app still loads.
  }

  // Migrate existing tables that predate the is_group column.
  try {
    db.exec(
      "ALTER TABLE sessions ADD COLUMN is_group INTEGER NOT NULL DEFAULT 0",
    );
  } catch {
    // Column already exists — ignore.
  }
}

// ── Session queries ────────────────────────────────────────────────────

export type SessionListParams = {
  search?: string;
  agentId?: string;
  status?: string;
  channel?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  offset?: number;
  limit?: number;
};

export function listSessions(
  db: DatabaseSync,
  params: SessionListParams,
): { sessions: SessionRow[]; total: number } {
  const where: string[] = [];
  const args: Record<string, unknown> = {};

  if (params.search) {
    where.push(
      "(label LIKE $search OR display_name LIKE $search OR session_key LIKE $search OR sender_name LIKE $search)",
    );
    args.$search = `%${params.search}%`;
  }
  if (params.agentId) {
    const ids = params.agentId
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 1) {
      where.push("agent_id = $agentId");
      args.$agentId = ids[0];
    } else if (ids.length > 1) {
      const ph = ids.map((_, i) => `$agentId${i}`).join(",");
      where.push(`agent_id IN (${ph})`);
      ids.forEach((v, i) => {
        args[`$agentId${i}`] = v;
      });
    }
  }
  if (params.status && params.status !== "all") {
    where.push("status = $status");
    args.$status = params.status;
  }
  if (params.channel) {
    const chans = params.channel
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (chans.length === 1) {
      where.push("channel = $channel");
      args.$channel = chans[0];
    } else if (chans.length > 1) {
      const ph = chans.map((_, i) => `$channel${i}`).join(",");
      where.push(`channel IN (${ph})`);
      chans.forEach((v, i) => {
        args[`$channel${i}`] = v;
      });
    }
  }
  if (params.dateFrom) {
    const fromMs = new Date(params.dateFrom).getTime();
    if (!Number.isNaN(fromMs)) {
      where.push("updated_at >= $dateFrom");
      args.$dateFrom = fromMs;
    }
  }
  if (params.dateTo) {
    const toMs = new Date(params.dateTo).getTime() + 86400000;
    if (!Number.isNaN(toMs)) {
      where.push("updated_at <= $dateTo");
      args.$dateTo = toMs;
    }
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const sortBy = params.sortBy || "updated_at";
  const sortDir = params.sortDir === "asc" ? "ASC" : "DESC";
  const allowedSorts = new Set([
    "label",
    "updated_at",
    "created_at",
    "message_count",
    "token_input",
    "token_output",
    "status",
  ]);
  const orderSql = allowedSorts.has(sortBy)
    ? `ORDER BY ${sortBy} ${sortDir}`
    : "ORDER BY updated_at DESC";

  const offset = params.offset ?? 0;
  const limit = Math.min(params.limit ?? 50, 200);

  const countStmt = db.prepare(
    `SELECT COUNT(*) as cnt FROM sessions ${whereSql}`,
  );
  const countRow = countStmt.get(args) as { cnt: number };
  const total = countRow.cnt;

  const listStmt = db.prepare(
    `SELECT * FROM sessions ${whereSql} ${orderSql} LIMIT $limit OFFSET $offset`,
  );
  const sessions = listStmt.all({
    ...args,
    $limit: limit,
    $offset: offset,
  }) as SessionRow[];

  return { sessions, total };
}

export function getSession(
  db: DatabaseSync,
  sessionKey: string,
): SessionRow | null {
  const stmt = db.prepare("SELECT * FROM sessions WHERE session_key = $key");
  return (stmt.get({ $key: sessionKey }) as SessionRow | null) ?? null;
}

export function upsertSession(
  db: DatabaseSync,
  row: Partial<SessionRow> & { session_key: string; session_id: string },
): void {
  const existing = getSession(db, row.session_key);
  if (existing) {
    const sessionIdChanged = existing.session_id !== row.session_id;
    const stmt = db.prepare(`
      UPDATE sessions SET
        session_id = $session_id,
        label = COALESCE($label, label),
        display_name = COALESCE($display_name, display_name),
        channel = COALESCE($channel, channel),
        sender_name = COALESCE($sender_name, sender_name),
        is_group = COALESCE($is_group, is_group),
        status = COALESCE($status, status),
        updated_at = COALESCE($updated_at, updated_at),
        token_input = COALESCE($token_input, token_input),
        token_output = COALESCE($token_output, token_output),
        token_cache_read = COALESCE($token_cache_read, token_cache_read),
        token_cache_write = COALESCE($token_cache_write, token_cache_write),
        message_count = COALESCE($message_count, message_count)
      WHERE session_key = $session_key
    `);
    stmt.run({
      $session_key: row.session_key,
      $session_id: row.session_id,
      $label: row.label ?? null,
      $display_name: row.display_name ?? null,
      $channel: row.channel ?? null,
      $sender_name: row.sender_name ?? null,
      $is_group: row.is_group ?? null,
      $status: row.status ?? null,
      $updated_at: row.updated_at ?? null,
      $token_input: row.token_input ?? null,
      $token_output: row.token_output ?? null,
      $token_cache_read: row.token_cache_read ?? null,
      $token_cache_write: row.token_cache_write ?? null,
      $message_count: row.message_count ?? null,
    });
    // A /new (or any sessionId rotation) points the same session_key at a
    // brand-new transcript file. The stored sync_cursor is an offset into the
    // OLD file, so reusing it on the new file would skip everything. Reset to 0
    // so the next sync reads the new transcript from the top; INSERT OR IGNORE
    // keeps already-synced history from duplicating.
    if (sessionIdChanged) {
      updateSyncCursor(db, row.session_key, 0);
    }
  } else {
    const stmt = db.prepare(`
      INSERT INTO sessions (
        session_key, session_id, agent_id, label, display_name,
        channel, sender_name, is_group, status, updated_at, created_at,
        token_input, token_output, token_cache_read, token_cache_write,
        message_count, sync_cursor, synced_at
      ) VALUES (
        $session_key, $session_id, $agent_id, $label, $display_name,
        $channel, $sender_name, $is_group, $status, $updated_at, $created_at,
        $token_input, $token_output, $token_cache_read, $token_cache_write,
        $message_count, 0, 0
      )
    `);
    const now = Date.now();
    stmt.run({
      $session_key: row.session_key,
      $session_id: row.session_id,
      $agent_id: row.agent_id ?? "main",
      $label: row.label ?? null,
      $display_name: row.display_name ?? null,
      $channel: row.channel ?? null,
      $sender_name: row.sender_name ?? null,
      $is_group: row.is_group ?? 0,
      $status: row.status ?? "idle",
      $updated_at: row.updated_at ?? now,
      $created_at: row.created_at ?? now,
      $token_input: row.token_input ?? 0,
      $token_output: row.token_output ?? 0,
      $token_cache_read: row.token_cache_read ?? 0,
      $token_cache_write: row.token_cache_write ?? 0,
      $message_count: row.message_count ?? 0,
    });
  }
}

export function updateSyncCursor(
  db: DatabaseSync,
  sessionKey: string,
  cursor: number,
): void {
  db.exec(
    `UPDATE sessions SET sync_cursor = ${cursor}, synced_at = ${Date.now()} WHERE session_key = '${sessionKey}'`,
  );
}

// ── Message queries ────────────────────────────────────────────────────

export function getMessages(
  db: DatabaseSync,
  sessionKey: string,
  limit: number = 200,
  beforeSeq?: number,
  search?: string,
  afterSeq?: number,
  startTs?: number,
  endTs?: number,
): { messages: MessageRow[]; total: number } {
  const whereParts: string[] = ["session_key = ?"];
  const params: (string | number)[] = [sessionKey];

  if (beforeSeq !== undefined) {
    whereParts.push("seq < ?");
    params.push(beforeSeq);
  }
  if (afterSeq !== undefined) {
    whereParts.push("seq > ?");
    params.push(afterSeq);
  }
  if (search) {
    whereParts.push("content_json LIKE ?");
    params.push(`%${search}%`);
  }
  if (startTs !== undefined) {
    whereParts.push("timestamp >= ?");
    params.push(startTs);
  }
  if (endTs !== undefined) {
    whereParts.push("timestamp <= ?");
    params.push(endTs);
  }

  const where = whereParts.join(" AND ");

  const countStmt = db.prepare(`SELECT COUNT(*) as cnt FROM messages WHERE ${where}`);
  const countRow = countStmt.get(...params) as { cnt: number };
  const total = countRow?.cnt ?? 0;

  let messages: MessageRow[];
  if (afterSeq !== undefined) {
    // Ascending mode: fetch the earliest messages with seq > afterSeq, in
    // chronological order (no reverse needed). Powers "jump to oldest" then
    // scroll-down-for-newer pagination.
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE ${where}
      ORDER BY seq ASC
      LIMIT ${limit}
    `);
    messages = stmt.all(...params) as MessageRow[];
  } else {
    // Descending mode (default): fetch the latest messages with seq < beforeSeq
    // (or the latest overall), then reverse so the client receives them in
    // chronological order.
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE ${where}
      ORDER BY seq DESC
      LIMIT ${limit}
    `);
    messages = (stmt.all(...params) as MessageRow[]).reverse();
  }

  return { messages, total };
}

/**
 * Renumber a session's messages so `seq` reflects chronological order
 * (1 = earliest). The standard .jsonl parser and the cumulative trajectory
 * parser each assign their own independent seq scheme, so when both contribute
 * rows `ORDER BY seq` becomes meaningless and the timeline scrambles. Calling
 * this after each sync keeps `seq` a clean, contiguous, time-ordered index that
 * the messages API and pagination rely on.
 */
export function renumberSeq(db: DatabaseSync, sessionKey: string): void {
  const rows = db
    .prepare(
      "SELECT id FROM messages WHERE session_key = ? ORDER BY timestamp ASC, id ASC",
    )
    .all(sessionKey) as { id: string }[];
  if (rows.length === 0) return;
  const upd = db.prepare(
    "UPDATE messages SET seq = $seq WHERE session_key = $sessionKey AND id = $id",
  );
  // DatabaseSync has no .transaction(); run updates in a loop.
  rows.forEach((r, i) =>
    upd.run({ $seq: i + 1, $sessionKey: sessionKey, $id: r.id }),
  );
}

export function insertMessage(
  db: DatabaseSync,
  row: MessageRow,
): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO messages (
      id, session_key, seq, role, type, content_json,
      model, provider, tool_name, tool_call_id, is_error,
      token_input, token_output, timestamp, parent_id
    ) VALUES (
      $id, $session_key, $seq, $role, $type, $content_json,
      $model, $provider, $tool_name, $tool_call_id, $is_error,
      $token_input, $token_output, $timestamp, $parent_id
    )
  `);
  stmt.run({
    $id: row.id,
    $session_key: row.session_key,
    $seq: row.seq,
    $role: row.role,
    $type: row.type,
    $content_json: row.content_json,
    $model: row.model ?? null,
    $provider: row.provider ?? null,
    $tool_name: row.tool_name ?? null,
    $tool_call_id: row.tool_call_id ?? null,
    $is_error: row.is_error ? 1 : 0,
    $token_input: row.token_input ?? 0,
    $token_output: row.token_output ?? 0,
    $timestamp: row.timestamp ?? 0,
    $parent_id: row.parent_id ?? null,
  });
}

// ── Agents list ────────────────────────────────────────────────────────

export function listAgentIds(db: DatabaseSync): string[] {
  const stmt = db.prepare(
    "SELECT DISTINCT agent_id FROM sessions ORDER BY agent_id",
  );
  const rows = stmt.all() as { agent_id: string }[];
  const ids = rows.map((r) => r.agent_id);
  if (!ids.includes("main")) ids.unshift("main");
  return ids;
}

// ── Distinct data sources (channels) ───────────────────────────────────

export function listChannels(db: DatabaseSync): string[] {
  const stmt = db.prepare(
    "SELECT DISTINCT channel FROM sessions WHERE channel IS NOT NULL AND channel <> '' ORDER BY channel",
  );
  const rows = stmt.all() as { channel: string }[];
  return rows.map((r) => r.channel);
}

// ── Delete session ──────────────────────────────────────────────────────

export function deleteSession(db: DatabaseSync, sessionKey: string): void {
  const delMsg = db.prepare("DELETE FROM messages WHERE session_key = ?");
  delMsg.run(sessionKey);
  const delSess = db.prepare("DELETE FROM sessions WHERE session_key = ?");
  delSess.run(sessionKey);
}
