// index.ts
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import path3 from "node:path";
import fs3 from "node:fs";
import { fileURLToPath } from "node:url";

// db.ts
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
function openSessionAdminDb(dbPath) {
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
function initSchema(db) {
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
  try {
    db.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_dedup ON messages(session_key, role, type, timestamp, substr(COALESCE(content_json, ''), 1, 200))"
    );
  } catch {
  }
  try {
    db.exec(
      "ALTER TABLE sessions ADD COLUMN is_group INTEGER NOT NULL DEFAULT 0"
    );
  } catch {
  }
}
function listSessions(db, params) {
  const where = [];
  const args = {};
  if (params.search) {
    where.push(
      "(label LIKE $search OR display_name LIKE $search OR session_key LIKE $search OR sender_name LIKE $search)"
    );
    args.$search = `%${params.search}%`;
  }
  if (params.agentId) {
    const ids = params.agentId.split(",").map((s) => s.trim()).filter(Boolean);
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
    const chans = params.channel.split(",").map((s) => s.trim()).filter(Boolean);
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
    const toMs = new Date(params.dateTo).getTime() + 864e5;
    if (!Number.isNaN(toMs)) {
      where.push("updated_at <= $dateTo");
      args.$dateTo = toMs;
    }
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const sortBy = params.sortBy || "updated_at";
  const sortDir = params.sortDir === "asc" ? "ASC" : "DESC";
  const allowedSorts = /* @__PURE__ */ new Set([
    "label",
    "updated_at",
    "created_at",
    "message_count",
    "token_input",
    "token_output",
    "status"
  ]);
  const orderSql = allowedSorts.has(sortBy) ? `ORDER BY ${sortBy} ${sortDir}` : "ORDER BY updated_at DESC";
  const offset = params.offset ?? 0;
  const limit = Math.min(params.limit ?? 50, 200);
  const countStmt = db.prepare(
    `SELECT COUNT(*) as cnt FROM sessions ${whereSql}`
  );
  const countRow = countStmt.get(args);
  const total = countRow.cnt;
  const listStmt = db.prepare(
    `SELECT * FROM sessions ${whereSql} ${orderSql} LIMIT $limit OFFSET $offset`
  );
  const sessions = listStmt.all({
    ...args,
    $limit: limit,
    $offset: offset
  });
  return { sessions, total };
}
function getSession(db, sessionKey) {
  const stmt = db.prepare("SELECT * FROM sessions WHERE session_key = $key");
  return stmt.get({ $key: sessionKey }) ?? null;
}
function upsertSession(db, row) {
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
      $message_count: row.message_count ?? null
    });
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
      $message_count: row.message_count ?? 0
    });
  }
}
function updateSyncCursor(db, sessionKey, cursor) {
  db.exec(
    `UPDATE sessions SET sync_cursor = ${cursor}, synced_at = ${Date.now()} WHERE session_key = '${sessionKey}'`
  );
}
function getMessages(db, sessionKey, limit = 200, beforeSeq, search, afterSeq) {
  const whereParts = ["session_key = ?"];
  const params = [sessionKey];
  if (beforeSeq !== void 0) {
    whereParts.push("seq < ?");
    params.push(beforeSeq);
  }
  if (afterSeq !== void 0) {
    whereParts.push("seq > ?");
    params.push(afterSeq);
  }
  if (search) {
    whereParts.push("content_json LIKE ?");
    params.push(`%${search}%`);
  }
  const where = whereParts.join(" AND ");
  const countStmt = db.prepare(`SELECT COUNT(*) as cnt FROM messages WHERE ${where}`);
  const countRow = countStmt.get(...params);
  const total = countRow?.cnt ?? 0;
  let messages;
  if (afterSeq !== void 0) {
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE ${where}
      ORDER BY seq ASC
      LIMIT ${limit}
    `);
    messages = stmt.all(...params);
  } else {
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE ${where}
      ORDER BY seq DESC
      LIMIT ${limit}
    `);
    messages = stmt.all(...params).reverse();
  }
  return { messages, total };
}
function renumberSeq(db, sessionKey) {
  const rows = db.prepare(
    "SELECT id FROM messages WHERE session_key = ? ORDER BY timestamp ASC, id ASC"
  ).all(sessionKey);
  if (rows.length === 0) return;
  const upd = db.prepare(
    "UPDATE messages SET seq = $seq WHERE session_key = $sessionKey AND id = $id"
  );
  rows.forEach(
    (r, i) => upd.run({ $seq: i + 1, $sessionKey: sessionKey, $id: r.id })
  );
}
function insertMessage(db, row) {
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
    $parent_id: row.parent_id ?? null
  });
}
function listAgentIds(db) {
  const stmt = db.prepare(
    "SELECT DISTINCT agent_id FROM sessions ORDER BY agent_id"
  );
  const rows = stmt.all();
  const ids = rows.map((r) => r.agent_id);
  if (!ids.includes("main")) ids.unshift("main");
  return ids;
}
function listChannels(db) {
  const stmt = db.prepare(
    "SELECT DISTINCT channel FROM sessions WHERE channel IS NOT NULL AND channel <> '' ORDER BY channel"
  );
  const rows = stmt.all();
  return rows.map((r) => r.channel);
}
function deleteSession(db, sessionKey) {
  const delMsg = db.prepare("DELETE FROM messages WHERE session_key = ?");
  delMsg.run(sessionKey);
  const delSess = db.prepare("DELETE FROM sessions WHERE session_key = ?");
  delSess.run(sessionKey);
}

// sync.ts
import fs2 from "node:fs";
import path2 from "node:path";
import readline from "node:readline";
function resolveTranscriptPath(stateDir, agentId, sessionId) {
  return path2.join(stateDir, "agents", agentId, "sessions", `${sessionId}.jsonl`);
}
function resolveTrajectoryPath(stateDir, agentId, sessionId) {
  return path2.join(stateDir, "agents", agentId, "sessions", `${sessionId}.trajectory.jsonl`);
}
function resolveStateDir() {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  return process.env.OPENCLAW_STATE_DIR || path2.join(home, ".openclaw");
}
function extractAgentIdFromSessionKey(sessionKey) {
  if (sessionKey.startsWith("agent:")) {
    return sessionKey.split(":")[1] ?? "main";
  }
  return "main";
}
function channelFromSessionKey(sessionKey) {
  if (sessionKey.includes(":feishu:")) return "feishu";
  if (sessionKey.includes(":openclaw-weixin:")) return "weixin";
  return "webchat";
}
function looksLikeOpenId(s) {
  if (!s) return false;
  if (/^ou_[a-zA-Z0-9]+$/.test(s)) return true;
  if (/@im\.wechat$/.test(s)) return true;
  if (/^oc_[a-zA-Z0-9]+$/.test(s)) return true;
  if (/^o[A-Za-z0-9_-]{10,}$/.test(s)) return true;
  return false;
}
function extractSenderId(sessionKey) {
  const parts = sessionKey.split(":");
  const last = parts[parts.length - 1] || "";
  if (looksLikeOpenId(last)) return last;
  const idx = parts.findIndex((p) => p === "direct" || p === "group");
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return last || sessionKey;
}
function computeSenderName(sessionKey, originLabel) {
  const ch = channelFromSessionKey(sessionKey);
  if (ch === "webchat") return "admin";
  if (originLabel && !looksLikeOpenId(originLabel)) return originLabel;
  return extractSenderId(sessionKey);
}
function computeDisplayName(sessionKey, displayName, senderName) {
  if (displayName) return displayName;
  const ch = channelFromSessionKey(sessionKey);
  if (ch === "webchat") return "Web \u4F1A\u8BDD";
  return senderName || "\u4F1A\u8BDD";
}
function isGroupSessionKey(sessionKey) {
  return sessionKey.includes(":group:");
}
function reconcileIsGroup(sessionKey) {
  return isGroupSessionKey(sessionKey) ? 1 : 0;
}
function listAgentDirs(stateDir) {
  const actualStateDir = stateDir || resolveStateDir();
  const agentsRoot = path2.join(actualStateDir, "agents");
  if (!fs2.existsSync(agentsRoot)) return ["main"];
  try {
    const entries = fs2.readdirSync(agentsRoot, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).filter((name) => {
      const sessDir = path2.join(agentsRoot, name, "sessions");
      return fs2.existsSync(sessDir);
    });
    return dirs.length > 0 ? dirs : ["main"];
  } catch {
    return ["main"];
  }
}
async function syncSessionTranscript(db, sessionKey, sessionId, stateDir) {
  const agentId = extractAgentIdFromSessionKey(sessionKey);
  const actualStateDir = stateDir || resolveStateDir();
  let transcriptPath = resolveTranscriptPath(actualStateDir, agentId, sessionId);
  let isTrajectory = false;
  if (!fs2.existsSync(transcriptPath)) {
    const trajPath = resolveTrajectoryPath(actualStateDir, agentId, sessionId);
    if (fs2.existsSync(trajPath)) {
      transcriptPath = trajPath;
      isTrajectory = true;
    } else {
      return { newMessages: 0, newBytes: 0 };
    }
  }
  if (isTrajectory) {
    return syncTrajectoryFile(db, sessionKey, sessionId, transcriptPath, actualStateDir);
  }
  const session = getSession(db, sessionKey);
  const startOffset = session?.sync_cursor ?? 0;
  const fileSize = fs2.statSync(transcriptPath).size;
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
  const stream = fs2.createReadStream(transcriptPath, {
    encoding: "utf-8",
    start: startOffset
  });
  let currentOffset = startOffset;
  await new Promise((resolve) => {
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on("line", (line) => {
      const lineLen = Buffer.byteLength(line, "utf-8") + 1;
      currentOffset += lineLen;
      bytesRead += lineLen;
      if (!line.trim()) return;
      let evt;
      try {
        evt = JSON.parse(line);
      } catch {
        return;
      }
      const msg = evt.message && typeof evt.message === "object" ? evt.message : evt;
      const id = msg.id || evt.id || `msg-${seq}`;
      const type = msg.type || evt.type || "message";
      const role = msg.role || evt.role || "unknown";
      seq++;
      const isMessage = role === "user" || role === "assistant" || role === "tool" || role === "toolResult" || type === "message" || type === "tool_call" || type === "tool_result" || type === "tool_use" || !!msg.content;
      if (!isMessage) return;
      const timestamp = parseTimestamp(msg.timestamp ?? evt.timestamp);
      if (timestamp > lastTimestamp) lastTimestamp = timestamp;
      const usage = msg.tokenUsage;
      if (usage) {
        tokenInput += usage.inputTokens ?? 0;
        tokenOutput += usage.outputTokens ?? 0;
        tokenCacheRead += usage.cacheReadInputTokens ?? 0;
        tokenCacheWrite += usage.cacheWriteInputTokens ?? 0;
      }
      const contentJson = msg.content !== void 0 ? JSON.stringify(msg.content) : null;
      const row = {
        id,
        session_key: sessionKey,
        seq,
        role,
        type,
        content_json: contentJson,
        model: msg.model ?? null,
        provider: msg.provider ?? null,
        tool_name: msg.toolName ?? null,
        tool_call_id: msg.toolCallId ?? null,
        is_error: msg.isError === true ? 1 : 0,
        token_input: usage?.inputTokens ?? 0,
        token_output: usage?.outputTokens ?? 0,
        timestamp,
        parent_id: msg.parentId ?? null
      };
      try {
        insertMessage(db, row);
        newMessages++;
      } catch {
      }
    });
    rl.on("close", () => {
      resolve();
    });
    rl.on("error", () => {
      resolve();
    });
  });
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
      message_count: currentMessageCount + newMessages
    });
  }
  updateSyncCursor(db, sessionKey, currentOffset);
  if (newMessages > 0 || bytesRead > 0) renumberSeq(db, sessionKey);
  return { newMessages, newBytes: bytesRead };
}
function parseTimestamp(ts) {
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  const parsed = Date.parse(ts);
  return Number.isNaN(parsed) ? 0 : parsed;
}
async function syncAllSessions(db, stateDir) {
  const stmt = db.prepare(
    "SELECT session_key, session_id FROM sessions ORDER BY updated_at DESC"
  );
  const rows = stmt.all();
  let sessionsSynced = 0;
  let totalNewMessages = 0;
  for (const row of rows) {
    try {
      const result = await syncSessionTranscript(
        db,
        row.session_key,
        row.session_id,
        stateDir
      );
      const g = reconcileIsGroup(row.session_key);
      upsertSession(db, {
        session_key: row.session_key,
        session_id: row.session_id,
        is_group: g
      });
      if (result.newMessages > 0) {
        sessionsSynced++;
        totalNewMessages += result.newMessages;
      }
    } catch {
    }
  }
  return { sessionsSynced, totalNewMessages };
}
async function syncTrajectoryFile(db, sessionKey, sessionId, transcriptPath, stateDir) {
  const session = getSession(db, sessionKey);
  const startOffset = session?.sync_cursor ?? 0;
  const fileSize = fs2.statSync(transcriptPath).size;
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
  let baseSeq = session?.message_count ?? 0;
  const stream = fs2.createReadStream(transcriptPath, {
    encoding: "utf-8",
    start: startOffset
  });
  await new Promise((resolvePost) => {
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on("line", (line) => {
      const lineLen = Buffer.byteLength(line, "utf-8") + 1;
      currentOffset += lineLen;
      bytesRead += lineLen;
      if (!line.trim()) return;
      let evt;
      try {
        evt = JSON.parse(line);
      } catch {
        return;
      }
      if (evt.type !== "model.completed") return;
      const data = evt.data;
      if (!data) return;
      const snapshot = data.messagesSnapshot;
      if (!snapshot || !Array.isArray(snapshot)) return;
      const modelId = evt.modelId ?? null;
      const provider = evt.provider ?? null;
      const evtTs = typeof evt.ts === "string" ? Date.parse(evt.ts) : 0;
      const usage = data.usage;
      if (usage) {
        tokenInput += usage.input ?? 0;
        tokenOutput += usage.output ?? 0;
        tokenCacheRead += usage.cacheRead ?? 0;
        tokenCacheWrite += usage.cacheWrite ?? 0;
      }
      for (let i = 0; i < snapshot.length; i++) {
        const msg = snapshot[i];
        const role = msg.role || "unknown";
        const content = msg.content;
        const ts = msg.timestamp ?? evtTs;
        if (ts > lastTimestamp) lastTimestamp = ts;
        const isMessage = role === "user" || role === "assistant" || role === "tool" || role === "toolResult";
        if (!isMessage) continue;
        const id = `${sessionId}-m${i}`;
        baseSeq++;
        const contentJson = content !== void 0 ? JSON.stringify(content) : null;
        let msgType = "message";
        if (role === "toolResult" || role === "tool") msgType = "tool_result";
        const row = {
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
          parent_id: null
        };
        try {
          insertMessage(db, row);
          newMessages++;
        } catch {
        }
      }
    });
    rl.on("close", () => resolvePost());
    rl.on("error", () => resolvePost());
  });
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
      message_count: currentCount + newMessages
    });
  }
  updateSyncCursor(db, sessionKey, currentOffset);
  if (newMessages > 0 || bytesRead > 0) renumberSeq(db, sessionKey);
  return { newMessages, newBytes: bytesRead };
}

// ui.ts
var CSS = `:root{--ink:#252421;--muted:#78746d;--line:#e8e3da;--paper:#fffefa;--canvas:#f5f2ec;--red:#d84a38;--redsoft:#fff1ed;--teal:#168f89;--radius:14px;--radius-sm:9px;--shadow:0 2px 10px rgba(86,75,56,.06);--field:#fff;--field-border:#ded8ce}*{box-sizing:border-box}html,body{height:100%}body.page-list{overflow:hidden}body.page-detail{overflow-y:auto}body{margin:0;background:var(--canvas);color:var(--ink);font:14px Arial,"PingFang SC","Microsoft YaHei",sans-serif}button,input{font:inherit}button{cursor:pointer}.app{position:relative;width:min(1500px,calc(100% - 40px));margin:auto;padding:4px 0 0;height:100vh;display:flex;flex-direction:column}.top{display:flex;flex-direction:column;align-items:flex-start;gap:0;margin-bottom:20px;flex-shrink:0}.top h1{margin:0;font-size:22px;font-weight:650;color:#bd4531;letter-spacing:-.03em;line-height:1.2}.top p{margin:4px 0 0;color:#252421;font-size:13px;opacity:.85}.card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.filters{padding:20px;margin-bottom:16px;flex-shrink:0}.list-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;margin-bottom:0}.list-card .tablebox{flex:1;overflow:auto;min-height:0}#filters{display:grid;grid-template-columns:1fr 1.2fr 1fr 2.2fr auto;gap:14px;align-items:end}.field{position:relative}.field>label{display:block;margin-bottom:8px;color:#5e5a53;font-size:13px;font-weight:700}.control{width:100%;height:42px;border:1px solid var(--field-border);border-radius:var(--radius-sm);background:var(--field);padding:0 12px;color:#555}.control:focus{outline:none;border-color:var(--red)}.select{display:flex;align-items:center;justify-content:space-between;text-align:left}.muted{color:#aaa49b}.menu{display:none;position:absolute;z-index:5;top:calc(100% + 6px);left:0;width:100%;padding:7px;background:#fff;border:1px solid #dcd6cc;border-radius:10px;box-shadow:0 10px 28px rgba(63,57,44,.14)}.menu.open{display:block}.option{display:flex;gap:9px;align-items:center;padding:10px;border-radius:7px;cursor:pointer;font-size:13px;color:var(--ink);min-width:0}.option>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.option:hover{background:#f7f3ed}.option input{accent-color:var(--red);width:16px;height:16px}.input{display:flex;align-items:center;gap:8px;padding:0 12px}.input input{min-width:0;flex:1;border:0;outline:0;color:#555}.range{display:flex;align-items:center;gap:8px}.range .control{min-width:0;padding:0 9px}.range span{flex:none;color:#80796f}.buttons{display:flex;gap:10px}.btn{height:42px;padding:0 18px;border-radius:var(--radius-sm);border:1px solid transparent;font-weight:600;font-size:14px}.btn.primary{background:var(--red);color:#fff}.btn.primary:hover{background:#c23f2f}.btn.primary:disabled{opacity:.6;cursor:default}.btn.secondary{background:#fff;border-color:var(--field-border);color:var(--ink)}.btn.secondary:hover{background:#f7f3ed}.heading{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--line)}.heading h2{margin:0;font-size:17px}.heading p{margin:5px 0 0;color:var(--muted);font-size:13px}table{width:100%;border-collapse:collapse;font-size:14px}thead th{text-align:left;padding:12px 18px;color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.04em;border-bottom:1px solid var(--line);white-space:nowrap}tbody td{padding:14px 18px;border-bottom:1px solid #f1ece4;vertical-align:middle}tbody tr:last-child td{border-bottom:none}tbody tr:hover{background:#faf7f1}.agent{display:flex;align-items:center;gap:10px}.agent strong{font-weight:600}.person{display:flex;align-items:center;gap:9px}.avatar{width:28px;height:28px;border-radius:50%;background:var(--redsoft);color:var(--red);display:grid;place-items:center;font-weight:700;font-size:13px;flex:none}.time{white-space:nowrap}.time small{display:block;color:var(--muted);font-size:12px;margin-top:2px}.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}.badge.single{background:#eef6f4;color:var(--teal)}.badge.group{background:#fdf0e8;color:#c47932}.source{color:var(--muted);font-size:13px}.title-cell{max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.name-cell{max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.agent-cell{max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.detail{background:none;border:none;color:var(--red);font-weight:600;font-size:13px;padding:6px 0;cursor:pointer}.detail:hover{text-decoration:underline}.empty{display:none;text-align:center;padding:60px 20px;color:var(--muted)}.empty b{display:block;margin:8px 0 4px;color:var(--ink);font-size:15px}.empty small{color:var(--muted)}.error-banner{display:none;margin:0 20px 16px;padding:12px 14px;background:var(--redsoft);border:1px solid #f3c9bf;border-radius:10px;color:var(--red);font-size:13px}.page-size{height:34px;padding:4px 28px 4px 10px;border:1px solid var(--field-border);border-radius:var(--radius-sm);background:var(--field);color:var(--ink);font-size:13px;cursor:pointer;outline:none;margin-left:auto}.page-size:focus{border-color:var(--red)}.pager{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}.pg-controls{display:flex;align-items:center;gap:8px}.pager button{height:32px;min-width:32px;padding:0 12px;border:1px solid var(--field-border);background:#fff;border-radius:8px;color:var(--ink);font-weight:600;cursor:pointer}.pager button:disabled{opacity:.45;cursor:default}.pager button.active{background:var(--red);color:#fff;border-color:var(--red)}.layer{display:none}.layer.open{display:block;position:fixed;inset:0;z-index:1000}.backdrop{position:absolute;inset:0;background:rgba(40,36,30,.4)}.drawer{position:absolute;top:0;right:0;height:100%;width:min(880px,96vw);background:var(--paper);box-shadow:-12px 0 40px rgba(40,36,30,.18);display:flex;flex-direction:column;animation:slidein .22s ease}@keyframes slidein{from{transform:translateX(20px);opacity:.6}to{transform:none;opacity:1}}.drawer-head{display:flex;align-items:center;gap:12px;padding:10px 14px 10px 18px;border-bottom:1px solid var(--line)}.drawer-head h2{margin:0;font-size:17px}.drawer-head p{margin:5px 0 0;color:var(--muted);font-size:13px}.close{width:34px;height:34px;border:1px solid var(--field-border);background:#fff;border-radius:8px;font-size:20px;line-height:1;color:var(--muted);cursor:pointer}.close:hover{background:#f7f3ed}.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:10px 20px;background:#faf7f1;border-bottom:1px solid var(--line)}.meta>div{display:flex;flex-direction:column;gap:2px;min-width:0}.meta span{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}.meta strong{font-size:13px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.divider{padding:6px 20px;color:var(--muted);font-size:12px;border-bottom:1px solid var(--line)}.messages{flex:1;overflow-y:auto;padding:12px 20px 64px;background:var(--canvas)}.fab{position:absolute;right:16px;bottom:16px;z-index:6;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:999px;border:1px solid var(--teal);background:rgba(255,255,255,.92);color:var(--teal);font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(40,36,30,.22);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:transform .15s ease,background .15s ease,color .15s ease}.fab:hover{background:var(--teal);color:#fff;transform:translateY(-2px)}.fab:active{transform:translateY(0)}.fab:disabled{opacity:.55;cursor:default;transform:none}.fab:focus-visible{outline:2px solid var(--teal);outline-offset:2px}.message{display:flex;gap:12px;margin-bottom:18px}.message.user{flex-direction:row}.message.bot{flex-direction:row-reverse}.mbody{display:flex;flex-direction:column;gap:6px;max-width:80%}.message.user .mbody{align-items:flex-start}.message.user .bubble{background:#f8f7f4;border-color:#e8e3da;box-shadow:0 1px 3px rgba(37,36,33,.04)}.message.user .bubble pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}.message.bot .mbody{align-items:flex-end}.mavatar{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-weight:700;flex:none;font-size:14px}.message.user .mavatar{background:#e7f4f2;color:var(--teal)}.message.bot .mavatar{background:var(--redsoft);color:var(--red)}.mmeta{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}.message.bot .mmeta{flex-direction:row-reverse}.mmeta strong{color:var(--ink);font-weight:600}.bubble{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;line-height:1.65;white-space:pre-wrap;word-break:break-word;font-size:14px;color:var(--ink)}.message.bot .bubble{background:#fff;color:var(--ink);border-color:#e8e3da;box-shadow:0 1px 3px rgba(37,36,33,.04)}.message.bot .bubble pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}.message.bot .bubble code{background:rgba(0,0,0,.05)}.channel{font-size:11px;color:var(--muted)}.toolcard{background:#faf9f6;border-left:3px solid var(--teal);border-radius:10px;padding:10px 12px;margin:6px 0;font-size:13px;overflow-x:auto;max-width:100%}.toolcard.err{border-left-color:var(--red);background:var(--redsoft)}.toolcard .tname{font-weight:700;color:var(--teal);margin-bottom:4px}.toolcard.err .tname{color:var(--red)}.toolcard pre{margin:6px 0 0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--ink)}.thinking{background:#fdfbf7;border:1px dashed #ddd6c8;border-radius:10px;padding:10px 14px;margin:6px 0;font-size:12px;color:var(--muted);font-style:italic}.msg-collapse{border-radius:10px;margin:6px 0;overflow:hidden;background:#fff}.msg-collapse summary{cursor:pointer;padding:8px 12px;font-size:12px;color:var(--muted);background:var(--canvas);list-style:none;display:flex;align-items:center;gap:6px;user-select:none}.msg-collapse summary::-webkit-details-marker{display:none}.msg-collapse summary::before{content:'\u25B8';font-size:10px;transition:transform .2s}.msg-collapse[open] > summary::before{transform:rotate(90deg)}.msg-collapse[open] > summary{color:var(--ink);background:#f9f6f0;border-bottom:1px solid var(--line)}.loading{padding:40px;text-align:center;color:var(--muted)}.spinner{display:inline-block;width:22px;height:22px;border:2px solid var(--line);border-top-color:var(--red);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:10px}@keyframes spin{to{transform:rotate(360deg)}}
.date-divider{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:10px 0;margin:4px 0 14px;pointer-events:none}
.date-divider::before,.date-divider::after{content:"";flex:1;height:1px;background:var(--line);margin:0 12px}
.date-divider span{background:var(--paper);color:var(--muted);font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;border:1px solid var(--line);box-shadow:0 1px 3px rgba(37,36,33,.06)}
.jump-nav{position:fixed;right:18px;top:90px;bottom:80px;width:36px;z-index:20;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none}
.jump-btn{pointer-events:auto;width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:rgba(255,255,255,.95);color:var(--muted);font-size:16px;line-height:1;display:grid;place-items:center;cursor:pointer;box-shadow:0 4px 14px rgba(40,36,30,.14);transition:background .15s,color .15s,transform .1s}
.jump-btn:hover{background:var(--teal);color:#fff;border-color:var(--teal);transform:translateY(-1px)}
.jump-btn:active{transform:translateY(0)}
#msgTop,#msgBottom{height:0}
@media(max-width:900px){#filters{grid-template-columns:1fr 1fr}.meta{grid-template-columns:repeat(2,1fr)}.drawer-head{flex-wrap:wrap}}mark{background:#fde68a;color:var(--ink);padding:1px 2px;border-radius:3px}.msg-search{flex:1;display:flex;align-items:center;gap:8px;padding:0;background:transparent}.msg-search input{flex:1;height:34px;padding:0 12px;border:1px solid var(--line);border-radius:9px;font-size:13px;background:var(--paper);color:var(--ink);outline:none}.msg-search input:focus{border-color:var(--teal)}.search-count{font-size:12px;color:var(--muted);white-space:nowrap}.search-clear{background:none;border:none;font-size:16px;cursor:pointer;color:var(--muted);padding:0 4px}.head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;width:100%}.head-main{flex:1 1 auto;min-width:0}.head-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0}@media(max-width:640px){.head-row{gap:12px}.head-main p{font-size:12px}.head-right{width:100%;align-items:flex-start;padding-top:10px;border-top:1px dashed var(--line)}}.head-left>p{font-size:12px}.head-right{width:100%;align-items:flex-start;padding-top:10px;border-top:1px dashed var(--line)}}`;
function buildJs() {
  const js = [];
  js.push("var API = '/plugins/session-admin/api';");
  js.push("var allAgents = [];");
  js.push("var allSources = [];");
  js.push("var allSessions = [];");
  js.push("var currentPage = 1;");
  js.push("var pageSize = 10;");
  js.push("var totalCount = 0;");
  js.push("var selectedKey = null;");
  js.push("var currentSession = null;");
  js.push("var currentMessages = [];");
  js.push("var agentSel = [];");
  js.push("var sourceSel = [];");
  js.push("var reqToken = 0;");
  js.push("var msgOffset = 0;");
  js.push("var msgTotal = 0;");
  js.push("var msgAllLoaded = false;");
  js.push("var msgLoading = false;");
  js.push("var oldestSeq = null;");
  js.push("var msgMode = 'desc';");
  js.push("var newestSeq = null;");
  js.push("var msgHighlight = null;");
  js.push("var currentMatchIdx = -1;");
  js.push("");
  js.push("function $(id){ return document.getElementById(id); }");
  js.push(`function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\"/g, '&quot;'); }`);
  js.push("function pad(n){ return (n < 10 ? '0' : '') + n; }");
  js.push("function fmt(ts){ if (!ts) return '-'; var d = new Date(ts); if (isNaN(d.getTime())) return '-'; return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }");
  js.push("function fmtTime(ts){ var f = fmt(ts); var p = f.split(' '); return p[1] || ''; }");
  js.push("function agentLabel(id){ return id || '\u672A\u77E5 Agent'; }");
  js.push("function sourceLabel(ch){ if (ch === 'feishu') return '\u98DE\u4E66'; if (ch === 'weixin') return '\u5FAE\u4FE1'; if (ch === 'webchat') return 'Web'; return ch || '-'; }");
  js.push("function catLabel(s){ return s && (s.is_group === 1 || s.is_group === true) ? '\u7FA4\u804A' : '\u5355\u804A'; }");
  js.push("function checkedValues(menu){ return Array.prototype.slice.call(menu.querySelectorAll('input:checked')).map(function(x){ return x.value; }); }");
  js.push("");
  js.push("function md(t){");
  js.push("  if (!t) return '';");
  js.push("  var s = esc(t);");
  js.push("  s = s.replace(/```([\\s\\S]*?)```/g, function(_, c){ return '<pre>' + c + '</pre>'; });");
  js.push("  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');");
  js.push("  s = s.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');");
  js.push("  s = s.replace(/\\n/g, '<br>');");
  js.push("  return s;");
  js.push("}");
  js.push("function toolCallCard(b){");
  js.push("  var name = b.name || 'tool';");
  js.push("  var args = b.arguments || b.input || {};");
  js.push("  var a = typeof args === 'string' ? args : JSON.stringify(args, null, 2);");
  js.push(`  return '<div class="toolcard"><div class="tname">\u{1F527} ' + esc(name) + '</div>' + (a && a !== '{}' ? '<pre>' + esc(a) + '</pre>' : '') + (b.id ? '<div style="color:var(--muted);font-size:11px;margin-top:4px">id: ' + esc(b.id) + '</div>' : '') + '</div>';`);
  js.push("}");
  js.push("function toolResultCard(msg, c){");
  js.push("  var text = '';");
  js.push("  if (typeof c === 'string') text = c;");
  js.push("  else if (Array.isArray(c)) { c.forEach(function(b){ if (typeof b === 'string') text += b + '\\n'; else if (b && b.type === 'text') text += b.text + '\\n'; }); }");
  js.push("  else { text = JSON.stringify(c, null, 2); }");
  js.push("  var isErr = msg.is_error === true || msg.is_error === 1;");
  js.push(`  return '<div class="toolcard' + (isErr ? ' err' : '') + '"><div class="tname">' + (isErr ? '\u26A0 ' : '') + esc(msg.tool_name || 'tool result') + '</div>' + (text ? '<pre>' + esc(text.substring(0, 8000)) + '</pre>' : '') + '</div>';`);
  js.push("}");
  js.push("function renderContent(msg){");
  js.push("  var c = msg.content_json;");
  js.push("  if (c == null || c === '') return '';");
  js.push(`  try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch (e) { return '<div class="bubble">' + esc(String(c)) + '</div>'; }`);
  js.push(`  if (typeof c === 'string') return '<div class="bubble">' + md(c) + '</div>';`);
  js.push("  if (Array.isArray(c)) {");
  js.push("    var out = '';");
  js.push("    c.forEach(function(b){");
  js.push(`      if (typeof b === 'string') { out += '<div class="bubble">' + md(b) + '</div>'; return; }`);
  js.push(`      if (typeof b === 'string') { out += '<div class="bubble">' + md(b) + '</div>'; return; }`);
  js.push(`      if (b.type === 'text') { out += '<div class="bubble">' + md(b.text || '') + '</div>'; return; }`);
  js.push(`      if (b.type === 'thinking') { out += '<details class="msg-collapse"><summary>\u{1F4AD} \u601D\u8003\u8FC7\u7A0B</summary><div class="thinking">' + esc(b.thinking || '') + '</div></details>'; return; }`);
  js.push(`      if (b.type === 'toolCall' || b.type === 'tool_use') { out += '<details class="msg-collapse"><summary>\u{1F527} \u8C03\u7528\u5DE5\u5177\uFF1A' + esc(b.name || 'tool') + '</summary>' + toolCallCard(b) + '</details>'; return; }`);
  js.push(`      if (b.type === 'image' || b.type === 'image_url') { var src = b.image_url && b.image_url.url ? b.image_url.url : (b.image_url || b.source || ''); if (src) out += '<img src="' + esc(src) + '" style="max-width:100%;border-radius:10px;margin:4px 0" />'; return; }`);
  js.push(`      out += '<div class="toolcard"><pre>' + esc(JSON.stringify(b, null, 2)) + '</pre></div>';`);
  js.push("    });");
  js.push("    return out;");
  js.push("  }");
  js.push("  if (msg.role === 'tool' || msg.role === 'toolResult') { return toolResultCard(msg, c); }");
  js.push(`  return '<div class="toolcard"><pre>' + esc(JSON.stringify(c, null, 2)) + '</pre></div>';`);
  js.push("}");
  js.push("function plainText(msg){");
  js.push("  var c = msg.content_json;");
  js.push("  if (c == null || c === '') return '';");
  js.push("  try { c = JSON.parse(c); } catch (e) { return String(c); }");
  js.push("  if (typeof c === 'string') return c;");
  js.push("  if (Array.isArray(c)) {");
  js.push("    var out = '';");
  js.push("    c.forEach(function(b){");
  js.push("      if (typeof b === 'string') out += b + '\\n';");
  js.push("      else if (b && b.type === 'text') out += (b.text || '') + '\\n';");
  js.push("      else if (b.type === 'toolCall' || b.type === 'tool_use') out += '[\u8C03\u7528\u5DE5\u5177 ' + (b.name || '') + ']\\n';");
  js.push("    });");
  js.push("    return out;");
  js.push("  }");
  js.push("  if (msg.role === 'tool' || msg.role === 'toolResult') {");
  js.push("    if (typeof c === 'string') return c;");
  js.push("    if (Array.isArray(c)) { var t = ''; c.forEach(function(b){ t += (typeof b === 'string' ? b : (b && b.text ? b.text : '')) + '\\n'; }); return t; }");
  js.push("    return JSON.stringify(c, null, 2);");
  js.push("  }");
  js.push("  return JSON.stringify(c, null, 2);");
  js.push("}");
  js.push("function renderMessage(msg){");
  js.push("  var role = msg.role || 'unknown';");
  js.push("  var isUser = (role === 'user'); var isTool = (role === 'toolResult' || role === 'tool');");
  js.push("  var cls = isUser ? 'bot' : 'user';");
  js.push("  var name, avatar;");
  js.push("  if (isUser) { name = (currentSession && (currentSession.sender_name || currentSession.label)) || '\u7528\u6237'; avatar = name.slice(-1); }");
  js.push("  else if (role === 'assistant') { name = agentLabel(currentSession && currentSession.agent_id); avatar = '\u{1F99E}'; }");
  js.push("  else { name = 'Tool'; avatar = '\u{1F527}'; }");
  js.push("  var body = renderContent(msg);");
  js.push(`  if (isTool) { body = '<details class=\\"msg-collapse\\"><summary>\u{1F527} ' + esc(msg.tool_name || '\u5DE5\u5177\u8C03\u7528\u7ED3\u679C') + ' \xB7 ' + fmtTime(msg.timestamp) + '</summary>' + body + '</details>'; }`);
  js.push(`  var html = '<article class=\\"message ' + cls + '\\">' + '<div class=\\"mavatar\\">' + esc(avatar) + '</div>' + '<div class=\\"mbody\\">' + '<div class=\\"mmeta\\"><strong>' + esc(name) + '</strong><span>' + fmtTime(msg.timestamp) + '</span></div>' + body + '</div>' + '</article>';`);
  js.push("  return html;");
  js.push("}");
  js.push("function renderMessages(msgs){");
  js.push(`  var html = '<div id="msgTop"></div>';`);
  js.push("  var lastDate = null;");
  js.push("  msgs.forEach(function(m){");
  js.push("    var d = fmt(m.timestamp).split(' ')[0];");
  js.push(`    if (d !== lastDate) { html += '<div class="date-divider"><span>' + esc(d) + '</span></div>'; lastDate = d; }`);
  js.push("    html += renderMessage(m);");
  js.push("  });");
  js.push(`  html += '<div id="msgBottom"></div>';`);
  js.push("  return html;");
  js.push("}");
  js.push(`async function jumpToTop(){ var box = $('messages'); if (!box) return; if (msgMode === 'asc') { box.scrollTop = 0; return; } msgMode = 'asc'; msgAllLoaded = false; newestSeq = null; currentMessages = []; msgOffset = 0; box.innerHTML = '<div class="loading"><div class="spinner"></div><br>\u52A0\u8F7D\u6700\u65E9\u6D88\u606F\u2026</div>'; await loadMoreMessages(); box.scrollTop = 0; }`);
  js.push("function renderTable(rows){");
  js.push("  var tbody = $('rows');");
  js.push("  if (!rows.length) { tbody.innerHTML = ''; $('empty').style.display = 'block'; $('rows').closest('table').style.display = 'none'; return; }");
  js.push("  $('empty').style.display = 'none';");
  js.push("  $('rows').closest('table').style.display = 'table';");
  js.push("  var html = '';");
  js.push("  rows.forEach(function(s){");
  js.push("    html += '<tr>';");
  js.push(`    html += '<td class="agent-cell" title="' + esc(s.agent_id || '-') + '">' + esc(s.agent_id || '-') + '</td>';`);
  js.push(`    html += '<td class="name-cell" title="' + esc(s.sender_name || s.label || '-') + '">' + esc(s.sender_name || s.label || '-') + '</td>';`);
  js.push(`    html += '<td class="title-cell" title="' + esc(s.display_name || '-') + '">' + esc(s.display_name || '-') + '</td>';`);
  js.push(`    html += '<td class="time">' + fmt(s.updated_at).split(' ')[0] + '<small>' + fmt(s.updated_at).split(' ')[1] + '</small></td>';`);
  js.push(`    html += '<td><span class="badge ' + (catLabel(s) === '\u7FA4\u804A' ? 'group' : 'single') + '">' + catLabel(s) + '</span></td>';`);
  js.push(`    html += '<td><span class="source">' + esc(sourceLabel(s.channel)) + '</span></td>';`);
  js.push(`    html += '<td><button class="detail" data-key="' + esc(s.session_key) + '">\u5BF9\u8BDD\u8BE6\u60C5 \u203A</button></td>';`);
  js.push("    html += '</tr>';");
  js.push("  });");
  js.push("  tbody.innerHTML = html;");
  js.push("  tbody.querySelectorAll('.detail').forEach(function(btn){");
  js.push("    btn.addEventListener('click', function(){ var key = btn.getAttribute('data-key'); if (key) openDrawer(key); });");
  js.push("  });");
  js.push("}");
  js.push("function updateAgentText(){");
  js.push("  var el = $('agentText');");
  js.push("  if (agentSel.length) { el.textContent = agentSel.map(agentLabel).join('\u3001'); el.classList.remove('muted'); }");
  js.push("  else { el.textContent = '\u8BF7\u9009\u62E9 Agent'; el.classList.add('muted'); }");
  js.push("}");
  js.push("function updateSourceText(){");
  js.push("  var el = $('sourceText');");
  js.push("  if (sourceSel.length) { el.textContent = sourceSel.map(sourceLabel).join('\u3001'); el.classList.remove('muted'); }");
  js.push("  else { el.textContent = '\u8BF7\u9009\u62E9\u6570\u636E\u6765\u6E90'; el.classList.add('muted'); }");
  js.push("}");
  js.push("function buildAgentMenu(){");
  js.push("  var menu = $('agentMenu');");
  js.push(`  if (!allAgents.length) { menu.innerHTML = '<label class="option"><input type="checkbox" value="main">main</label>'; }`);
  js.push(`  else { menu.innerHTML = allAgents.map(function(a){ return '<label class="option"><input type="checkbox" value="' + esc(a) + '"' + (agentSel.indexOf(a) >= 0 ? ' checked' : '') + '><span>' + esc(agentLabel(a)) + '</span></label>'; }).join(''); }`);
  js.push("  menu.onchange = function(){ agentSel = checkedValues(menu); updateAgentText(); };");
  js.push("}");
  js.push("async function loadAgents(){");
  js.push("  try { var res = await fetch(API + '/agents'); var data = await res.json(); allAgents = data.agents || []; buildAgentMenu(); }");
  js.push("  catch (e) { allAgents = ['main']; buildAgentMenu(); }");
  js.push("}");
  js.push("function buildSourceMenu(){");
  js.push("  var menu = $('sourceMenu');");
  js.push("  if (!allSources.length) { menu.innerHTML = ''; return; }");
  js.push(`  menu.innerHTML = allSources.map(function(c){ return '<label class="option"><input type="checkbox" value="' + esc(c) + '"' + (sourceSel.indexOf(c) >= 0 ? ' checked' : '') + '>' + esc(sourceLabel(c)) + '</label>'; }).join('');`);
  js.push("  menu.onchange = function(){ sourceSel = checkedValues(menu); updateSourceText(); };");
  js.push("}");
  js.push("async function loadSources(){");
  js.push("  try { var res = await fetch(API + '/sources'); var data = await res.json(); allSources = data.channels || []; buildSourceMenu(); }");
  js.push("  catch (e) { allSources = []; buildSourceMenu(); }");
  js.push("}");
  js.push("async function loadSessions(){");
  js.push("  var myToken = ++reqToken;");
  js.push("  var btn = $('searchBtn');");
  js.push("  btn.disabled = true; btn.textContent = '\u641C\u7D22\u4E2D\u2026';");
  js.push("  $('errorBox').style.display = 'none';");
  js.push("  var params = new URLSearchParams();");
  js.push("  var name = $('name').value.trim();");
  js.push("  if (name) params.set('search', name);");
  js.push("  if (agentSel.length) params.set('agentId', agentSel.join(','));");
  js.push("  if (sourceSel.length) params.set('channel', sourceSel.join(','));");
  js.push("  var start = $('startDate').value;");
  js.push("  var end = $('endDate').value;");
  js.push("  if (start && end && start > end) { alert('\u5F00\u59CB\u65E5\u671F\u4E0D\u80FD\u665A\u4E8E\u7ED3\u675F\u65E5\u671F'); btn.disabled = false; btn.textContent = '\u641C\u7D22'; return; }");
  js.push("  if (start) params.set('dateFrom', start);");
  js.push("  if (end) params.set('dateTo', end);");
  js.push("  params.set('sortBy', 'updated_at');");
  js.push("  params.set('sortDir', 'desc');");
  js.push("  params.set('offset', String((currentPage - 1) * pageSize));");
  js.push("  params.set('limit', String(pageSize));");
  js.push("  try {");
  js.push("    var res = await fetch(API + '/sessions?' + params.toString());");
  js.push("    if (!res.ok) throw new Error('HTTP ' + res.status);");
  js.push("    var data = await res.json();");
  js.push("    if (myToken !== reqToken) return;");
  js.push("    allSessions = data.sessions || [];");
  js.push("    totalCount = data.total || 0;");
  js.push("    renderTable(allSessions);");
  js.push("    updatePager();");
  js.push("  } catch (e) {");
  js.push("    if (myToken === reqToken) { $('errorBox').textContent = '\u67E5\u8BE2\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5'; $('errorBox').style.display = 'block'; }");
  js.push("  } finally {");
  js.push("    if (myToken === reqToken) { btn.disabled = false; btn.textContent = '\u641C\u7D22'; }");
  js.push("  }");
  js.push("}");
  js.push("function updatePager(){");
  js.push("  var totalPages = Math.max(1, Math.ceil(totalCount / pageSize));");
  js.push("  $('count').textContent = totalCount;");
  js.push("  $('pageInfo').textContent = '\u5171 ' + totalCount + ' \u6761 \xB7 \u7B2C ' + currentPage + '/' + totalPages + ' \u9875';");
  js.push("  $('prevBtn').disabled = currentPage <= 1;");
  js.push("  $('nextBtn').disabled = currentPage >= totalPages;");
  js.push("}");
  js.push("async function openDrawer(key){");
  js.push("  selectedKey = key;");
  js.push("  currentSession = allSessions.find(function(s){ return s.session_key === key; }) || null;");
  js.push("  $('layer').classList.add('open');");
  js.push("  document.body.style.overflow = 'hidden';");
  js.push("  if (currentSession) {");
  js.push("    $('meta').innerHTML = '<div><span>Agent</span><strong>' + esc(agentLabel(currentSession.agent_id)) + '</strong></div>' + '<div><span>\u7528\u6237</span><strong>' + esc(currentSession.sender_name || currentSession.label || '-') + '</strong></div>' + '<div><span>\u6765\u6E90</span><strong>' + esc(sourceLabel(currentSession.channel)) + '</strong></div>' + '<div><span>\u5206\u7C7B</span><strong>' + esc(catLabel(currentSession)) + '</strong></div>';");
  js.push("  }");
  js.push("  msgOffset = 0; msgAllLoaded = false; oldestSeq = null; newestSeq = null; msgMode = 'desc'; msgHighlight = null; currentMessages = [];");
  js.push("  $('messages').innerHTML = '';");
  js.push("  await loadMoreMessages();");
  js.push("  setupMsgScroll();");
  js.push("}");
  js.push("async function loadMoreMessages(){");
  js.push("  if (msgLoading || msgAllLoaded) return;");
  js.push("  msgLoading = true;");
  js.push("  var box = $('messages');");
  js.push(`  if (msgOffset === 0) { box.innerHTML = '<div class="loading"><div class="spinner"></div><br>\u52A0\u8F7D\u5BF9\u8BDD\u4E2D\u2026</div>'; }`);
  js.push("  else { var foot = document.createElement('div'); foot.className = 'loading'; foot.id = 'msgMore'; foot.innerHTML = '\u52A0\u8F7D\u66F4\u591A\u2026'; box.appendChild(foot); }");
  js.push("  try {");
  js.push("    var params = new URLSearchParams();");
  js.push("    params.set('key', selectedKey);");
  js.push("    params.set('limit', '30');");
  js.push("    if (msgMode === 'asc') { params.set('afterSeq', String(newestSeq == null ? 0 : newestSeq)); }");
  js.push("    else { if (oldestSeq != null) params.set('beforeSeq', String(oldestSeq)); }");
  js.push("    params.set('offset', String(msgOffset));");
  js.push("    var res = await fetch(API + '/messages?' + params.toString());");
  js.push("    if (!res.ok) throw new Error('HTTP ' + res.status);");
  js.push("    var data = await res.json();");
  js.push("    var msgs = data.messages || [];");
  js.push("    msgTotal = data.totalMessages || msgs.length;");
  js.push(`  if (msgs.length === 0 && msgOffset === 0) { box.innerHTML = '<div class="loading">\u8BE5\u4F1A\u8BDD\u6682\u65E0\u6D88\u606F</div>'; msgAllLoaded = true; msgLoading = false; return; }`);
  js.push("    if (msgs.length < 30) { msgAllLoaded = true; }");
  js.push("    var more = $('msgMore'); if (more) more.remove();");
  js.push("    if (msgMode === 'asc') {");
  js.push("      if (msgOffset === 0) { currentMessages = msgs; }");
  js.push("      else { currentMessages = currentMessages.concat(msgs); }");
  js.push("      var atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 2;");
  js.push("      box.innerHTML = renderMessages(currentMessages);");
  js.push("      if (msgOffset === 0) { box.scrollTop = 0; }");
  js.push("      else if (atBottom) { box.scrollTop = box.scrollHeight; }");
  js.push("      if (msgs.length && (newestSeq == null || msgs[msgs.length-1].seq > newestSeq)) newestSeq = msgs[msgs.length-1].seq;");
  js.push("    } else {");
  js.push("      if (msgOffset === 0) { currentMessages = msgs; }");
  js.push("      else { currentMessages = msgs.concat(currentMessages); }");
  js.push("      var fromBottom = box.scrollHeight - box.scrollTop;");
  js.push("      box.innerHTML = renderMessages(currentMessages);");
  js.push("      if (msgOffset === 0) { box.scrollTop = box.scrollHeight - box.clientHeight; }");
  js.push("      else { box.scrollTop = box.scrollHeight - fromBottom; }");
  js.push("      if (msgs.length && (oldestSeq == null || msgs[0].seq < oldestSeq)) oldestSeq = msgs[0].seq;");
  js.push("    }");
  js.push("    msgOffset += msgs.length;");
  js.push("  } catch (e) {");
  js.push("    var more = $('msgMore'); if (more) more.remove();");
  js.push(`    if (msgOffset === 0) { box.innerHTML = '<div class="loading" id="msgErr">\u52A0\u8F7D\u5931\u8D25\uFF1A' + esc(e.message) + '<br><button class="detail" id="retryBtn">\u91CD\u8BD5</button></div>'; var rb = $('retryBtn'); if (rb) rb.addEventListener('click', function(){ openDrawer(selectedKey); }); }`);
  js.push("  } finally {");
  js.push("    msgLoading = false;");
  js.push("  }");
  js.push("}");
  js.push("function setupMsgScroll(){");
  js.push("  var box = $('messages');");
  js.push("  box.onscroll = function(){");
  js.push("    if (msgLoading || msgAllLoaded) return;");
  js.push("    if (msgMode === 'asc') { if (box.scrollTop + box.clientHeight > box.scrollHeight - 80) { loadMoreMessages(); } }");
  js.push("    else { if (box.scrollTop < 80) { loadMoreMessages(); } }");
  js.push("  };");
  js.push("}");
  js.push("function closeDrawer(){");
  js.push("  $('layer').classList.remove('open');");
  js.push("  document.body.style.overflow = '';");
  js.push("  selectedKey = null;");
  js.push("}");
  js.push("function buildText(){");
  js.push("  if (!currentMessages.length) return '';");
  js.push("  var lines = [];");
  js.push("  currentMessages.forEach(function(m){");
  js.push("    var who = m.role === 'user' ? (currentSession ? (currentSession.sender_name || currentSession.label || '\u7528\u6237') : '\u7528\u6237') : (m.role === 'assistant' ? agentLabel(currentSession && currentSession.agent_id) : (m.tool_name || '\u5DE5\u5177'));");
  js.push("    lines.push(who + ' ' + fmtTime(m.timestamp) + '\\n' + plainText(m));");
  js.push("  });");
  js.push("  return lines.join('\\n\\n');");
  js.push("}");
  js.push("function fallbackCopy(text){");
  js.push("  var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();");
  js.push("  try { document.execCommand('copy'); } catch (e) {}");
  js.push("  ta.remove();");
  js.push("}");
  js.push("async function exportConv(){");
  js.push("  if (!selectedKey) return;");
  js.push("  var b = $('fabCopy'); b.disabled = true; var old = b.textContent; b.textContent = '\u5BFC\u51FA\u4E2D\u2026';");
  js.push("  try {");
  js.push("    var res = await fetch(API + '/export?key=' + encodeURIComponent(selectedKey));");
  js.push("    if (!res.ok) throw new Error('HTTP ' + res.status);");
  js.push("    var text = (await res.text()).replace(/^\\uFEFF/, '');");
  js.push("    var bytes = text.length;");
  js.push("    var copied = false;");
  js.push("    if (navigator.clipboard && navigator.clipboard.writeText) {");
  js.push("      try { await navigator.clipboard.writeText(text); copied = true; } catch (_) {}");
  js.push("    }");
  js.push("    if (!copied) { fallbackCopy(text); copied = true; }");
  js.push("    b.textContent = '\u5DF2\u590D\u5236 ' + bytes + ' \u5B57';");
  js.push("    setTimeout(function(){ b.textContent = old; b.disabled = false; }, 1800);");
  js.push("  } catch (e) {");
  js.push("    b.textContent = '\u5BFC\u51FA\u5931\u8D25';");
  js.push("    setTimeout(function(){ b.textContent = old; b.disabled = false; }, 2000);");
  js.push("  }");
  js.push("}");
  js.push("function toggleMenu(id){");
  js.push("  var m = $(id);");
  js.push("  var open = m.classList.contains('open');");
  js.push("  closeMenus();");
  js.push("  if (!open) m.classList.add('open');");
  js.push("}");
  js.push("function closeMenus(){");
  js.push("  $('agentMenu').classList.remove('open');");
  js.push("  $('sourceMenu').classList.remove('open');");
  js.push("}");
  js.push("function highlightMatches(container, query){");
  js.push("  var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);");
  js.push("  var nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);");
  js.push("  nodes.forEach(function(node){");
  js.push("    var txt = node.textContent; var lc = txt.toLowerCase();");
  js.push("    var idx = lc.indexOf(query); if (idx < 0) return;");
  js.push("    var frag = document.createDocumentFragment(); var last = 0;");
  js.push("    while (idx >= 0) {");
  js.push("      if (idx > last) frag.appendChild(document.createTextNode(txt.slice(last, idx)));");
  js.push("      var mk = document.createElement('mark'); mk.textContent = txt.slice(idx, idx + query.length); frag.appendChild(mk);");
  js.push("      last = idx + query.length; idx = lc.indexOf(query, last);");
  js.push("    }");
  js.push("    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));");
  js.push("    node.parentNode.replaceChild(frag, node);");
  js.push("  });");
  js.push("}");
  js.push("async function doMsgSearch(){");
  js.push("  var q = $('msgSearch').value.trim().toLowerCase();");
  js.push("  msgMode = 'desc'; msgAllLoaded = false; oldestSeq = null; newestSeq = null; msgOffset = 0; currentMessages = [];");
  js.push("  var count = $('searchCount'); var clear = $('searchClear');");
  js.push("  var box = $('messages');");
  js.push("  if (!q) {");
  js.push("    msgHighlight = null; count.textContent = ''; clear.style.display = 'none'; currentMatchIdx = -1;");
  js.push("    msgOffset = 0; msgAllLoaded = false; oldestSeq = null;");
  js.push("    loadMoreMessages().then(function(){ box.scrollTop = box.scrollHeight - box.clientHeight; });");
  js.push("    return;");
  js.push("  }");
  js.push("  msgHighlight = q; clear.style.display = 'inline-block';");
  js.push("  count.textContent = '\u641C\u7D22\u4E2D\u2026';");
  js.push("  try {");
  js.push("    var params = new URLSearchParams();");
  js.push("    params.set('key', selectedKey);");
  js.push("    params.set('search', q);");
  js.push("    params.set('limit', '200');");
  js.push("    var res = await fetch(API + '/messages?' + params.toString());");
  js.push("    if (!res.ok) throw new Error('HTTP ' + res.status);");
  js.push("    var data = await res.json();");
  js.push("    var msgsArr = data.messages || [];");
  js.push("    box.innerHTML = '';");
  js.push(`    if (msgsArr.length === 0) { box.innerHTML = '<div class=\\"loading\\">\u672A\u627E\u5230\u5339\u914D\u7684\u6D88\u606F</div>'; }`);
  js.push("    else { box.innerHTML = renderMessages(msgsArr); highlightMatches(box, q); }");
  js.push("    box.scrollTop = 0;");
  js.push("    count.textContent = msgsArr.length + ' \u6761\u5339\u914D';");
  js.push(`  } catch (e) { box.innerHTML = '<div class=\\"loading\\">\u641C\u7D22\u5931\u8D25\uFF1A' + esc(e.message) + '</div>'; count.textContent = ''; }`);
  js.push("}");
  js.push("function clearMsgSearch(){");
  js.push("  $('msgSearch').value = ''; doMsgSearch();");
  js.push("}");
  js.push("document.addEventListener('DOMContentLoaded', function(){");
  js.push("  var _ssr = document.getElementById('ssrControls'); if (_ssr) _ssr.style.display = 'none';");
  js.push("  $('sourceMenu').innerHTML = '';");
  js.push("  $('agentSelect').addEventListener('click', function(e){ e.stopPropagation(); toggleMenu('agentMenu'); });");
  js.push("  $('sourceSelect').addEventListener('click', function(e){ e.stopPropagation(); toggleMenu('sourceMenu'); });");
  js.push("  document.addEventListener('click', function(e){ if (!e.target.closest('.field')) closeMenus(); });");
  js.push("  $('searchBtn').addEventListener('click', function(e){ currentPage = 1; loadSessions(); });");
  js.push("  $('name').addEventListener('keydown', function(e){ if (e.key === 'Enter') { currentPage = 1; loadSessions(); } });");
  js.push("  $('resetBtn').addEventListener('click', function(){");
  js.push("    agentSel = []; sourceSel = [];");
  js.push("    $('name').value = ''; $('startDate').value = ''; $('endDate').value = '';");
  js.push("    Array.prototype.slice.call($('agentMenu').querySelectorAll('input')).forEach(function(x){ x.checked = false; });");
  js.push("    Array.prototype.slice.call($('sourceMenu').querySelectorAll('input')).forEach(function(x){ x.checked = false; });");
  js.push("    updateAgentText(); updateSourceText(); currentPage = 1; loadSessions();");
  js.push("  });");
  js.push("  $('prevBtn').addEventListener('click', function(){ if (currentPage > 1) { currentPage--; loadSessions(); } });");
  js.push("  $('nextBtn').addEventListener('click', function(){ currentPage++; loadSessions(); });");
  js.push("  $('pageSizeSel').addEventListener('change', function(){ pageSize = parseInt(this.value) || 10; currentPage = 1; loadSessions(); });");
  js.push("  $('closeBtn').addEventListener('click', closeDrawer);");
  js.push("  $('backdrop').addEventListener('click', closeDrawer);");
  js.push("  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeDrawer(); });");
  js.push("  $('fabCopy').addEventListener('click', exportConv);");
  js.push("  var jt = document.getElementById('jumpTop'); if (jt) jt.addEventListener('click', jumpToTop);");
  js.push("  updateAgentText();");
  js.push("  updateSourceText();");
  js.push("  loadAgents();");
  js.push("  loadSources();");
  js.push("  loadSessions();");
  js.push("  $('msgSearch').addEventListener('input', function(){ clearTimeout(this._timer); this._timer = setTimeout(doMsgSearch, 300); });");
  js.push("  $('msgSearch').addEventListener('keydown', function(e){ if (e.key === 'Enter') { clearTimeout(this._timer); doMsgSearch(); } });");
  js.push("  $('searchClear').addEventListener('click', clearMsgSearch);");
  js.push("});");
  return js.join("\n");
}
function buildListHtml(state) {
  const rowsHtml = (state && state.sessions ? state.sessions : []).map(function(s) {
    return rowHtml(s, state);
  }).join("");
  const lines = [];
  lines.push("<!DOCTYPE html>");
  lines.push('<html lang="zh-CN">');
  lines.push("<head>");
  lines.push('<meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width,initial-scale=1">');
  lines.push("<title>\u4F1A\u8BDD\u8BB0\u5F55\u7BA1\u7406</title>");
  lines.push("<style>");
  lines.push(CSS);
  lines.push(SSR_CSS);
  lines.push("</style>");
  lines.push("</head>");
  lines.push('<body class="page-list">');
  lines.push('<main class="app">');
  lines.push('  <header class="top">');
  lines.push("    <h1>\u4F1A\u8BDD\u8BB0\u5F55</h1>");
  lines.push("    <p>\u67E5\u627E\u5E76\u56DE\u6EAF Agent \u4E0E\u7528\u6237\u7684\u5386\u53F2\u5BF9\u8BDD</p>");
  lines.push("  </header>");
  lines.push('  <section class="card filters">');
  lines.push('    <div id="filters">');
  lines.push('      <div class="field">');
  lines.push("        <label>Agent</label>");
  lines.push('        <button type="button" class="control select" id="agentSelect"><span id="agentText" class="muted">\u8BF7\u9009\u62E9 Agent</span><span>\u2304</span></button>');
  lines.push('        <div class="menu" id="agentMenu"></div>');
  lines.push("      </div>");
  lines.push('      <div class="field">');
  lines.push('        <label for="name">\u59D3\u540D</label>');
  lines.push('        <div class="control input"><span>\u2315</span><input id="name" placeholder="\u8BF7\u8F93\u5165\u59D3\u540D"></div>');
  lines.push("      </div>");
  lines.push('      <div class="field">');
  lines.push("        <label>\u6570\u636E\u6765\u6E90</label>");
  lines.push('        <button type="button" class="control select" id="sourceSelect"><span id="sourceText" class="muted">\u8BF7\u9009\u62E9\u6570\u636E\u6765\u6E90</span><span>\u2304</span></button>');
  lines.push('        <div class="menu" id="sourceMenu"></div>');
  lines.push("      </div>");
  lines.push('      <div class="field date-field">');
  lines.push("        <label>\u65E5\u671F\u8303\u56F4</label>");
  lines.push('        <div class="range"><input id="startDate" class="control" type="date" aria-label="\u5F00\u59CB\u65E5\u671F"><span>\u81F3</span><input id="endDate" class="control" type="date" aria-label="\u7ED3\u675F\u65E5\u671F"></div>');
  lines.push("      </div>");
  lines.push('      <div class="buttons">');
  lines.push('        <button class="btn primary" type="button" id="searchBtn">\u2315 \u641C\u7D22</button>');
  lines.push('        <button class="btn secondary" type="button" id="resetBtn">\u91CD\u7F6E</button>');
  lines.push("      </div>");
  lines.push("    </div>");
  lines.push("  </section>");
  lines.push(ssrControlsHtml(state));
  lines.push('  <section class="card list-card">');
  lines.push('    <div class="heading">');
  lines.push('      <div><h2>\u67E5\u8BE2\u5217\u8868</h2><p>\u5171 <strong id="count">0</strong> \u6761\u4F1A\u8BDD\u8BB0\u5F55</p></div>');
  lines.push("    </div>");
  lines.push('    <div class="tablebox">');
  lines.push("      <table>");
  lines.push("        <thead><tr><th>Agent \u540D\u79F0</th><th>\u59D3\u540D</th><th>\u4F1A\u8BDD\u6807\u9898</th><th>\u5BF9\u8BDD\u65F6\u95F4</th><th>\u5BF9\u8BDD\u5206\u7C7B</th><th>\u6570\u636E\u6765\u6E90</th><th>\u64CD\u4F5C</th></tr></thead>");
  lines.push('        <tbody id="rows">' + rowsHtml + "</tbody>");
  lines.push("      </table>");
  lines.push('      <div class="empty" id="empty">\u2315<br><b>\u6682\u65E0\u5339\u914D\u8BB0\u5F55</b><br><small>\u8BF7\u8C03\u6574\u7B5B\u9009\u6761\u4EF6\u540E\u91CD\u65B0\u641C\u7D22</small></div>');
  lines.push("    </div>");
  lines.push('    <div class="error-banner" id="errorBox" style="display:none"></div>');
  lines.push('    <footer class="pager">');
  lines.push('      <span id="pageInfo">\u5171 0 \u6761 \xB7 \u7B2C 1/1 \u9875</span>');
  lines.push('      <select id="pageSizeSel" class="page-size">');
  lines.push('        <option value="10" selected>10 per page</option>');
  lines.push('        <option value="25">25 per page</option>');
  lines.push('        <option value="50">50 per page</option>');
  lines.push('        <option value="100">100 per page</option>');
  lines.push("      </select>");
  lines.push('      <div class="pg-controls">');
  lines.push('        <button id="prevBtn" disabled>\u2039</button>');
  lines.push('        <button id="nextBtn" disabled>\u203A</button>');
  lines.push("      </div>");
  lines.push("    </footer>");
  lines.push("  </section>");
  lines.push("</main>");
  lines.push('<div class="layer" id="layer">');
  lines.push('  <div class="backdrop" id="backdrop"></div>');
  lines.push('  <aside class="drawer">');
  lines.push('    <header class="drawer-head">');
  lines.push('      <div class="msg-search"><input type="search" id="msgSearch" placeholder="\u641C\u7D22\u6D88\u606F\u5173\u952E\u5B57\u2026"><span class="search-count" id="searchCount"></span><button class="search-clear" id="searchClear" style="display:none">\u2715</button></div>');
  lines.push('      <button class="close" id="closeBtn" aria-label="\u5173\u95ED">\xD7</button>');
  lines.push("    </header>");
  lines.push('    <div class="meta" id="meta"></div>');
  lines.push('    <div class="jump-nav" aria-label="\u6D88\u606F\u8DF3\u8F6C">');
  lines.push('      <button class="jump-btn" id="jumpTop" aria-label="\u5230\u6700\u65E9\u7684\u6D88\u606F">\u25B2</button>');
  lines.push("    </div>");
  lines.push('    <div class="messages" id="messages"></div>');
  lines.push('    <button class="fab" id="fabCopy" aria-label="\u590D\u5236\u5168\u6587\u5230\u526A\u8D34\u677F">\u2197 \u590D\u5236\u5168\u6587</button>');
  lines.push("  </aside>");
  lines.push("</div>");
  lines.push("");
  lines.push("<script>");
  lines.push(buildJs());
  lines.push("</script>");
  lines.push("</body>");
  lines.push("</html>");
  return lines.join("\n");
}
var SSR_CSS = ".ssr-controls{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);padding:14px 18px;margin-bottom:16px;display:flex;flex-direction:column;gap:10px;flex-shrink:0}.ssr-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ssr-label{color:var(--muted);font-size:13px;font-weight:700;min-width:54px}.ssr-chip{display:inline-block;padding:5px 12px;border:1px solid var(--field-border);border-radius:999px;color:#555;text-decoration:none;font-size:13px;background:var(--field)}.ssr-chip:hover{border-color:var(--teal);color:var(--teal)}.ssr-chip.active{background:var(--teal);color:#fff;border-color:var(--teal)}.ssr-page{display:inline-block;padding:6px 12px;border:1px solid var(--field-border);border-radius:8px;color:#555;text-decoration:none;font-size:13px}.ssr-page:hover{border-color:var(--teal);color:var(--teal)}.ssr-page.disabled{opacity:.4;pointer-events:none}.ssr-pginfo{color:var(--muted);font-size:13px;margin:0 6px}.ssr-note{color:var(--muted);font-size:12px;line-height:1.6}.detail{color:var(--teal);text-decoration:none;font-size:13px}.detail:hover{text-decoration:underline}";
function escHtml(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function pad2(n) {
  return (n < 10 ? "0" : "") + n;
}
function fmtTs(ts) {
  if (!ts) return "-";
  const d = new Date(typeof ts === "number" ? ts : Number(ts));
  if (isNaN(d.getTime())) return "-";
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
}
function fmtTimeShort(ts) {
  const f = fmtTs(ts);
  const p = f.split(" ");
  return p[1] || "";
}
function agentLabelTs(id) {
  return id || "\u672A\u77E5 Agent";
}
function sourceLabelTs(ch) {
  if (ch === "feishu") return "\u98DE\u4E66";
  if (ch === "weixin") return "\u5FAE\u4FE1";
  if (ch === "webchat") return "Web";
  return ch || "-";
}
function catLabelTs(s) {
  return s && (s.is_group === 1 || s.is_group === true) ? "\u7FA4\u804A" : "\u5355\u804A";
}
function mdText(t) {
  if (!t) return "";
  let s = escHtml(t);
  s = s.replace(/```([\s\S]*?)```/g, function(_, c) {
    return "<pre>" + c + "</pre>";
  });
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\n/g, "<br>");
  return s;
}
function toolCallCardTs(b) {
  const name = b.name || "tool";
  const args = b.arguments || b.input || {};
  const a = typeof args === "string" ? args : JSON.stringify(args, null, 2);
  return '<div class="toolcard"><div class="tname">\u{1F527} ' + escHtml(name) + "</div>" + (a && a !== "{}" ? "<pre>" + escHtml(a) + "</pre>" : "") + (b.id ? '<div style="color:var(--muted);font-size:11px;margin-top:4px">id: ' + escHtml(b.id) + "</div>" : "") + "</div>";
}
function toolResultCardTs(msg, c) {
  let text = "";
  if (typeof c === "string") text = c;
  else if (Array.isArray(c)) {
    c.forEach(function(b) {
      if (typeof b === "string") text += b + "\n";
      else if (b && b.type === "text") text += b.text + "\n";
    });
  } else {
    text = JSON.stringify(c, null, 2);
  }
  const isErr = msg.is_error === true || msg.is_error === 1;
  return '<div class="toolcard' + (isErr ? " err" : "") + '"><div class="tname">' + (isErr ? "\u26A0 " : "") + escHtml(msg.tool_name || "tool result") + "</div>" + (text ? "<pre>" + escHtml(text.substring(0, 8e3)) + "</pre>" : "") + "</div>";
}
function renderContentHtml(cj, msg) {
  if (cj == null || cj === "") return "";
  let c;
  try {
    c = JSON.parse(cj);
    if (typeof c === "string") c = JSON.parse(c);
  } catch {
    return '<div class="bubble">' + escHtml(String(cj)) + "</div>";
  }
  if (typeof c === "string") return '<div class="bubble">' + mdText(c) + "</div>";
  if (Array.isArray(c)) {
    return c.map(function(b) {
      if (typeof b === "string") return '<div class="bubble">' + mdText(b) + "</div>";
      if (b.type === "text") return '<div class="bubble">' + mdText(b.text || "") + "</div>";
      if (b.type === "thinking") return '<details class="msg-collapse"><summary>\u{1F4AD} \u601D\u8003\u8FC7\u7A0B</summary><div class="thinking">' + escHtml(b.thinking || "") + "</div></details>";
      if (b.type === "toolCall" || b.type === "tool_use") return '<details class="msg-collapse"><summary>\u{1F527} \u8C03\u7528\u5DE5\u5177\uFF1A' + escHtml(b.name || "tool") + "</summary>" + toolCallCardTs(b) + "</details>";
      if (b.type === "image" || b.type === "image_url") {
        const src = b.image_url && b.image_url.url ? b.image_url.url : b.image_url || b.source || "";
        return src ? '<img src="' + escHtml(src) + '" style="max-width:100%;border-radius:10px;margin:4px 0">' : "";
      }
      return '<div class="toolcard"><pre>' + escHtml(JSON.stringify(b, null, 2)) + "</pre></div>";
    }).join("");
  }
  if (msg.role === "tool" || msg.role === "toolResult") return toolResultCardTs(msg, c);
  return '<div class="toolcard"><pre>' + escHtml(JSON.stringify(c, null, 2)) + "</pre></div>";
}
function renderMessageHtml(m) {
  const role = m.role || "unknown";
  const isUser = role === "user";
  const isTool = role === "tool" || role === "toolResult";
  const cls = isUser ? "user" : "bot";
  let name = "", avatar = "";
  if (isUser) {
    name = m.sender_name || m.label || "\u7528\u6237";
    avatar = String(name).slice(-1);
  } else if (role === "assistant") {
    name = agentLabelTs(m.agent_id);
    avatar = "\u{1F99E}";
  } else {
    name = "Tool";
    avatar = "\u{1F527}";
  }
  let body = renderContentHtml(m.content_json, m);
  if (isTool) body = '<details class="msg-collapse"><summary>\u{1F527} ' + escHtml(m.tool_name || "\u5DE5\u5177\u8C03\u7528\u7ED3\u679C") + " \xB7 " + fmtTimeShort(m.timestamp) + "</summary>" + body + "</details>";
  return '<article class="message ' + cls + '"><div class="mavatar">' + escHtml(avatar) + '</div><div class="mbody"><div class="mmeta"><strong>' + escHtml(name) + "</strong><span>" + fmtTimeShort(m.timestamp) + "</span></div>" + body + "</div></article>";
}
function renderMessagesHtml(msgs) {
  let html = '<div id="msgTop"></div>';
  let lastDate = "";
  msgs.forEach(function(m) {
    const d = fmtTs(m.timestamp).split(" ")[0];
    if (d && d !== lastDate) {
      html += '<div class="date-divider"><span>' + escHtml(d) + "</span></div>";
      lastDate = d;
    }
    html += renderMessageHtml(m);
  });
  html += '<div id="msgBottom"></div>';
  return html;
}
function rowHtml(s, _state) {
  const key = encodeURIComponent(s.session_key);
  return '<tr><td class="agent-cell" title="' + escHtml(s.agent_id || "-") + '">' + escHtml(s.agent_id || "-") + '</td><td class="name-cell" title="' + escHtml(s.sender_name || s.label || "-") + '">' + escHtml(s.sender_name || s.label || "-") + '</td><td class="title-cell" title="' + escHtml(s.display_name || "-") + '">' + escHtml(s.display_name || "-") + '</td><td class="time">' + fmtTs(s.updated_at).split(" ")[0] + "<small>" + fmtTs(s.updated_at).split(" ")[1] + '</small></td><td><span class="badge ' + (catLabelTs(s) === "\u7FA4\u804A" ? "group" : "single") + '">' + catLabelTs(s) + '</span></td><td><span class="source">' + escHtml(sourceLabelTs(s.channel)) + '</span></td><td><a class="detail" href="?session=' + key + '">\u5BF9\u8BDD\u8BE6\u60C5 \u203A</a></td></tr>';
}
function ssrControlsHtml(state) {
  const f = state.filters || {};
  const buildHref = function(over) {
    const p = new URLSearchParams();
    if (f.search) p.set("search", f.search);
    if (over.agent) p.set("agent", over.agent);
    else if (f.agentId) p.set("agent", f.agentId);
    if (over.channel) p.set("channel", over.channel);
    else if (f.channel) p.set("channel", f.channel);
    if (f.dateFrom) p.set("dateFrom", f.dateFrom);
    if (f.dateTo) p.set("dateTo", f.dateTo);
    if (over.page) p.set("page", String(over.page));
    else if (state.page && state.page > 1) p.set("page", String(state.page));
    return "?" + p.toString();
  };
  const agentChips = (state.agents || []).map(function(a) {
    const active = f.agentId === a ? " active" : "";
    return '<a class="ssr-chip' + active + '" href="' + escHtml(buildHref({ agent: a })) + '">' + escHtml(agentLabelTs(a)) + "</a>";
  }).join("");
  const chanChips = (state.channels || []).map(function(c) {
    const active = f.channel === c ? " active" : "";
    return '<a class="ssr-chip' + active + '" href="' + escHtml(buildHref({ channel: c })) + '">' + escHtml(sourceLabelTs(c)) + "</a>";
  }).join("");
  const total = state.total || 0;
  const page = state.page || 1;
  const pageSize = state.pageSize || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pager = '<a class="ssr-page' + (page <= 1 ? " disabled" : "") + '" href="' + escHtml(buildHref({ page: page - 1 })) + '">\u2039 \u4E0A\u4E00\u9875</a><span class="ssr-pginfo">\u7B2C ' + page + "/" + totalPages + " \u9875 \xB7 \u5171 " + total + ' \u6761</span><a class="ssr-page' + (page >= totalPages ? " disabled" : "") + '" href="' + escHtml(buildHref({ page: page + 1 })) + '">\u4E0B\u4E00\u9875 \u203A</a>';
  return '<div id="ssrControls" class="ssr-controls"><div class="ssr-row"><span class="ssr-label">Agent\uFF1A</span><a class="ssr-chip' + (f.agentId ? "" : " active") + '" href="' + escHtml(buildHref({ agent: "" })) + '">\u5168\u90E8</a>' + agentChips + '</div><div class="ssr-row"><span class="ssr-label">\u6765\u6E90\uFF1A</span><a class="ssr-chip' + (f.channel ? "" : " active") + '" href="' + escHtml(buildHref({ channel: "" })) + '">\u5168\u90E8</a>' + chanChips + '</div><div class="ssr-row"><span class="ssr-label">\u5206\u9875\uFF1A</span>' + pager + '</div><div class="ssr-note">\u7CBE\u7B80\u6D4F\u89C8\u6A21\u5F0F\uFF1A\u5F53\u524D\u4E3A\u6C99\u76D2\u7981\u7528\u811A\u672C\u72B6\u6001\uFF0C\u5217\u8868 / \u7FFB\u9875 / \u7B5B\u9009 / \u8FDB\u5165\u8BE6\u60C5 / \u5BFC\u51FA\u5747\u53EF\u6B63\u5E38\u4F7F\u7528\uFF1B\u5207\u6362\u83DC\u5355\u540E\u91CD\u8F7D\u5373\u53EF\u542F\u7528\u641C\u7D22\u4E0E\u6D88\u606F\u5185\u67E5\u627E\u3002</div></div>';
}
function buildDetailHtml(state) {
  const s = state.session;
  const msgs = state.messages || [];
  const msearch = state.msearch;
  const key = encodeURIComponent(s.session_key);
  const L = [];
  L.push("<!DOCTYPE html>");
  L.push('<html lang="zh-CN">');
  L.push("<head>");
  L.push('<meta charset="UTF-8">');
  L.push('<meta name="viewport" content="width=device-width,initial-scale=1">');
  L.push("<title>\u5BF9\u8BDD\u8BE6\u60C5 \xB7 " + escHtml(s.display_name || s.sender_name || s.session_id || "\u4F1A\u8BDD") + "</title>");
  L.push("<style>");
  L.push(CSS);
  L.push(SSR_CSS);
  L.push("</style>");
  L.push("</head>");
  L.push('<body class="page-detail">');
  L.push('<main class="app">');
  L.push('  <header class="top"><div class="head-row"><div class="head-left"><h1>\u5BF9\u8BDD\u8BE6\u60C5</h1><p>' + escHtml(s.display_name || "-") + '</p></div><div class="head-right"><a class="btn secondary" href="?">\u2190 \u8FD4\u56DE\u5217\u8868</a><a class="btn primary" href="?session=' + key + '&dl=1">\u21A7 \u5BFC\u51FA</a></div></div></header>');
  L.push('  <section class="card" style="padding:18px 20px;margin-bottom:16px"><div style="display:flex;gap:28px;flex-wrap:wrap">');
  L.push('    <div style="display:flex;flex-direction:column;gap:2px"><span style="color:var(--muted);font-size:12px">Agent</span><strong>' + escHtml(s.agent_id || "\u672A\u77E5") + "</strong></div>");
  L.push('    <div style="display:flex;flex-direction:column;gap:2px"><span style="color:var(--muted);font-size:12px">\u7528\u6237</span><strong>' + escHtml(s.sender_name || s.label || "-") + "</strong></div>");
  L.push('    <div style="display:flex;flex-direction:column;gap:2px"><span style="color:var(--muted);font-size:12px">\u6765\u6E90</span><strong>' + escHtml(sourceLabelTs(s.channel)) + "</strong></div>");
  L.push('    <div style="display:flex;flex-direction:column;gap:2px"><span style="color:var(--muted);font-size:12px">\u5206\u7C7B</span><strong>' + escHtml(catLabelTs(s)) + "</strong></div>");
  L.push("  </div></section>");
  L.push('  <form class="card" style="display:flex;gap:10px;align-items:center;padding:12px 16px;margin-bottom:16px" method="get" action="">');
  L.push('    <input type="hidden" name="session" value="' + key + '">');
  L.push('    <input type="search" name="msearch" placeholder="\u641C\u7D22\u6D88\u606F\u5173\u952E\u5B57\u2026" value="' + escHtml(msearch || "") + '" style="flex:1;height:38px;border:1px solid var(--field-border);border-radius:9px;padding:0 12px">');
  L.push('    <button class="btn primary" type="submit">\u641C\u7D22</button>');
  L.push('    <a class="btn secondary" href="?session=' + key + '">\u6E05\u9664</a>');
  L.push("  </form>");
  L.push('  <section class="card"><div class="tablebox"><div class="messages" style="max-height:none;padding:18px 20px">');
  if (!msgs.length) L.push('<div class="loading">\u8BE5\u4F1A\u8BDD\u6682\u65E0\u6D88\u606F</div>');
  else L.push(renderMessagesHtml(msgs));
  L.push("  </div></div></section>");
  L.push('  <div class="jump-nav" aria-label="\u6D88\u606F\u8DF3\u8F6C">');
  L.push('    <a class="jump-btn" href="#msgTop" aria-label="\u5230\u6700\u65E9\u7684\u6D88\u606F">\u25B2</a>');
  L.push("  </div>");
  L.push("</main>");
  L.push("</body>");
  L.push("</html>");
  return L.join("\n");
}
function plainTextTs(m) {
  const cj = m.content_json;
  if (cj == null || cj === "") return "";
  let c;
  try {
    c = JSON.parse(cj);
  } catch {
    return String(cj);
  }
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    let out = "";
    c.forEach(function(b) {
      if (typeof b === "string") out += b + "\n";
      else if (b && b.type === "text") out += (b.text || "") + "\n";
      else if (b.type === "toolCall" || b.type === "tool_use") out += "[\u8C03\u7528\u5DE5\u5177 " + (b.name || "") + "]\n";
    });
    return out;
  }
  if (m.role === "tool" || m.role === "toolResult") {
    if (typeof c === "string") return c;
    if (Array.isArray(c)) {
      let t = "";
      c.forEach(function(b) {
        t += (typeof b === "string" ? b : b && b.text ? b.text : "") + "\n";
      });
      return t;
    }
    return JSON.stringify(c, null, 2);
  }
  return JSON.stringify(c, null, 2);
}
function buildExportText(session, messages) {
  const lines = [];
  lines.push("\u4F1A\u8BDD\uFF1A" + (session.display_name || session.sender_name || session.session_id || ""));
  lines.push("Agent\uFF1A" + (session.agent_id || ""));
  lines.push("\u6765\u6E90\uFF1A" + sourceLabelTs(session.channel) + "  \u5206\u7C7B\uFF1A" + catLabelTs(session));
  lines.push("");
  messages.forEach(function(m) {
    const who = m.role === "user" ? session.sender_name || session.label || "\u7528\u6237" : m.role === "assistant" ? session.agent_id || "Assistant" : m.tool_name || "\u5DE5\u5177";
    lines.push(who + " " + fmtTimeShort(m.timestamp));
    lines.push(plainTextTs(m));
    lines.push("");
  });
  return lines.join("\n");
}
function renderListPage(state) {
  return buildListHtml(state);
}
function renderDetailPage(state) {
  return buildDetailHtml(state);
}

// index.ts
var dbInstance = null;
var syncTimer = null;
function resolveExtensionDir() {
  let dir = path3.dirname(fileURLToPath(import.meta.url));
  while (dir !== path3.dirname(dir)) {
    if (fs3.existsSync(path3.join(dir, "openclaw.plugin.json"))) return dir;
    dir = path3.dirname(dir);
  }
  return path3.dirname(fileURLToPath(import.meta.url));
}
function resolveDbPath() {
  return path3.join(resolveExtensionDir(), "data", "session-admin.db");
}
function getDb(_stateDir) {
  if (!dbInstance) {
    const dbPath = resolveDbPath();
    dbInstance = openSessionAdminDb(dbPath);
  }
  return dbInstance;
}
function registerInboundClaimHook(api) {
  const a = api;
  a.on("inbound_claim", async (event, ctx) => {
    const ev = event;
    const c = ctx;
    if (!ev.senderName || !c.sessionKey) return;
    const isGroup = !!ev.isGroup;
    try {
      if (!isGroup) {
        const entry = a.runtime.agent.session.getSessionEntry({ sessionKey: c.sessionKey });
        if (!entry?.label) {
          await a.runtime.agent.session.patchSessionEntry({
            sessionKey: c.sessionKey,
            preserveActivity: true,
            update: () => ({ label: ev.senderName })
          });
        }
      }
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
            updated_at: Date.now()
          });
        }
      } catch {
      }
    } catch {
    }
  });
}
function extractSessionId(api, sessionKey) {
  try {
    const entry = api.runtime.agent.session.getSessionEntry({ sessionKey });
    return entry?.sessionId ?? null;
  } catch {
    return null;
  }
}
function syncSessionRegistry(api) {
  const a = api;
  const db = getDb();
  const stateDir = resolveStateDir();
  const agentIds = listAgentDirs(stateDir);
  for (const agentId of agentIds) {
    try {
      const entries = a.runtime.agent.session.listSessionEntries({ agentId });
      for (const { sessionKey, entry } of entries) {
        if (!entry.sessionId) continue;
        const now = Date.now();
        const lastActivity = entry.lastActivityAt ?? 0;
        let status = "idle";
        if (lastActivity && now - lastActivity < 5 * 60 * 1e3) {
          status = "active";
        } else if (entry.category === "finished") {
          status = "finished";
        } else if (entry.category === "stopped") {
          status = "stopped";
        }
        const senderName = computeSenderName(sessionKey, entry.origin?.label);
        upsertSession(db, {
          session_key: sessionKey,
          session_id: entry.sessionId,
          agent_id: extractAgentIdFromSessionKey(sessionKey),
          label: entry.label ?? void 0,
          display_name: computeDisplayName(sessionKey, entry.displayName, senderName),
          channel: channelFromSessionKey(sessionKey),
          sender_name: senderName,
          is_group: reconcileIsGroup(sessionKey),
          status,
          updated_at: entry.updatedAt ?? now
        });
      }
    } catch {
    }
  }
}
function createAdminPageHandler(api) {
  return async (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;
    if (pathname !== "/plugins/session-admin" && pathname !== "/plugins/session-admin/") {
      return false;
    }
    const params = url.searchParams;
    const db = getDb();
    const sessionKey = params.get("session");
    if (sessionKey) {
      const session = getSession(db, sessionKey);
      if (session) {
        try {
          await syncSessionTranscript(db, sessionKey, session.session_id);
          const g = reconcileIsGroup(sessionKey);
          upsertSession(db, { session_key: sessionKey, session_id: session.session_id, is_group: g });
        } catch {
        }
      }
      const detail = getSession(db, sessionKey);
      if (!detail) {
        res.statusCode = 404;
        res.setHeader("content-type", "text/html; charset=utf-8");
        res.end('<!DOCTYPE html><meta charset="utf-8"><title>\u672A\u627E\u5230</title><body style="font-family:sans-serif;padding:40px">\u672A\u627E\u5230\u8BE5\u4F1A\u8BDD\uFF0C\u53EF\u80FD\u5C1A\u672A\u540C\u6B65\u3002<br><a href="?">\u8FD4\u56DE\u5217\u8868</a></body>');
        return true;
      }
      const msearch = params.get("msearch")?.trim() || void 0;
      const result = getMessages(db, sessionKey, 300, void 0, msearch);
      if (params.get("dl") === "1") {
        const text = buildExportText(detail, result.messages);
        res.statusCode = 200;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.setHeader("content-disposition", 'attachment; filename="conversation_' + encodeURIComponent(sessionKey) + '.txt"');
        res.end(text);
        return true;
      }
      const html2 = renderDetailPage({ session: detail, messages: result.messages, msearch });
      res.statusCode = 200;
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.setHeader("cache-control", "no-store, max-age=0");
      res.end(html2);
      return true;
    }
    try {
      syncSessionRegistry(api);
    } catch {
    }
    const search = params.get("search")?.trim() || void 0;
    const agentId = params.get("agent")?.trim() || void 0;
    const channel = params.get("channel")?.trim() || void 0;
    const dateFrom = params.get("dateFrom")?.trim() || void 0;
    const dateTo = params.get("dateTo")?.trim() || void 0;
    const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    const list = listSessions(db, {
      search,
      agentId,
      channel,
      dateFrom,
      dateTo,
      sortBy: "updated_at",
      sortDir: "desc",
      offset,
      limit: pageSize
    });
    const agents = listAgentIds(db);
    const channels = listChannels(db);
    const html = renderListPage({
      sessions: list.sessions,
      total: list.total,
      page,
      pageSize,
      agents,
      channels,
      filters: { search, agentId, channel, dateFrom, dateTo }
    });
    res.statusCode = 200;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("cache-control", "no-store, max-age=0");
    res.end(html);
    return true;
  };
}
function createAdminApiHandler(api) {
  return async (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return true;
    }
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
    if (pathname === "/plugins/session-admin/api/sessions" && req.method === "GET") {
      try {
        const db = getDb();
        syncSessionRegistry(api);
        const search = url.searchParams.get("search")?.trim() || void 0;
        const agentId = url.searchParams.get("agentId")?.trim() || void 0;
        const status = url.searchParams.get("status") || void 0;
        const channel = url.searchParams.get("channel")?.trim() || void 0;
        const dateFrom = url.searchParams.get("dateFrom")?.trim() || void 0;
        const dateTo = url.searchParams.get("dateTo")?.trim() || void 0;
        const sortBy = url.searchParams.get("sortBy") || "updated_at";
        const sortDir = url.searchParams.get("sortDir") || "desc";
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
          limit
        });
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          sessions: result.sessions.map((s) => ({
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
            message_count: s.message_count
          })),
          total: result.total
        }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: String(err) }));
      }
      return true;
    }
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
        const session = getSession(db, key);
        if (!session) {
          syncSessionRegistry(api);
        }
        const currentSession = getSession(db, key);
        if (currentSession) {
          try {
            await syncSessionTranscript(db, key, currentSession.session_id);
            const g = reconcileIsGroup(key);
            upsertSession(db, {
              session_key: key,
              session_id: currentSession.session_id,
              is_group: g
            });
          } catch {
          }
        }
        const beforeSeq = url.searchParams.get("beforeSeq")?.trim();
        const before = beforeSeq ? parseInt(beforeSeq, 10) : void 0;
        const afterSeq = url.searchParams.get("afterSeq")?.trim();
        const after = afterSeq ? parseInt(afterSeq, 10) : void 0;
        const search = url.searchParams.get("search")?.trim() || void 0;
        const result = getMessages(db, key, limit, before, search, after);
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
            parent_id: m.parent_id
          })),
          totalMessages: result.total,
          sessionKey: key
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.statusCode = 200;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          messages: [],
          totalMessages: 0,
          error: `Failed to read messages: ${message}`
        }));
      }
      return true;
    }
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
        try {
          await syncSessionTranscript(db, key, session.session_id);
          const g = reconcileIsGroup(key);
          upsertSession(db, {
            session_key: key,
            session_id: session.session_id,
            is_group: g
          });
        } catch {
        }
        const result = getMessages(db, key, 1e5);
        const text = buildExportText(session, result.messages);
        const displayName = session.display_name || session.sender_name || "\u4F1A\u8BDD";
        const safeName = displayName.replace(/[\\/:*?"<>|\r\n\t]+/g, "_").slice(0, 60);
        const filename = `\u4F1A\u8BDD\u8BB0\u5F55_${safeName}_${Date.now()}.txt`;
        const asciiName = (displayName || "export").replace(/[^\x20-\x7E]+/g, "_").slice(0, 60) || "export";
        const asciiFilename = `session_${asciiName}_${Date.now()}.txt`;
        res.statusCode = 200;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.setHeader(
          "content-disposition",
          `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
        );
        res.end("\uFEFF" + text);
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
function startBackgroundSync(api, intervalMinutes = 5) {
  if (syncTimer) return;
  const doSync = async () => {
    try {
      const db = getDb();
      syncSessionRegistry(api);
      await syncAllSessions(db);
    } catch {
    }
  };
  setTimeout(doSync, 2e3);
  syncTimer = setInterval(doSync, intervalMinutes * 60 * 1e3);
}
var index_default = definePluginEntry({
  id: "session-label-from-sender",
  name: "Session Label from Sender",
  description: "Auto-label sessions with sender name across all channels, plus a session admin WebUI with SQLite-backed search, filtering, and conversation viewing.",
  register(api) {
    registerInboundClaimHook(api);
    const a = api;
    a.session.controls.registerControlUiDescriptor({
      surface: "tab",
      id: "admin",
      label: "\u4F1A\u8BDD\u7BA1\u7406",
      description: "\u6D4F\u89C8\u3001\u641C\u7D22\u548C\u67E5\u770B\u6240\u6709\u4F1A\u8BDD\u8BB0\u5F55",
      path: "/plugins/session-admin",
      icon: "search",
      group: "control",
      order: 3
    });
    a.registerHttpRoute({
      path: "/plugins/session-admin",
      auth: "plugin",
      match: "exact",
      handler: createAdminPageHandler(api)
    });
    a.registerHttpRoute({
      path: "/plugins/session-admin/api",
      auth: "plugin",
      match: "prefix",
      handler: createAdminApiHandler(api)
    });
    startBackgroundSync(api, 5);
  }
});
export {
  index_default as default
};
