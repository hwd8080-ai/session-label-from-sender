var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../.workbuddy/binaries/node/workspace/node_modules/punycode.js/punycode.js
var require_punycode = __commonJS({
  "../../.workbuddy/binaries/node/workspace/node_modules/punycode.js/punycode.js"(exports, module) {
    "use strict";
    var maxInt = 2147483647;
    var base = 36;
    var tMin = 1;
    var tMax = 26;
    var skew = 38;
    var damp = 700;
    var initialBias = 72;
    var initialN = 128;
    var delimiter = "-";
    var regexPunycode = /^xn--/;
    var regexNonASCII = /[^\0-\x7F]/;
    var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
    var errors = {
      "overflow": "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    };
    var baseMinusTMin = base - tMin;
    var floor = Math.floor;
    var stringFromCharCode = String.fromCharCode;
    function error(type) {
      throw new RangeError(errors[type]);
    }
    function map(array, callback) {
      const result = [];
      let length = array.length;
      while (length--) {
        result[length] = callback(array[length]);
      }
      return result;
    }
    function mapDomain(domain, callback) {
      const parts = domain.split("@");
      let result = "";
      if (parts.length > 1) {
        result = parts[0] + "@";
        domain = parts[1];
      }
      domain = domain.replace(regexSeparators, ".");
      const labels = domain.split(".");
      const encoded = map(labels, callback).join(".");
      return result + encoded;
    }
    function ucs2decode(string) {
      const output = [];
      let counter = 0;
      const length = string.length;
      while (counter < length) {
        const value = string.charCodeAt(counter++);
        if (value >= 55296 && value <= 56319 && counter < length) {
          const extra = string.charCodeAt(counter++);
          if ((extra & 64512) == 56320) {
            output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }
      return output;
    }
    var ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
    var basicToDigit = function(codePoint) {
      if (codePoint >= 48 && codePoint < 58) {
        return 26 + (codePoint - 48);
      }
      if (codePoint >= 65 && codePoint < 91) {
        return codePoint - 65;
      }
      if (codePoint >= 97 && codePoint < 123) {
        return codePoint - 97;
      }
      return base;
    };
    var digitToBasic = function(digit, flag) {
      return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    };
    var adapt = function(delta, numPoints, firstTime) {
      let k = 0;
      delta = firstTime ? floor(delta / damp) : delta >> 1;
      delta += floor(delta / numPoints);
      for (; delta > baseMinusTMin * tMax >> 1; k += base) {
        delta = floor(delta / baseMinusTMin);
      }
      return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    };
    var decode2 = function(input) {
      const output = [];
      const inputLength = input.length;
      let i = 0;
      let n = initialN;
      let bias = initialBias;
      let basic = input.lastIndexOf(delimiter);
      if (basic < 0) {
        basic = 0;
      }
      for (let j = 0; j < basic; ++j) {
        if (input.charCodeAt(j) >= 128) {
          error("not-basic");
        }
        output.push(input.charCodeAt(j));
      }
      for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
        const oldi = i;
        for (let w = 1, k = base; ; k += base) {
          if (index >= inputLength) {
            error("invalid-input");
          }
          const digit = basicToDigit(input.charCodeAt(index++));
          if (digit >= base) {
            error("invalid-input");
          }
          if (digit > floor((maxInt - i) / w)) {
            error("overflow");
          }
          i += digit * w;
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (digit < t) {
            break;
          }
          const baseMinusT = base - t;
          if (w > floor(maxInt / baseMinusT)) {
            error("overflow");
          }
          w *= baseMinusT;
        }
        const out = output.length + 1;
        bias = adapt(i - oldi, out, oldi == 0);
        if (floor(i / out) > maxInt - n) {
          error("overflow");
        }
        n += floor(i / out);
        i %= out;
        output.splice(i++, 0, n);
      }
      return String.fromCodePoint(...output);
    };
    var encode2 = function(input) {
      const output = [];
      input = ucs2decode(input);
      const inputLength = input.length;
      let n = initialN;
      let delta = 0;
      let bias = initialBias;
      for (const currentValue of input) {
        if (currentValue < 128) {
          output.push(stringFromCharCode(currentValue));
        }
      }
      const basicLength = output.length;
      let handledCPCount = basicLength;
      if (basicLength) {
        output.push(delimiter);
      }
      while (handledCPCount < inputLength) {
        let m = maxInt;
        for (const currentValue of input) {
          if (currentValue >= n && currentValue < m) {
            m = currentValue;
          }
        }
        const handledCPCountPlusOne = handledCPCount + 1;
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
          error("overflow");
        }
        delta += (m - n) * handledCPCountPlusOne;
        n = m;
        for (const currentValue of input) {
          if (currentValue < n && ++delta > maxInt) {
            error("overflow");
          }
          if (currentValue === n) {
            let q = delta;
            for (let k = base; ; k += base) {
              const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (q < t) {
                break;
              }
              const qMinusT = q - t;
              const baseMinusT = base - t;
              output.push(
                stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
              );
              q = floor(qMinusT / baseMinusT);
            }
            output.push(stringFromCharCode(digitToBasic(q, 0)));
            bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
            delta = 0;
            ++handledCPCount;
          }
        }
        ++delta;
        ++n;
      }
      return output.join("");
    };
    var toUnicode = function(input) {
      return mapDomain(input, function(string) {
        return regexPunycode.test(string) ? decode2(string.slice(4).toLowerCase()) : string;
      });
    };
    var toASCII = function(input) {
      return mapDomain(input, function(string) {
        return regexNonASCII.test(string) ? "xn--" + encode2(string) : string;
      });
    };
    var punycode2 = {
      /**
       * A string representing the current Punycode.js version number.
       * @memberOf punycode
       * @type String
       */
      "version": "2.3.1",
      /**
       * An object of methods to convert from JavaScript's internal character
       * representation (UCS-2) to Unicode code points, and back.
       * @see <https://mathiasbynens.be/notes/javascript-encoding>
       * @memberOf punycode
       * @type Object
       */
      "ucs2": {
        "decode": ucs2decode,
        "encode": ucs2encode
      },
      "decode": decode2,
      "encode": encode2,
      "toASCII": toASCII,
      "toUnicode": toUnicode
    };
    module.exports = punycode2;
  }
});

// index.ts
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import path4 from "node:path";
import fs4 from "node:fs";
import { fileURLToPath as fileURLToPath2 } from "node:url";

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
function getMessages(db, sessionKey, limit = 200, beforeSeq, search, afterSeq, startTs, endTs) {
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
  if (startTs !== void 0) {
    whereParts.push("timestamp >= ?");
    params.push(startTs);
  }
  if (endTs !== void 0) {
    whereParts.push("timestamp <= ?");
    params.push(endTs);
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
import fs3 from "node:fs";
import path3 from "node:path";
import { fileURLToPath } from "node:url";

// ../../.workbuddy/binaries/node/workspace/node_modules/mdurl/index.mjs
var mdurl_exports = {};
__export(mdurl_exports, {
  decode: () => decode_default,
  encode: () => encode_default,
  format: () => format,
  parse: () => parse_default
});

// ../../.workbuddy/binaries/node/workspace/node_modules/mdurl/lib/decode.mjs
var decodeCache = {};
function getDecodeCache(exclude) {
  let cache = decodeCache[exclude];
  if (cache) {
    return cache;
  }
  cache = decodeCache[exclude] = [];
  for (let i = 0; i < 128; i++) {
    const ch = String.fromCharCode(i);
    cache.push(ch);
  }
  for (let i = 0; i < exclude.length; i++) {
    const ch = exclude.charCodeAt(i);
    cache[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2);
  }
  return cache;
}
function decode(string, exclude) {
  if (typeof exclude !== "string") {
    exclude = decode.defaultChars;
  }
  const cache = getDecodeCache(exclude);
  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
    let result = "";
    for (let i = 0, l = seq.length; i < l; i += 3) {
      const b1 = parseInt(seq.slice(i + 1, i + 3), 16);
      if (b1 < 128) {
        result += cache[b1];
        continue;
      }
      if ((b1 & 224) === 192 && i + 3 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        if ((b2 & 192) === 128) {
          const chr = b1 << 6 & 1984 | b2 & 63;
          if (chr < 128) {
            result += "\uFFFD\uFFFD";
          } else {
            result += String.fromCharCode(chr);
          }
          i += 3;
          continue;
        }
      }
      if ((b1 & 240) === 224 && i + 6 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        if ((b2 & 192) === 128 && (b3 & 192) === 128) {
          const chr = b1 << 12 & 61440 | b2 << 6 & 4032 | b3 & 63;
          if (chr < 2048 || chr >= 55296 && chr <= 57343) {
            result += "\uFFFD\uFFFD\uFFFD";
          } else {
            result += String.fromCharCode(chr);
          }
          i += 6;
          continue;
        }
      }
      if ((b1 & 248) === 240 && i + 9 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        const b4 = parseInt(seq.slice(i + 10, i + 12), 16);
        if ((b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128) {
          let chr = b1 << 18 & 1835008 | b2 << 12 & 258048 | b3 << 6 & 4032 | b4 & 63;
          if (chr < 65536 || chr > 1114111) {
            result += "\uFFFD\uFFFD\uFFFD\uFFFD";
          } else {
            chr -= 65536;
            result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023));
          }
          i += 9;
          continue;
        }
      }
      result += "\uFFFD";
    }
    return result;
  });
}
decode.defaultChars = ";/?:@&=+$,#";
decode.componentChars = "";
var decode_default = decode;

// ../../.workbuddy/binaries/node/workspace/node_modules/mdurl/lib/encode.mjs
var encodeCache = {};
function getEncodeCache(exclude) {
  let cache = encodeCache[exclude];
  if (cache) {
    return cache;
  }
  cache = encodeCache[exclude] = [];
  for (let i = 0; i < 128; i++) {
    const ch = String.fromCharCode(i);
    if (/^[0-9a-z]$/i.test(ch)) {
      cache.push(ch);
    } else {
      cache.push("%" + ("0" + i.toString(16).toUpperCase()).slice(-2));
    }
  }
  for (let i = 0; i < exclude.length; i++) {
    cache[exclude.charCodeAt(i)] = exclude[i];
  }
  return cache;
}
function encode(string, exclude, keepEscaped) {
  if (typeof exclude !== "string") {
    keepEscaped = exclude;
    exclude = encode.defaultChars;
  }
  if (typeof keepEscaped === "undefined") {
    keepEscaped = true;
  }
  const cache = getEncodeCache(exclude);
  let result = "";
  for (let i = 0, l = string.length; i < l; i++) {
    const code2 = string.charCodeAt(i);
    if (keepEscaped && code2 === 37 && i + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
        result += string.slice(i, i + 3);
        i += 2;
        continue;
      }
    }
    if (code2 < 128) {
      result += cache[code2];
      continue;
    }
    if (code2 >= 55296 && code2 <= 57343) {
      if (code2 >= 55296 && code2 <= 56319 && i + 1 < l) {
        const nextCode = string.charCodeAt(i + 1);
        if (nextCode >= 56320 && nextCode <= 57343) {
          result += encodeURIComponent(string[i] + string[i + 1]);
          i++;
          continue;
        }
      }
      result += "%EF%BF%BD";
      continue;
    }
    result += encodeURIComponent(string[i]);
  }
  return result;
}
encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";
var encode_default = encode;

// ../../.workbuddy/binaries/node/workspace/node_modules/mdurl/lib/format.mjs
function format(url) {
  let result = "";
  result += url.protocol || "";
  result += url.slashes ? "//" : "";
  result += url.auth ? url.auth + "@" : "";
  if (url.hostname && url.hostname.indexOf(":") !== -1) {
    result += "[" + url.hostname + "]";
  } else {
    result += url.hostname || "";
  }
  result += url.port ? ":" + url.port : "";
  result += url.pathname || "";
  result += url.search || "";
  result += url.hash || "";
  return result;
}

// ../../.workbuddy/binaries/node/workspace/node_modules/mdurl/lib/parse.mjs
function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.pathname = null;
}
var protocolPattern = /^([a-z0-9.+-]+:)/i;
var portPattern = /:[0-9]*$/;
var simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
var delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"];
var unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims);
var autoEscape = ["'"].concat(unwise);
var nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape);
var hostEndingChars = ["/", "?", "#"];
var hostnameMaxLen = 255;
var hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
var hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
var hostlessProtocol = {
  javascript: true,
  "javascript:": true
};
var slashedProtocol = {
  http: true,
  https: true,
  ftp: true,
  gopher: true,
  file: true,
  "http:": true,
  "https:": true,
  "ftp:": true,
  "gopher:": true,
  "file:": true
};
function urlParse(url, slashesDenoteHost) {
  if (url && url instanceof Url) return url;
  const u = new Url();
  u.parse(url, slashesDenoteHost);
  return u;
}
Url.prototype.parse = function(url, slashesDenoteHost) {
  let lowerProto, hec, slashes;
  let rest = url;
  rest = rest.trim();
  if (!slashesDenoteHost && url.split("#").length === 1) {
    const simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
      }
      return this;
    }
  }
  let proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    lowerProto = proto.toLowerCase();
    this.protocol = proto;
    rest = rest.substr(proto.length);
  }
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === "//";
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }
  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
    let hostEnd = -1;
    for (let i = 0; i < hostEndingChars.length; i++) {
      hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    let auth, atSign;
    if (hostEnd === -1) {
      atSign = rest.lastIndexOf("@");
    } else {
      atSign = rest.lastIndexOf("@", hostEnd);
    }
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = auth;
    }
    hostEnd = -1;
    for (let i = 0; i < nonHostChars.length; i++) {
      hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }
    if (rest[hostEnd - 1] === ":") {
      hostEnd--;
    }
    const host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost(host);
    this.hostname = this.hostname || "";
    const ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!ipv6Hostname) {
      const hostparts = this.hostname.split(/\./);
      for (let i = 0, l = hostparts.length; i < l; i++) {
        const part = hostparts[i];
        if (!part) {
          continue;
        }
        if (!part.match(hostnamePartPattern)) {
          let newpart = "";
          for (let j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              newpart += "x";
            } else {
              newpart += part[j];
            }
          }
          if (!newpart.match(hostnamePartPattern)) {
            const validParts = hostparts.slice(0, i);
            const notHost = hostparts.slice(i + 1);
            const bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = notHost.join(".") + rest;
            }
            this.hostname = validParts.join(".");
            break;
          }
        }
      }
    }
    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = "";
    }
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
    }
  }
  const hash = rest.indexOf("#");
  if (hash !== -1) {
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  const qm = rest.indexOf("?");
  if (qm !== -1) {
    this.search = rest.substr(qm);
    rest = rest.slice(0, qm);
  }
  if (rest) {
    this.pathname = rest;
  }
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = "";
  }
  return this;
};
Url.prototype.parseHost = function(host) {
  let port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ":") {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) {
    this.hostname = host;
  }
};
var parse_default = urlParse;

// ../../.workbuddy/binaries/node/workspace/node_modules/uc.micro/build/index.mjs
var build_exports = {};
__export(build_exports, {
  Any: () => Any,
  Cc: () => Cc,
  Cf: () => Cf,
  P: () => P,
  S: () => S,
  Z: () => Z
});
var Any = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var Cc = /[\0-\x1F\x7F-\x9F]/;
var Cf = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;
var P = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B4E\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDD6E\uDEAD\uDED0\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9\uDFD4\uDFD5\uDFD7\uDFD8]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09\uDFE1]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDD6D-\uDD6F\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD839\uDDFF|\uD83A[\uDD5E\uDD5F]/;
var S = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C1\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2429\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E5\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD803[\uDD8E\uDD8F\uDED1-\uDED8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDC00-\uDCEF\uDCFA-\uDCFC\uDD00-\uDEB3\uDEBA-\uDED0\uDEE0-\uDEF0\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED8\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0-\uDCBB\uDCC0\uDCC1\uDCD0-\uDCD8\uDD00-\uDE57\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF-\uDEF8\uDF00-\uDF92\uDF94-\uDFEF\uDFFA]/;
var Z = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

// ../../.workbuddy/binaries/node/workspace/node_modules/entities/dist/decode-codepoint.js
var decodeMap = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]);
function replaceCodePoint(codePoint) {
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return decodeMap.get(codePoint) ?? codePoint;
}

// ../../.workbuddy/binaries/node/workspace/node_modules/entities/dist/internal/decode-shared.js
function decodeBase64(input) {
  const binary = atob(input);
  const evenLength = binary.length & ~1;
  const out = new Uint16Array(evenLength / 2);
  for (let index = 0, outIndex = 0; index < evenLength; index += 2) {
    const lo = binary.charCodeAt(index);
    const hi = binary.charCodeAt(index + 1);
    out[outIndex++] = lo | hi << 8;
  }
  return out;
}

// ../../.workbuddy/binaries/node/workspace/node_modules/entities/dist/generated/decode-data-html.js
var htmlDecodeTree = /* @__PURE__ */ decodeBase64("QR08ALkAAgH6AYsDNQR2BO0EPgXZBQEGLAbdBxMISQrvCmQLfQurDKQNLw4fD4YPpA+6D/IPAAAAAAAAAAAAAAAAKhBMEY8TmxUWF2EYLBkxGuAa3RsJHDscWR8YIC8jSCSIJcMl6ie3Ku8rEC0CLjoupS7kLgAIRU1hYmNmZ2xtbm9wcnN0dVQAWgBeAGUAaQBzAHcAfgCBAIQAhwCSAJoAoACsALMAbABpAGcAO4DGAMZAUAA7gCYAJkBjAHUAdABlADuAwQDBQHIiZXZlAAJhAAFpeW0AcgByAGMAO4DCAMJAEGRyAADgNdgE3XIAYQB2AGUAO4DAAMBA8CFoYZFj4SFjcgBhZAAAoFMqAAFncIsAjgBvAG4ABGFmAADgNdg43fAlbHlGdW5jdGlvbgCgYSBpAG4AZwA7gMUAxUAAAWNzpACoAHIAAOA12Jzc6SFnbgCgVCJpAGwAZABlADuAwwDDQG0AbAA7gMQAxEAABGFjZWZvcnN1xQDYANoA7QDxAPYA+QD8AAABY3LJAM8AayNzbGFzaAAAoBYidgHTANUAAKDnKmUAZAAAoAYjeQARZIABY3J0AOAA5QDrAGEidXNlAACgNSLuI291bGxpcwCgLCFhAJJjcgAA4DXYBd1wAGYAAOA12Dnd5SF2ZdhiYwDyAOoAbSJwZXEAAKBOIgAHSE9hY2RlZmhpbG9yc3UXARoBHwE6AVIBVQFiAWQBZgGCAakB6QHtAfIBYwB5ACdkUABZADuAqQCpQIABY3B5ACUBKAE1AfUhdGUGYWmg0iJ0KGFsRGlmZmVyZW50aWFsRAAAoEUhbCJleXMAAKAtIQACYWVpb0EBRAFKAU0B8iFvbgxhZABpAGwAO4DHAMdAcgBjAAhhbiJpbnQAAKAwIm8AdAAKYQABZG5ZAV0BaSJsbGEAuGB0I2VyRG90ALdg8gA5AWkAp2NyImNsZQAAAkRNUFRwAXQBeQF9AW8AdAAAoJkiaSJudXMAAKCWIuwhdXMAoJUiaSJtZXMAAKCXIm8AAAFjc4cBlAFrKndpc2VDb250b3VySW50ZWdyYWwAAKAyImUjQ3VybHkAAAFEUZwBpAFvJXVibGVRdW90ZQAAoB0gdSJvdGUAAKAZIAACbG5wdbABtgHNAdgBbwBuAGWgNyIAoHQqgAFnaXQAvAHBAcUB8iJ1ZW50AKBhIm4AdAAAoC8i7yV1ckludGVncmFsAKAuIgABZnLRAdMBAKACIe8iZHVjdACgECJuLnRlckNsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbAAAoDMi7yFzcwCgLypjAHIAAOA12J7ccABDoNMiYQBwAACgTSKABURKU1phY2VmaW9zAAsCEgIVAhgCGwIsAjQCOQI9AnMCfwNvoEUh9CJyYWhkAKARKWMAeQACZGMAeQAFZGMAeQAPZIABZ3JzACECJQIoAuchZXIAoCEgcgAAoKEhaAB2AACg5CoAAWF5MAIzAvIhb24OYRRkbAB0oAciYQCUY3IAAOA12AfdAAFhZkECawIAAWNtRQJnAvIjaXRpY2FsAAJBREdUUAJUAl8CYwJjInV0ZQC0YG8AdAFZAloC2WJiJGxlQWN1dGUA3WJyImF2ZQBgYGkibGRlANxi7yFuZACgxCJmJWVyZW50aWFsRAAAoEYhcAR9AgAAAAAAAIECjgIAABoDZgAA4DXYO91EoagAhQKJAm8AdAAAoNwgcSJ1YWwAAKBQIuIhbGUAA0NETFJVVpkCqAK1Au8C/wIRA28AbgB0AG8AdQByAEkAbgB0AGUAZwByAGEA7ADEAW8AdAKvAgAAAACwAqhgbiNBcnJvdwAAoNMhAAFlb7kC0AJmAHQAgAFBUlQAwQLGAs0CciJyb3cAAKDQIekkZ2h0QXJyb3cAoNQhZQDlACsCbgBnAAABTFLWAugC5SFmdAABQVLcAuECciJyb3cAAKD4J+kkZ2h0QXJyb3cAoPon6SRnaHRBcnJvdwCg+SdpImdodAAAAUFU9gL7AnIicm93AACg0iFlAGUAAKCoInAAQQIGAwAAAAALA3Iicm93AACg0SFvJHduQXJyb3cAAKDVIWUlcnRpY2FsQmFyAACgJSJuAAADQUJMUlRhJAM2AzoDWgNxA3oDciJyb3cAAKGTIUJVLAMwA2EAcgAAoBMpcCNBcnJvdwAAoPUhciJldmUAEWPlIWZ00gJDAwAASwMAAFIDaSVnaHRWZWN0b3IAAKBQKWUkZVZlY3RvcgAAoF4p5SJjdG9yQqC9IWEAcgAAoFYpaSJnaHQA1AFiAwAAaQNlJGVWZWN0b3IAAKBfKeUiY3RvckKgwSFhAHIAAKBXKWUAZQBBoKQiciJyb3cAAKCnIXIAcgBvAPcAtAIAAWN0gwOHA3IA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YwAAoN8i4SFycnCgtiEAoD0pgKIqImJjZG9zACsVMBU6FT4VQRVyImNhcAAAoEgqAAFhdTQVNxVwAACgRipwAACgSipvAHQAAKCNInIAAKBFKgDgKiIA/gACYWxydksVURVuFXMVcgByAG2gtyEAoDwpeQCAAWV2dwBYFWUVaRVxAHACXxUAAAAAYxVyAGUA4wAXFXUA4wAZFWUAZQAAoM4iZSJkZ2UAAKDPImUAbgA7gKQApEBlI2Fycm93AAABbHJ7FX8V5SFmdACgtiFpImdodAAAoLchZQDkAG0VAAFjaYsVkRVvAG4AaQBuAPQAkwFuAHQAAKAxImwiY3R5AACgLSOACUFIYWJjZGVmaGlqbG9yc3R1d3oAuBW7Fb8V1RXgFegV+RUKFhUWHxZUFlcWZRbFFtsW7xb7FgUXChdyAPIAtAJhAHIAAKBlKQACZ2xyc8YVyhXOFdAV5yFlcgCgICDlIXRoAKA4IfIA9QxoAHagECAAoKMiawHZFd4VYSJyb3cAAKAPKWEA4wBfAgABYXnkFecV8iFvbg9hNGQAoUYhYW/tFfQVAAFnciEC8RVyAACgyiF0InNlcQAAoHcqgAFnbG0A/xUCFgUWO4CwALBAdABhALRjcCJ0eXYAAKCxKQABaXIOFhIW8yFodACgfykA4DXYId1hAHIAAAFschsWHRYAoMMhAKDCIYACYWVnc3YAKBauAjYWOhY+Fm0AAKHEIm9zLhY0Fm4AZABzoMQi9SFpdACgZiZhIm1tYQDdY2kAbgAAoPIiAKH3AGlvQxZRFmQAZQAAgfcAO29KFksW90BuI3RpbWVzAACgxyJuAPgAUBZjAHkAUmRjAG8CXhYAAAAAYhZyAG4AAKAeI28AcAAAoA0jgAJscHR1dwBuFnEWdRaSFp4W7CFhciRgZgAA4DXYVd0AotkCZW1wc30WhBaJFo0WcQBkoFAibwB0AACgUSJpIm51cwAAoDgi7CF1cwCgFCLxInVhcmUAoKEiYgBsAGUAYgBhAHIAdwBlAGQAZwDlANcAbgCAAWFkaAClFqoWtBZyAHIAbwD3APUMbwB3AG4AYQByAHIAbwB3APMA8xVhI3Jwb29uAAABbHK8FsAWZQBmAPQAHBZpAGcAaAD0AB4WYgHJFs8WawBhAHIAbwD3AJILbwLUFgAAAADYFnIAbgAAoB8jbwBwAACgDCOAAWNvdADhFukW7BYAAXJ55RboFgDgNdi53FVkbAAAoPYp8iFvaxFhAAFkcvMW9xZvAHQAAKDxImkA5qC/JVsSAAFhaP8WAhdyAPIANQNhAPIA1wvhIm5nbGUAoKYpAAFjaQ4XEBd5AF9k5yJyYXJyAKD/JwAJRGFjZGVmZ2xtbm9wcXJzdHV4MRc4F0YXWxcyBF4XaRd5F40XrBe0F78X2RcVGCEYLRg1GEAYAAFEbzUXgRZvAPQA+BUAAWNzPBdCF3UAdABlADuA6QDpQPQhZXIAoG4qAAJhaW95TRdQF1YXWhfyIW9uG2FyAGOgViI7gOoA6kDsIW9uAKBVIk1kbwB0ABdhAAFEcmIXZhdvAHQAAKBSIgDgNdgi3XKhmipuF3QXYQB2AGUAO4DoAOhAZKCWKm8AdAAAoJgqgKGZKmlscwCAF4UXhxfuInRlcnMAoOcjAKATIWSglSpvAHQAAKCXKoABYXBzAJMXlheiF2MAcgATYXQAeQBzogUinxcAAAAAoRdlAHQAAKAFInAAMaADIDMBqRerFwCgBCAAoAUgAAFnc7AXsRdLYXAAAKACIAABZ3C4F7sXbwBuABlhZgAA4DXYVt2AAWFscwDFF8sXzxdyAHOg1SJsAACg4yl1AHMAAKBxKmkAAKG1A2x21RfYF28AbgC1Y/VjAAJjc3V24BfoF/0XEBgAAWlv5BdWF3IAYwAAoFYiaQLuFwAAAADwF+0ADQThIW50AAFnbPUX+Rd0AHIAAKCWKuUhc3MAoJUqgAFhZWkAAxgGGAoYbABzAD1gcwB0AACgXyJ2AESgYSJEAACgeCrwImFyc2wAoOUpAAFEYRkYHRhvAHQAAKBTInIAcgAAoHEpgAFjZGkAJxgqGO0XcgAAoC8hbwD0AIwCAAFhaDEYMhi3YzuA8ADwQAABbXI5GD0YbAA7gOsA60BvAACgrCCAAWNpcABGGEgYSxhsACFgcwD0ACwEAAFlb08YVxhjAHQAYQB0AGkAbwDuABoEbgBlAG4AdABpAGEAbADlADME4Ql1GAAAgRgAAIMYiBgAAAAAoRilGAAAqhgAALsYvhjRGAAA1xgnGWwAbABpAG4AZwBkAG8AdABzAGUA8QBlF3kARGRtImFsZQAAoEAmgAFpbHIAjRiRGJ0Y7CFpZwCgA/tpApcYAAAAAJoYZwAAoAD7aQBnAACgBPsA4DXYI93sIWlnAKAB++whaWcA4GYAagCAAWFsdACvGLIYthh0AACgbSZpAGcAAKAC+24AcwAAoLElbwBmAJJh8AHCGAAAxhhmAADgNdhX3QABYWvJGMwYbADsAGsEdqDUIgCg2SphI3J0aW50AACgDSoAAWFv2hgiGQABY3PeGB8ZsQPnGP0YBRkSGRUZAAAdGbID7xjyGPQY9xj5GAAA+xg7gL0AvUAAoFMhO4C8ALxAAKBVIQCgWSEAoFshswEBGQAAAxkAoFQhAKBWIbQCCxkOGQAAAAAQGTuAvgC+QACgVyEAoFwhNQAAoFghtgEZGQAAGxkAoFohAKBdITgAAKBeIWwAAKBEIHcAbgAAoCIjYwByAADgNdi73IAIRWFiY2RlZmdpamxub3JzdHYARhlKGVoZXhlmGWkZkhmWGZkZnRmgGa0ZxhnLGc8Z4BkjGmygZyIAoIwqgAFjbXAAUBlTGVgZ9SF0ZfVhbQBhAOSgswM6FgCghipyImV2ZQAfYQABaXliGWUZcgBjAB1hM2RvAHQAIWGAoWUibHFzAMYEcBl6GfGhZSLOBAAAdhlsAGEAbgD0AN8EgKF+KmNkbACBGYQZjBljAACgqSpvAHQAb6CAKmyggioAoIQqZeDbIgD+cwAAoJQqcgAA4DXYJN3noGsirATtIWVsAKA3IWMAeQBTZIChdyJFYWoApxmpGasZAKCSKgCgpSoAoKQqAAJFYWVztBm2Gb0ZwhkAoGkicABwoIoq8iFveACgiipxoIgq8aCIKrUZaQBtAACg5yJwAGYAAOA12FjdYQB2AOUAYwIAAWNp0xnWGXIAAKAKIW0AAKFzImVs3BneGQCgjioAoJAqAIM+ADtjZGxxco0E6xn0GfgZ/BkBGgABY2nvGfEZAKCnKnIAAKB6Km8AdAAAoNci0CFhcgCglSl1ImVzdAAAoHwqgAJhZGVscwAKGvQZFhrVBCAa8AEPGgAAFBpwAHIAbwD4AFkZcgAAoHgpcQAAAWxxxAQbGmwAZQBzAPMASRlpAO0A5AQAAWVuJxouGnIjdG5lcXEAAOBpIgD+xQAsGgAFQWFiY2Vma29zeUAaQxpmGmoabRqDGocalhrCGtMacgDyAMwCAAJpbG1yShpOGlAaVBpyAHMA8ABxD2YAvWBpAGwA9AASBQABZHJYGlsaYwB5AEpkAKGUIWN3YBpkGmkAcgAAoEgpAKCtIWEAcgAAoA8h6SFyYyVhgAFhbHIAcxp7Gn8a8iF0c3WgZSZpAHQAAKBlJuwhaXAAoCYg4yFvbgCguSJyAADgNdgl3XMAAAFld4wakRphInJvdwAAoCUpYSJyb3cAAKAmKYACYW1vcHIAnxqjGqcauhq+GnIAcgAAoP8h9CFodACgOyJrAAABbHKsGrMaZSRmdGFycm93AACgqSHpJGdodGFycm93AKCqIWYAAOA12Fnd4iFhcgCgFSCAAWNsdADIGswa0BpyAADgNdi93GEAcwDoAGka8iFvaydhAAFicNca2xr1IWxsAKBDIOghZW4AoBAg4Qr2GgAA/RoAAAgbExsaGwAAIRs7GwAAAAA+G2IbmRuVG6sbAACyG80b0htjAHUAdABlADuA7QDtQAChYyBpeQEbBhtyAGMAO4DuAO5AOGQAAWN4CxsNG3kANWRjAGwAO4ChAKFAAAFmcssCFhsA4DXYJt1yAGEAdgBlADuA7ADsQIChSCFpbm8AJxsyGzYbAAFpbisbLxtuAHQAAKAMKnQAAKAtIuYhaW4AoNwpdABhAACgKSHsIWlnM2GAAWFvcABDG1sbXhuAAWNndABJG0sbWRtyACthgAFlbHAAcQVRG1UbaQBuAOUAyAVhAHIA9AByBWgAMWFmAACgtyJlAGQAtWEAoggiY2ZvdGkbbRt1G3kb4SFyZQCgBSFpAG4AdKAeImkAZQAAoN0pZABvAPQAWxsAoisiY2VscIEbhRuPG5QbYQBsAACguiIAAWdyiRuNG2UAcgDzACMQ4wCCG2EicmhrAACgFyryIW9kAKA8KgACY2dwdJ8boRukG6gbeQBRZG8AbgAvYWYAAOA12FrdYQC5Y3UAZQBzAHQAO4C/AL9AAAFjabUbuRtyAADgNdi+3G4AAKIIIkVkc3bCG8QbyBvQAwCg+SJvAHQAAKD1Inag9CIAoPMiaaBiIOwhZGUpYesB1hsAANkbYwB5AFZkbAA7gO8A70AAA2NmbW9zdeYb7hvyG/Ub+hsFHAABaXnqG+0bcgBjADVhOWRyAADgNdgn3eEhdGg3YnAAZgAA4DXYW93jAf8bAAADHHIAAOA12L/c8iFjeVhk6yFjeVRkAARhY2ZnaGpvcxUcGhwiHCYcKhwtHDAcNRzwIXBhdqC6A/BjAAFleR4cIRzkIWlsN2E6ZHIAAOA12CjdciJlZW4AOGFjAHkARWRjAHkAXGRwAGYAAOA12FzdYwByAADgNdjA3IALQUJFSGFiY2RlZmdoamxtbm9wcnN0dXYAXhxtHHEcdRx5HN8cBx0dHTwd3B3tHfEdAR4EHh0eLB5FHrwewx7hHgkfPR9LH4ABYXJ0AGQcZxxpHHIA8gBvB/IAxQLhIWlsAKAbKeEhcnIAoA4pZ6BmIgCgiyphAHIAAKBiKWMJjRwAAJAcAACVHAAAAAAAAAAAAACZHJwcAACmHKgcrRwAANIc9SF0ZTph7SJwdHl2AKC0KXIAYQDuAFoG4iFkYbtjZwAAoegnZGyhHKMcAKCRKeUAiwYAoIUqdQBvADuAqwCrQHIAgKOQIWJmaGxwc3QAuhy/HMIcxBzHHMoczhxmoOQhcwAAoB8pcwAAoB0p6wCyGnAAAKCrIWwAAKA5KWkAbQAAoHMpbAAAoKIhAKGrKmFl1hzaHGkAbAAAoBkpc6CtKgDgrSoA/oABYWJyAOUc6RztHHIAcgAAoAwpcgBrAACgcicAAWFr8Rz4HGMAAAFla/Yc9xx7YFtgAAFlc/wc/hwAoIspbAAAAWR1Ax0FHQCgjykAoI0pAAJhZXV5Dh0RHRodHB3yIW9uPmEAAWRpFR0YHWkAbAA8YewAowbiAPccO2QAAmNxcnMkHScdLB05HWEAAKA2KXUAbwDyoBwgqhEAAWR1MB00HeghYXIAoGcpcyJoYXIAAKBLKWgAAKCyIQCiZCJmZ3FzRB1FB5Qdnh10AIACYWhscnQATh1WHWUdbB2NHXIicm93AHSgkCFhAOkAzxxhI3Jwb29uAAABZHVeHWId7yF3bgCgvSFwAACgvCHlJGZ0YXJyb3dzAKDHIWkiZ2h0AIABYWhzAHUdex2DHXIicm93APOglCGdBmEAcgBwAG8AbwBuAPMAzgtxAHUAaQBnAGEAcgByAG8A9wBlGugkcmVldGltZXMAoMsi8aFkIk0HAACaHWwAYQBuAPQAXgcAon0qY2Rnc6YdqR2xHbcdYwAAoKgqbwB0AG+gfypyoIEqAKCDKmXg2iIA/nMAAKCTKoACYWRlZ3MAwB3GHcod1h3ZHXAAcAByAG8A+ACmHG8AdAAAoNYicQAAAWdxzx3SHXQA8gBGB2cAdADyAHQcdADyAFMHaQDtAGMHgAFpbHIA4h3mHeod8yFodACgfClvAG8A8gDKBgDgNdgp3UWgdiIAoJEqYQH1Hf4dcgAAAWR1YB35HWygvCEAoGopbABrAACghCVjAHkAWWQAomoiYWNodAweDx4VHhkecgDyAGsdbwByAG4AZQDyAGAW4SFyZACgaylyAGkAAKD6JQABaW8hHiQe5CFvdEBh9SFzdGGgsCPjIWhlAKCwIwACRWFlczMeNR48HkEeAKBoInAAcKCJKvIhb3gAoIkqcaCHKvGghyo0HmkAbQAAoOYiAARhYm5vcHR3elIeXB5fHoUelh6mHqsetB4AAW5yVh5ZHmcAAKDsJ3IAAKD9IXIA6wCwBmcAgAFsbXIAZh52Hnse5SFmdAABYXKIB2weaQBnAGgAdABhAHIAcgBvAPcAkwfhInBzdG8AoPwnaQBnAGgAdABhAHIAcgBvAPcAmgdwI2Fycm93AAABbHKNHpEeZQBmAPQAxhxpImdodAAAoKwhgAFhZmwAnB6fHqIecgAAoIUpAOA12F3ddQBzAACgLSppIm1lcwAAoDQqYQGvHrMecwB0AACgFyLhAIoOZaHKJbkeRhLuIWdlAKDKJWEAcgBsoCgAdAAAoJMpgAJhY2htdADMHs8e1R7bHt0ecgDyAJ0GbwByAG4AZQDyANYWYQByAGSgyyEAoG0pAKAOIHIAaQAAoL8iAANhY2hpcXTrHu8e1QfzHv0eBh/xIXVvAKA5IHIAAOA12MHcbQDloXIi+h4AAPweAKCNKgCgjyoAAWJ19xwBH28AcqAYIACgGiDyIW9rQmEAhDwAO2NkaGlscXJCBhcfxh0gHyQfKB8sHzEfAAFjaRsfHR8AoKYqcgAAoHkqcgBlAOUAkx3tIWVzAKDJIuEhcnIAoHYpdSJlc3QAAKB7KgABUGk1HzkfYQByAACglillocMlAgdfEnIAAAFkdUIfRx9zImhhcgAAoEop6CFhcgCgZikAAWVuTx9WH3IjdG5lcXEAAOBoIgD+xQBUHwAHRGFjZGVmaGlsbm9wc3VuH3Ifoh+rH68ftx+7H74f5h/uH/MfBwj/HwsgxCFvdACgOiIAAmNscHJ5H30fiR+eH3IAO4CvAK9AAAFldIEfgx8AoEImZaAgJ3MAZQAAoCAnc6CmIXQAbwCAoaYhZGx1AJQfmB+cH28AdwDuAHkDZQBmAPQA6gbwAOkO6yFlcgCgriUAAW95ph+qH+0hbWEAoCkqPGThIXNoAKAUIOElc3VyZWRhbmdsZQCgISJyAADgNdgq3W8AAKAnIYABY2RuAMQfyR/bH3IAbwA7gLUAtUBhoiMi0B8AANMf1x9zAPQAKxFpAHIAAKDwKm8AdAA7gLcAt0B1AHMA4qESIh4TAADjH3WgOCIAoCoqYwHqH+0fcAAAoNsq8gB+GnAAbAB1APMACAgAAWRw9x/7H+UhbHMAoKciZgAA4DXYXt0AAWN0AyAHIHIAAOA12MLc8CFvcwCgPiJsobwDECAVIPQiaW1hcACguCJhAPAAEyAADEdMUlZhYmNkZWZnaGlqbG1vcHJzdHV2dzwgRyBmIG0geSCqILgg2iDeIBEhFSEyIUMhTSFQIZwhnyHSIQAiIyKLIrEivyIUIwABZ3RAIEMgAODZIjgD9uBrItIgBwmAAWVsdABNIF8gYiBmAHQAAAFhclMgWCByInJvdwAAoM0h6SRnaHRhcnJvdwCgziEA4NgiOAP24Goi0iBfCekkZ2h0YXJyb3cAoM8hAAFEZHEgdSDhIXNoAKCvIuEhc2gAoK4igAJiY25wdACCIIYgiSCNIKIgbABhAACgByL1IXRlRGFnAADgICLSIACiSSJFaW9wlSCYIJwgniAA4HAqOANkAADgSyI4A3MASWFyAG8A+AAyCnUAcgBhoG4mbADzoG4mmwjzAa8gAACzIHAAO4CgAKBAbQBwAOXgTiI4AyoJgAJhZW91eQDBIMogzSDWINkg8AHGIAAAyCAAoEMqbwBuAEhh5CFpbEZhbgBnAGSgRyJvAHQAAOBtKjgDcAAAoEIqPWThIXNoAKATIACjYCJBYWRxc3jpIO0g+SD+IAIhDCFyAHIAAKDXIXIAAAFocvIg9SBrAACgJClvoJch9wAGD28AdAAA4FAiOAN1AGkA9gC7CAABZWkGIQohYQByAACgKCntAN8I6SFzdPOgBCLlCHIAAOA12CvdAAJFZXN0/wgcISshLiHxoXEiIiEAABMJ8aFxIgAJAAAnIWwAYQBuAPQAEwlpAO0AGQlyoG8iAKBvIoABQWFwADghOyE/IXIA8gBeIHIAcgAAoK4hYQByAACg8ipzogsiSiEAAAAAxwtkoPwiAKD6ImMAeQBaZIADQUVhZGVzdABcIV8hYiFmIWkhkyGWIXIA8gBXIADgZiI4A3IAcgAAoJohcgAAoCUggKFwImZxcwBwIYQhjiF0AAABYXJ1IXohcgByAG8A9wBlIWkAZwBoAHQAYQByAHIAbwD3AD4h8aFwImAhAACKIWwAYQBuAPQAZwlz4H0qOAMAoG4iaQDtAG0JcqBuImkA5aDqIkUJaQDkADoKAAFwdKMhpyFmAADgNdhf3YCBrAA7aW4AriGvIcchrEBuAIChCSJFZHYAtyG6Ib8hAOD5IjgDbwB0AADg9SI4A+EB1gjEIcYhAKD3IgCg9iJpAHagDCLhAagJzyHRIQCg/iIAoP0igAFhb3IA2CHsIfEhcgCAoSYiYXN0AOAh5SHpIWwAbABlAOwAywhsAADg/SrlIADgAiI4A2wiaW50AACgFCrjoYAi9yEAAPohdQDlAJsJY+CvKjgDZaCAIvEAkwkAAkFhaXQHIgoiFyIeInIA8gBsIHIAcgAAoZshY3cRIhQiAOAzKTgDAOCdITgDZyRodGFycm93AACgmyFyAGkA5aDrIr4JgANjaGltcHF1AC8iPCJHIpwhTSJQIloigKGBImNlcgA2Iv0JOSJ1AOUABgoA4DXYw9zvIXJ0bQKdIQAAAABEImEAcgDhAOEhbQBloEEi8aBEIiYKYQDyAMsIcwB1AAABYnBWIlgi5QDUCeUA3wmAAWJjcABgInMieCKAoYQiRWVzAGci7glqIgDgxSo4A2UAdABl4IIi0iBxAPGgiCJoImMAZaCBIvEA/gmAoYUiRWVzAH8iFgqCIgDgxio4A2UAdABl4IMi0iBxAPGgiSKAIgACZ2lscpIilCKaIpwi7AAMCWwAZABlADuA8QDxQOcAWwlpI2FuZ2xlAAABbHKkIqoi5SFmdGWg6iLxAEUJaSJnaHQAZaDrIvEAvgltoL0DAKEjAGVzuCK8InIAbwAAoBYhcAAAoAcggARESGFkZ2lscnMAziLSItYi2iLeIugi7SICIw8j4SFzaACgrSLhIXJyAKAEKXAAAOBNItIg4SFzaACgrCIAAWV04iLlIgDgZSLSIADgPgDSIG4iZmluAACg3imAAUFldADzIvci+iJyAHIAAKACKQDgZCLSIHLgPADSIGkAZQAA4LQi0iAAAUF0BiMKI3IAcgAAoAMp8iFpZQDgtSLSIGkAbQAA4Dwi0iCAAUFhbgAaIx4jKiNyAHIAAKDWIXIAAAFociMjJiNrAACgIylvoJYh9wD/DuUhYXIAoCcpUxJqFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVCMAAF4jaSN/I4IjjSOeI8AUAAAAAKYjwCMAANoj3yMAAO8jHiQvJD8kRCQAAWNzVyNsFHUAdABlADuA8wDzQAABaXlhI2cjcgBjoJoiO4D0APRAPmSAAmFiaW9zAHEjdCN3I3EBeiNzAOgAdhTsIWFjUWF2AACgOCrvIWxkAKC8KewhaWdTYQABY3KFI4kjaQByAACgvykA4DXYLN1vA5QjAAAAAJYjAACcI24A22JhAHYAZQA7gPIA8kAAoMEpAAFibaEjjAphAHIAAKC1KQACYWNpdKwjryO6I70jcgDyAFkUAAFpcrMjtiNyAACgvinvIXNzAKC7KW4A5QDZCgCgwCmAAWFlaQDFI8gjyyNjAHIATWFnAGEAyWOAAWNkbgDRI9Qj1iPyIW9uv2MAoLYpdQDzAHgBcABmAADgNdhg3YABYWVsAOQj5yPrI3IAAKC3KXIAcAAAoLkpdQDzAHwBAKMoImFkaW9zdvkj/CMPJBMkFiQbJHIA8gBeFIChXSplZm0AAyQJJAwkcgBvoDQhZgAAoDQhO4CqAKpAO4C6ALpA5yFvZgCgtiJyAACgVipsIm9wZQAAoFcqAKBbKoABY2xvACMkJSQrJPIACCRhAHMAaAA7gPgA+EBsAACgmCJpAGwBMyQ4JGQAZQA7gPUA9UBlAHMAYaCXInMAAKA2Km0AbAA7gPYA9kDiIWFyAKA9I+EKXiQAAHokAAB8JJQkAACYJKkkAAAAALUkEQsAAPAkAAAAAAQleiUAAIMlcgCAoSUiYXN0AGUkbyQBCwCBtgA7bGokayS2QGwAZQDsABgDaQJ1JAAAAAB4JG0AAKDzKgCg/Sp5AD9kcgCAAmNpbXB0AIUkiCSLJJkSjyRuAHQAJWBvAGQALmBpAGwAAKAwIOUhbmsAoDEgcgAA4DXYLd2AAWltbwCdJKAkpCR2oMYD1WNtAGEA9AD+B24AZQAAoA4m9KHAA64kAAC0JGMjaGZvcmsAAKDUItZjAAFhdbgkxCRuAAABY2u9JMIkawBooA8hAKAOIfYAaRpzAACkKwBhYmNkZW1zdNMkIRPXJNsk4STjJOck6yTjIWlyAKAjKmkAcgAAoCIqAAFvdYsW3yQAoCUqAKByKm4AO4CxALFAaQBtAACgJip3AG8AAKAnKoABaXB1APUk+iT+JO4idGludACgFSpmAADgNdhh3W4AZAA7gKMAo0CApHoiRWFjZWlub3N1ABMlFSUYJRslTCVRJVklSSV1JQCgsypwAACgtyp1AOUAPwtjoK8qgKJ6ImFjZW5zACclLSU0JTYlSSVwAHAAcgBvAPgAFyV1AHIAbAB5AGUA8QA/C/EAOAuAAWFlcwA8JUElRSXwInByb3gAoLkqcQBxAACgtSppAG0AAKDoImkA7QBEC20AZQDzoDIgIguAAUVhcwBDJVclRSXwAEAlgAFkZnAATwtfJXElgAFhbHMAZSVpJW0l7CFhcgCgLiPpIW5lAKASI/UhcmYAoBMjdKAdIu8AWQvyIWVsAKCwIgABY2l9JYElcgAA4DXYxdzIY24iY3NwAACgCCAAA2Zpb3BzdZElKxuVJZolnyWkJXIAAOA12C7dcABmAADgNdhi3XIiaW1lAACgVyBjAHIAAOA12MbcgAFhZW8AqiW6JcAldAAAAWVpryW2JXIAbgBpAG8AbgDzABkFbgB0AACgFipzAHQAZaA/APEACRj0AG0LgApBQkhhYmNkZWZoaWxtbm9wcnN0dXgA4yXyJfYl+iVpJpAmpia9JtUm5ib4JlonaCdxJ3UnnietJ7EnyCfiJ+cngAFhcnQA6SXsJe4lcgDyAJkM8gD6AuEhaWwAoBwpYQByAPIA3BVhAHIAAKBkKYADY2RlbnFydAAGJhAmEyYYJiYmKyZaJgABZXUKJg0mAOA9IjEDdABlAFVhaQDjACAN7SJwdHl2AKCzKWcAgKHpJ2RlbAAgJiImJCYAoJIpAKClKeUA9wt1AG8AO4C7ALtAcgAApZIhYWJjZmhscHN0dz0mQCZFJkcmSiZMJk4mUSZVJlgmcAAAoHUpZqDlIXMAAKAgKQCgMylzAACgHinrALka8ACVHmwAAKBFKWkAbQAAoHQpbAAAoKMhAKCdIQABYWleJmImaQBsAACgGilvAG6gNiJhAGwA8wB2C4ABYWJyAG8mciZ2JnIA8gAvEnIAawAAoHMnAAFha3omgSZjAAABZWt/JoAmfWBdYAABZXOFJocmAKCMKWwAAAFkdYwmjiYAoI4pAKCQKQACYWV1eZcmmiajJqUm8iFvbllhAAFkaZ4moSZpAGwAV2HsAA8M4gCAJkBkAAJjbHFzrSawJrUmuiZhAACgNylkImhhcgAAoGkpdQBvAPKgHSCjAWgAAKCzIYABYWNnAMMm0iaUC2wAgKEcIWlwcwDLJs4migxuAOUAoAxhAHIA9ADaC3QAAKCtJYABaWxyANsm3ybjJvMhaHQAoH0pbwBvAPIANgwA4DXYL90AAWFv6ib1JnIAAAFkde8m8SYAoMEhbKDAIQCgbCl2oMED8WOAAWducwD+Jk4nUCdoAHQAAANhaGxyc3QKJxInISc1Jz0nRydyInJvdwB0oJIhYQDpAFYmYSNycG9vbgAAAWR1GiceJ28AdwDuAPAmcAAAoMAh5SFmdAABYWgnJy0ncgByAG8AdwDzAAkMYQByAHAAbwBvAG4A8wATBGklZ2h0YXJyb3dzAACgySFxAHUAaQBnAGEAcgByAG8A9wBZJugkcmVldGltZXMAoMwiZwDaYmkAbgBnAGQAbwB0AHMAZQDxABwYgAFhaG0AYCdjJ2YncgDyAAkMYQDyABMEAKAPIG8idXN0AGGgsSPjIWhlAKCxI+0haWQAoO4qAAJhYnB0fCeGJ4knmScAAW5ygCeDJ2cAAKDtJ3IAAKD+IXIA6wAcDIABYWZsAI8nkieVJ3IAAKCGKQDgNdhj3XUAcwAAoC4qaSJtZXMAAKA1KgABYXCiJ6gncgBnoCkAdAAAoJQp7yJsaW50AKASKmEAcgDyADwnAAJhY2hxuCe8J6EMwCfxIXVvAKA6IHIAAOA12MfcAAFidYAmxCdvAPKgGSCoAYABaGlyAM4n0ifWJ3IAZQDlAE0n7SFlcwCgyiJpAIChuSVlZmwAXAxjEt4n9CFyaQCgzinsInVoYXIAoGgpAKAeIWENBSgJKA0oSyhVKIYoAACLKLAoAAAAAOMo5ygAABApJCkxKW0pcSmHKaYpAACYKgAAAACxKmMidXRlAFthcQB1AO8ABR+ApHsiRWFjZWlucHN5ABwoHignKCooLygyKEEoRihJKACgtCrwASMoAAAlKACguCpvAG4AYWF1AOUAgw1koLAqaQBsAF9hcgBjAF1hgAFFYXMAOCg6KD0oAKC2KnAAAKC6KmkAbQAAoOki7yJsaW50AKATKmkA7QCIDUFkbwB0AGKixSKRFgAAAABTKACgZiqAA0FhY21zdHgAYChkKG8ocyh1KHkogihyAHIAAKDYIXIAAAFocmkoayjrAJAab6CYIfcAzAd0ADuApwCnQGkAO2D3IWFyAKApKW0AAAFpbn4ozQBuAHUA8wDOAHQAAKA2J3IA7+A12DDdIxkAAmFjb3mRKJUonSisKHIAcAAAoG8mAAFoeZkonChjAHkASWRIZHIAdABtAqUoAAAAAKgoaQDkAFsPYQByAGEA7ABsJDuArQCtQAABZ22zKLsobQBhAAChwwNmdroouijCY4CjPCJkZWdsbnByAMgozCjPKNMo1yjaKN4obwB0AACgairxoEMiCw5FoJ4qAKCgKkWgnSoAoJ8qZQAAoEYi7CF1cwCgJCrhIXJyAKByKWEAcgDyAPwMAAJhZWl07Sj8KAEpCCkAAWxz8Sj4KGwAcwBlAHQAbQDpAH8oaABwAACgMyrwImFyc2wAoOQpAAFkbFoPBSllAACgIyNloKoqc6CsKgDgrCoA/oABZmxwABUpGCkfKfQhY3lMZGKgLwBhoMQpcgAAoD8jZgAA4DXYZN1hAAABZHIoKRcDZQBzAHWgYCZpAHQAAKBgJoABY3N1ADYpRilhKQABYXU6KUApcABzoJMiAOCTIgD+cABzoJQiAOCUIgD+dQAAAWJwSylWKQChjyJlcz4NUCllAHQAZaCPIvEAPw0AoZAiZXNIDVspZQB0AGWgkCLxAEkNAKGhJWFmZilbBHIAZQFrKVwEAKChJWEAcgDyAAMNAAJjZW10dyl7KX8pgilyAADgNdjI3HQAbQDuAM4AaQDsAAYpYQByAOYAVw0AAWFyiimOKXIA5qAGJhESAAFhbpIpoylpImdodAAAAWVwmSmgKXAAcwBpAGwAbwDuANkXaADpAKAkcwCvYIACYmNtbnAArin8KY4NJSooKgCkgiJFZGVtbnByc7wpvinCKcgpzCnUKdgp3CkAoMUqbwB0AACgvSpkoIYibwB0AACgwyr1IWx0AKDBKgABRWXQKdIpAKDLKgCgiiLsIXVzAKC/KuEhcnIAoHkpgAFlaXUA4inxKfQpdAAAoYIiZW7oKewpcQDxoIYivSllAHEA8aCKItEpbQAAoMcqAAFicPgp+ikAoNUqAKDTKmMAgKJ7ImFjZW5zAAcqDSoUKhYqRihwAHAAcgBvAPgAIyh1AHIAbAB5AGUA8QCDDfEAfA2AAWFlcwAcKiIqPShwAHAAcgBvAPgAPChxAPEAOShnAACgaiYApoMiMTIzRWRlaGxtbnBzPCo/KkIqRSpHKlIqWCpjKmcqaypzKncqO4C5ALlAO4CyALJAO4CzALNAAKDGKgABb3NLKk4qdAAAoL4qdQBiAACg2CpkoIcibwB0AACgxCpzAAABb3VdKmAqbAAAoMknYgAAoNcq4SFycgCgeyn1IWx0AKDCKgABRWVvKnEqAKDMKgCgiyLsIXVzAKDAKoABZWl1AH0qjCqPKnQAAKGDImVugyqHKnEA8aCHIkYqZQBxAPGgiyJwKm0AAKDIKgABYnCTKpUqAKDUKgCg1iqAAUFhbgCdKqEqrCpyAHIAAKDZIXIAAAFocqYqqCrrAJUab6CZIfcAxQf3IWFyAKAqKWwAaQBnADuA3wDfQOELzyrZKtwq6SrsKvEqAAD1KjQrAAAAAAAAAAAAAEwrbCsAAHErvSsAAAAAAADRK3IC1CoAAAAA2CrnIWV0AKAWI8RjcgDrAOUKgAFhZXkA4SrkKucq8iFvbmVh5CFpbGNhQmRvAPQAIg5sInJlYwAAoBUjcgAA4DXYMd0AAmVpa2/7KhIrKCsuK/IBACsAAAkrZQAAATRm6g0EK28AcgDlAOsNYQBzorgDECsAAAAAEit5AG0A0WMAAWNuFislK2sAAAFhcxsrIStwAHAAcgBvAPgAFw5pAG0AAKA8InMA8AD9DQABYXMsKyEr8AAXDnIAbgA7gP4A/kDsATgrOyswG2QA5QBnAmUAcwCAgdcAO2JkAEMrRCtJK9dAYaCgInIAAKAxKgCgMCqAAWVwcwBRK1MraSvhAAkh4qKkIlsrXysAAAAAYytvAHQAAKA2I2kAcgAAoPEqb+A12GXdcgBrAACg2irhAHgociJpbWUAAKA0IIABYWlwAHYreSu3K2QA5QC+DYADYWRlbXBzdACFK6MrmiunK6wrsCuzK24iZ2xlAACitSVkbHFykCuUK5ornCvvIXduAKC/JeUhZnRloMMl8QACBwCgXCJpImdodABloLkl8QBdDG8AdAAAoOwlaSJudXMAAKA6KuwhdXMAoDkqYgAAoM0p6SFtZQCgOyrlInppdW0AoOIjgAFjaHQAwivKK80rAAFyecYrySsA4DXYydxGZGMAeQBbZPIhb2tnYQABaW/UK9creAD0ANERaCJlYWQAAAFsct4r5ytlAGYAdABhAHIAcgBvAPcAXQbpJGdodGFycm93AKCgIQAJQUhhYmNkZmdobG1vcHJzdHV3CiwNLBEsHSwnLDEsQCxLLFIsYix6LIQsjyzLLOgs7Sz/LAotcgDyAAkDYQByAACgYykAAWNyFSwbLHUAdABlADuA+gD6QPIACQ1yAOMBIywAACUseQBeZHYAZQBtYQABaXkrLDAscgBjADuA+wD7QENkgAFhYmgANyw6LD0scgDyANEO7CFhY3FhYQDyAOAOAAFpckQsSCzzIWh0AKB+KQDgNdgy3XIAYQB2AGUAO4D5APlAYQFWLF8scgAAAWxyWixcLACgvyEAoL4hbABrAACggCUAAWN0Zix2LG8CbCwAAAAAcyxyAG4AZaAcI3IAAKAcI28AcAAAoA8jcgBpAACg+CUAAWFsfiyBLGMAcgBrYTuAqACoQAABZ3CILIssbwBuAHNhZgAA4DXYZt0AA2FkaGxzdZksniynLLgsuyzFLHIAcgBvAPcACQ1vAHcAbgBhAHIAcgBvAPcA2A5hI3Jwb29uAAABbHKvLLMsZQBmAPQAWyxpAGcAaAD0AF0sdQDzAKYOaQAAocUDaGzBLMIs0mNvAG4AxWPwI2Fycm93cwCgyCGAAWNpdADRLOEs5CxvAtcsAAAAAN4scgBuAGWgHSNyAACgHSNvAHAAAKAOI24AZwBvYXIAaQAAoPklYwByAADgNdjK3IABZGlyAPMs9yz6LG8AdAAAoPAi7CFkZWlhaQBmoLUlAKC0JQABYW0DLQYtcgDyAMosbAA7gPwA/EDhIm5nbGUAoKcpgAdBQkRhY2RlZmxub3Byc3oAJy0qLTAtNC2bLZ0toS2/LcMtxy3TLdgt3C3gLfwtcgDyABADYQByAHag6CoAoOkqYQBzAOgA/gIAAW5yOC08LechcnQAoJwpgANla25wcnN0AJkpSC1NLVQtXi1iLYItYQBwAHAA4QAaHG8AdABoAGkAbgDnAKEXgAFoaXIAoSmzJFotbwBwAPQAdCVooJUh7wD4JgABaXVmLWotZwBtAOEAuygAAWJwbi14LXMjZXRuZXEAceCKIgD+AODLKgD+cyNldG5lcQBx4IsiAP4A4MwqAP4AAWhyhi2KLWUAdADhABIraSNhbmdsZQAAAWxyki2WLeUhZnQAoLIiaSJnaHQAAKCzInkAMmThIXNoAKCiIoABZWxyAKcttC24LWKiKCKuLQAAAACyLWEAcgAAoLsicQAAoFoi7CFpcACg7iIAAWJ0vC1eD2EA8gBfD3IAAOA12DPddAByAOkAlS1zAHUAAAFicM0t0C0A4IIi0iAA4IMi0iBwAGYAAOA12GfdcgBvAPAAWQt0AHIA6QCaLQABY3XkLegtcgAA4DXYy9wAAWJw7C30LW4AAAFFZXUt8S0A4IoiAP5uAAABRWV/LfktAOCLIgD+6SJnemFnAKCaKYADY2Vmb3BycwANLhAuJS4pLiMuLi40LukhcmN1YQABZGkULiEuAAFiZxguHC5hAHIAAKBfKmUAcaAnIgCgWSLlIXJwAKAYIXIAAOA12DTdcABmAADgNdho3WWgQCJhAHQA6ABqD2MAcgAA4DXYzNzjCuQRUC4AAFQuAABYLmIuAAAAAGMubS5wLnQuAAAAAIguki4AAJouJxIqEnQAcgDpAB0ScgAA4DXYNd0AAUFhWy5eLnIA8gDnAnIA8gCTB75jAAFBYWYuaS5yAPIA4AJyAPIAjAdhAPAAeh5pAHMAAKD7IoABZHB0APgReS6DLgABZmx9LoAuAOA12GnddQDzAP8RaQBtAOUABBIAAUFhiy6OLnIA8gDuAnIA8gCaBwABY3GVLgoScgAA4DXYzdwAAXB0nS6hLmwAdQDzACUScgDpACASAARhY2VmaW9zdbEuvC7ELsguzC7PLtQu2S5jAAABdXm2LrsudABlADuA/QD9QE9kAAFpecAuwy5yAGMAd2FLZG4AO4ClAKVAcgAA4DXYNt1jAHkAV2RwAGYAAOA12GrdYwByAADgNdjO3AABY23dLt8ueQBOZGwAO4D/AP9AAAVhY2RlZmhpb3N38y73Lv8uAi8MLxAvEy8YLx0vIi9jInV0ZQB6YQABYXn7Lv4u8iFvbn5hN2RvAHQAfGEAAWV0Bi8KL3QAcgDmAB8QYQC2Y3IAAOA12DfdYwB5ADZk5yJyYXJyAKDdIXAAZgAA4DXYa91jAHIAAOA12M/cAAFqbiYvKC8AoA0gagAAoAwg");

// ../../.workbuddy/binaries/node/workspace/node_modules/entities/dist/internal/bin-trie-flags.js
var BinTrieFlags;
(function(BinTrieFlags2) {
  BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
  BinTrieFlags2[BinTrieFlags2["FLAG13"] = 8192] = "FLAG13";
  BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 8064] = "BRANCH_LENGTH";
  BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));

// ../../.workbuddy/binaries/node/workspace/node_modules/entities/dist/decode.js
var CharCodes;
(function(CharCodes2) {
  CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
  CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
  CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
  CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
  CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
  CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
  CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
  CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
  CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
  CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
  CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
  CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes || (CharCodes = {}));
var TO_LOWER_BIT = 32;
function isNumber(code2) {
  return code2 >= CharCodes.ZERO && code2 <= CharCodes.NINE;
}
function isHexadecimalCharacter(code2) {
  return code2 >= CharCodes.UPPER_A && code2 <= CharCodes.UPPER_F || code2 >= CharCodes.LOWER_A && code2 <= CharCodes.LOWER_F;
}
function isAsciiAlphaNumeric(code2) {
  return code2 >= CharCodes.UPPER_A && code2 <= CharCodes.UPPER_Z || code2 >= CharCodes.LOWER_A && code2 <= CharCodes.LOWER_Z || isNumber(code2);
}
function isEntityInAttributeInvalidEnd(code2) {
  return code2 === CharCodes.EQUALS || isAsciiAlphaNumeric(code2);
}
var EntityDecoderState;
(function(EntityDecoderState2) {
  EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
  EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
  EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
  EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
  EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode2) {
  DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
  DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
  DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
var EntityDecoder = class {
  decodeTree;
  emitCodePoint;
  errors;
  constructor(decodeTree, emitCodePoint, errors) {
    this.decodeTree = decodeTree;
    this.emitCodePoint = emitCodePoint;
    this.errors = errors;
  }
  /** The current state of the decoder. */
  state = EntityDecoderState.EntityStart;
  /** Characters that were consumed while parsing an entity. */
  consumed = 1;
  /**
   * The result of the entity.
   *
   * Either the result index of a numeric entity, or the codepoint of a
   * numeric entity.
   */
  result = 0;
  /** The current index in the decode tree. */
  treeIndex = 0;
  /** The number of characters that were consumed in excess. */
  excess = 1;
  /** The mode in which the decoder is operating. */
  decodeMode = DecodingMode.Strict;
  /** The number of characters that have been consumed in the current run. */
  runConsumed = 0;
  /**
   * Resets the instance to make it reusable.
   * @param decodeMode Entity decoding mode to use.
   */
  startEntity(decodeMode) {
    this.decodeMode = decodeMode;
    this.state = EntityDecoderState.EntityStart;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.consumed = 1;
    this.runConsumed = 0;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(input, offset) {
    switch (this.state) {
      case EntityDecoderState.EntityStart: {
        if (input.charCodeAt(offset) === CharCodes.NUM) {
          this.state = EntityDecoderState.NumericStart;
          this.consumed += 1;
          return this.stateNumericStart(input, offset + 1);
        }
        this.state = EntityDecoderState.NamedEntity;
        return this.stateNamedEntity(input, offset);
      }
      case EntityDecoderState.NumericStart: {
        return this.stateNumericStart(input, offset);
      }
      case EntityDecoderState.NumericDecimal: {
        return this.stateNumericDecimal(input, offset);
      }
      case EntityDecoderState.NumericHex: {
        return this.stateNumericHex(input, offset);
      }
      case EntityDecoderState.NamedEntity: {
        return this.stateNamedEntity(input, offset);
      }
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(input, offset) {
    if (offset >= input.length) {
      return -1;
    }
    if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
      this.state = EntityDecoderState.NumericHex;
      this.consumed += 1;
      return this.stateNumericHex(input, offset + 1);
    }
    this.state = EntityDecoderState.NumericDecimal;
    return this.stateNumericDecimal(input, offset);
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(input, offset) {
    while (offset < input.length) {
      const char = input.charCodeAt(offset);
      if (isNumber(char) || isHexadecimalCharacter(char)) {
        const digit = char <= CharCodes.NINE ? char - CharCodes.ZERO : (char | TO_LOWER_BIT) - CharCodes.LOWER_A + 10;
        this.result = this.result * 16 + digit;
        this.consumed++;
        offset++;
      } else {
        return this.emitNumericEntity(char, 3);
      }
    }
    return -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(input, offset) {
    while (offset < input.length) {
      const char = input.charCodeAt(offset);
      if (isNumber(char)) {
        this.result = this.result * 10 + (char - CharCodes.ZERO);
        this.consumed++;
        offset++;
      } else {
        return this.emitNumericEntity(char, 2);
      }
    }
    return -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(lastCp, expectedLength) {
    if (this.consumed <= expectedLength) {
      this.errors?.absenceOfDigitsInNumericCharacterReference(this.consumed);
      return 0;
    }
    if (lastCp === CharCodes.SEMI) {
      this.consumed += 1;
    } else if (this.decodeMode === DecodingMode.Strict) {
      return 0;
    }
    this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
    if (this.errors) {
      if (lastCp !== CharCodes.SEMI) {
        this.errors.missingSemicolonAfterCharacterReference();
      }
      this.errors.validateNumericCharacterReference(this.result);
    }
    return this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(input, offset) {
    const { decodeTree } = this;
    let current = decodeTree[this.treeIndex];
    let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
    while (offset < input.length) {
      if (valueLength === 0 && (current & BinTrieFlags.FLAG13) !== 0) {
        const runLength = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
        if (this.runConsumed === 0) {
          const firstChar = current & BinTrieFlags.JUMP_TABLE;
          if (input.charCodeAt(offset) !== firstChar) {
            return this.result === 0 ? 0 : this.emitNotTerminatedNamedEntity();
          }
          offset++;
          this.excess++;
          this.runConsumed++;
        }
        while (this.runConsumed < runLength) {
          if (offset >= input.length) {
            return -1;
          }
          const charIndexInPacked = this.runConsumed - 1;
          const packedWord = decodeTree[this.treeIndex + 1 + (charIndexInPacked >> 1)];
          const expectedChar = charIndexInPacked % 2 === 0 ? packedWord & 255 : packedWord >> 8 & 255;
          if (input.charCodeAt(offset) !== expectedChar) {
            this.runConsumed = 0;
            return this.result === 0 ? 0 : this.emitNotTerminatedNamedEntity();
          }
          offset++;
          this.excess++;
          this.runConsumed++;
        }
        this.runConsumed = 0;
        this.treeIndex += 1 + (runLength >> 1);
        current = decodeTree[this.treeIndex];
        valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      }
      if (offset >= input.length)
        break;
      const char = input.charCodeAt(offset);
      if (char === CharCodes.SEMI && valueLength !== 0 && (current & BinTrieFlags.FLAG13) !== 0) {
        return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
      }
      this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
      if (this.treeIndex < 0) {
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
        (valueLength === 0 || // And there should be no invalid characters.
        isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
      }
      current = decodeTree[this.treeIndex];
      valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      if (valueLength !== 0) {
        if (char === CharCodes.SEMI) {
          return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
        }
        if (this.decodeMode !== DecodingMode.Strict && (current & BinTrieFlags.FLAG13) === 0) {
          this.result = this.treeIndex;
          this.consumed += this.excess;
          this.excess = 0;
        }
      }
      offset++;
      this.excess++;
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    const { result, decodeTree } = this;
    const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
    this.emitNamedEntityData(result, valueLength, this.consumed);
    this.errors?.missingSemicolonAfterCharacterReference();
    return this.consumed;
  }
  /**
   * Emit a named entity.
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(result, valueLength, consumed) {
    const { decodeTree } = this;
    this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~(BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13) : decodeTree[result + 1], consumed);
    if (valueLength === 3) {
      this.emitCodePoint(decodeTree[result + 2], consumed);
    }
    return consumed;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   * @returns The number of characters consumed.
   */
  end() {
    switch (this.state) {
      case EntityDecoderState.NamedEntity: {
        return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      }
      // Otherwise, emit a numeric entity if we have one.
      case EntityDecoderState.NumericDecimal: {
        return this.emitNumericEntity(0, 2);
      }
      case EntityDecoderState.NumericHex: {
        return this.emitNumericEntity(0, 3);
      }
      case EntityDecoderState.NumericStart: {
        this.errors?.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      case EntityDecoderState.EntityStart: {
        return 0;
      }
    }
  }
};
function getDecoder(decodeTree) {
  let returnValue = "";
  const decoder = new EntityDecoder(decodeTree, (data) => returnValue += String.fromCodePoint(data));
  return function decodeWithTrie(input, decodeMode) {
    let lastIndex = 0;
    let offset = 0;
    while ((offset = input.indexOf("&", offset)) >= 0) {
      returnValue += input.slice(lastIndex, offset);
      decoder.startEntity(decodeMode);
      const length = decoder.write(
        input,
        // Skip the "&"
        offset + 1
      );
      if (length < 0) {
        lastIndex = offset + decoder.end();
        break;
      }
      lastIndex = offset + length;
      offset = length === 0 ? lastIndex + 1 : lastIndex;
    }
    const result = returnValue + input.slice(lastIndex);
    returnValue = "";
    return result;
  };
}
function determineBranch(decodeTree, current, nodeIndex, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIndex : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIndex + value] - 1;
  }
  const packedKeySlots = branchCount + 1 >> 1;
  let lo = 0;
  let hi = branchCount - 1;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    const slot = mid >> 1;
    const packed = decodeTree[nodeIndex + slot];
    const midKey = packed >> (mid & 1) * 8 & 255;
    if (midKey < char) {
      lo = mid + 1;
    } else if (midKey > char) {
      hi = mid - 1;
    } else {
      return decodeTree[nodeIndex + packedKeySlots + mid];
    }
  }
  return -1;
}
var htmlDecoder = /* @__PURE__ */ getDecoder(htmlDecodeTree);
function decodeHTMLStrict(htmlString) {
  return htmlDecoder(htmlString, DecodingMode.Strict);
}

// ../../.workbuddy/binaries/node/workspace/node_modules/entities/dist/index.js
var EntityLevel;
(function(EntityLevel2) {
  EntityLevel2[EntityLevel2["XML"] = 0] = "XML";
  EntityLevel2[EntityLevel2["HTML"] = 1] = "HTML";
})(EntityLevel || (EntityLevel = {}));
var EncodingMode;
(function(EncodingMode2) {
  EncodingMode2[EncodingMode2["UTF8"] = 0] = "UTF8";
  EncodingMode2[EncodingMode2["ASCII"] = 1] = "ASCII";
  EncodingMode2[EncodingMode2["Extensive"] = 2] = "Extensive";
  EncodingMode2[EncodingMode2["Attribute"] = 3] = "Attribute";
  EncodingMode2[EncodingMode2["Text"] = 4] = "Text";
})(EncodingMode || (EncodingMode = {}));

// ../../.workbuddy/binaries/node/workspace/node_modules/linkify-it/build/index.mjs
var REBuilder = class {
  src_Any = Any.source;
  src_Cc = Cc.source;
  src_Z = Z.source;
  src_P = P.source;
  src_ZPCc = [
    this.src_Z,
    this.src_P,
    this.src_Cc
  ].join("|");
  src_ZCc = [this.src_Z, this.src_Cc].join("|");
  cache = {};
  opts = {
    maxLength: 1e4,
    urlAuth: false,
    schema_names: []
  };
  constructor(opts = {}) {
    this.opts = {
      ...this.opts,
      ...opts
    };
  }
  set(opts = {}) {
    this.opts = {
      ...this.opts,
      ...opts
    };
    this.cache = {};
    return this;
  }
  escapeRE(str) {
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  }
  nestedPairRE(open, close, depth = 4) {
    const openRE = this.escapeRE(open);
    const closeRE = this.escapeRE(close);
    const atom = `(?:(?!${this.src_ZCc}|${openRE}|${closeRE}).)`;
    let pair = `${openRE}${atom}{0,1000}${closeRE}`;
    for (let level = 2; level <= depth; level++) pair = `${openRE}(?:${atom}|${pair}){0,1000}${closeRE}`;
    return pair;
  }
  get_text_separators() {
    return this.cache.text_separators ??= /[><\uff5c]/;
  }
  get_pseudo_letter() {
    return this.cache.src_pseudo_letter ??= new RegExp(`(?:(?!${this.get_text_separators().source}|${this.src_ZPCc})${this.src_Any})`);
  }
  get_ipv4_addr() {
    return this.cache.src_ip4 ??= /* @__PURE__ */ new RegExp("(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])[.]){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])");
  }
  get_ipv6_addr() {
    const h16 = "[0-9A-Fa-f]{1,4}";
    const ls32 = `(?:(?:${h16}:${h16})|${this.get_ipv4_addr().source})`;
    return this.cache.src_ip6_addr ??= new RegExp(`(?:(?:${h16}:){6}${ls32}|::(?:${h16}:){5}${ls32}|(?:${h16})?::(?:${h16}:){4}${ls32}|(?:(?:${h16}:){0,1}${h16})?::(?:${h16}:){3}${ls32}|(?:(?:${h16}:){0,2}${h16})?::(?:${h16}:){2}${ls32}|(?:(?:${h16}:){0,3}${h16})?::${h16}:${ls32}|(?:(?:${h16}:){0,4}${h16})?::${ls32}|(?:(?:${h16}:){0,5}${h16})?::${h16}|(?:(?:${h16}:){0,6}${h16})?::)`);
  }
  get_ipv6_url_host() {
    return this.cache.src_ip6_host ??= new RegExp(`\\[${this.get_ipv6_addr().source}\\]`);
  }
  get_ipv6_mail_host() {
    return this.cache.src_ipv6_mail_host ??= new RegExp(`\\[IPv6:${this.get_ipv6_addr().source}\\]`);
  }
  get_auth() {
    return this.cache.src_auth ??= new RegExp(`(?:(?:(?!${this.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`);
  }
  get_port() {
    return this.cache.src_port ??= /* @__PURE__ */ new RegExp("(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?");
  }
  get_host_terminator() {
    return this.cache.src_host_terminator ??= new RegExp(`(?=$|${this.get_text_separators().source}|${this.src_ZPCc})(?!${this.opts["---"] ? "-(?!--)|" : "-|"}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`);
  }
  get_path_terminator() {
    return this.cache.src_path_terminator ??= new RegExp(`${this.src_ZPCc}|${this.get_text_separators().source}`);
  }
  get_path() {
    return this.cache.src_path ??= new RegExp(`(?:[/?#](?:${this.nestedPairRE("[", "]")}|${this.nestedPairRE("(", ")")}|${this.nestedPairRE("{", "}")}|\\"(?:(?!${this.src_ZCc}|["]).){1,100}\\"|\\'(?:(?!${this.src_ZCc}|[']).){1,100}\\'|\\'(?=${this.get_pseudo_letter().source}|[-])|\\.{2,20}[:]?[a-zA-Z0-9%/&]|\\.(?!${this.src_ZCc}|[.]|$)|` + (this.opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-{0,19})|" : "\\-{1,20}|") + `,(?!${this.src_ZCc}|$)|;(?!${this.src_ZCc}|$)|\\!{1,20}(?!${this.src_ZCc}|[!]|$)|\\?(?!${this.src_ZCc}|[?]|$)|` + this.get_path_extra().source + `[\\\\/:%@#&=_~*]|(?!${this.get_path_terminator().source}).){1,${this.opts.maxLength}}|\\/)?`);
  }
  get_mail_name() {
    return this.cache.src_mail_name ??= /* @__PURE__ */ new RegExp("[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9](?:[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9]|[.](?=[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9])){0,63}");
  }
  get_xn() {
    return this.cache.src_xn ??= /* @__PURE__ */ new RegExp("xn--[a-z0-9\\-]{1,59}");
  }
  get_tld() {
    if (this.cache.tld) return this.cache.tld;
    const tlds_src = [...new Set(this.opts.tlds || [])].sort().reverse().join("|");
    this.cache.tld = new RegExp(`${tlds_src || "$#none#$"}|${this.get_xn().source}`);
    return this.cache.tld;
  }
  get_domain_root() {
    return this.cache.src_domain_root ??= new RegExp("(?:" + this.get_xn().source + `|${this.get_pseudo_letter().source}{1,63})`);
  }
  get_domain() {
    return this.cache.src_domain ??= new RegExp("(?:" + this.get_xn().source + `|(?:${this.get_pseudo_letter().source})|(?:${this.get_pseudo_letter().source}(?:-|${this.get_pseudo_letter().source}){0,61}${this.get_pseudo_letter().source}))`);
  }
  get_url_host_port() {
    return this.cache.url_host_port ??= new RegExp("(?:" + this.get_ipv6_url_host().source + `|(?:(?:(?:${this.get_domain().source})\\.){0,10}${this.get_domain().source}))` + this.get_port().source + this.get_host_terminator().source);
  }
  get_fuzzy_url_host_port() {
    return this.cache.fuzzy_url_host_port ??= new RegExp("(?:" + (this.opts.fuzzyIP ? this.get_ipv4_addr().source + "|" : "") + `(?:(?:(?:${this.get_domain().source})\\.){1,10}(?:${this.get_tld().source})))` + this.get_host_terminator().source);
  }
  get_mail_host() {
    return this.cache.src_mail_host ??= new RegExp("(?:" + this.get_ipv6_mail_host().source + `|(?:(?:(?:${this.get_domain().source})\\.){0,4}${this.get_domain().source}))` + this.get_host_terminator().source);
  }
  get_fuzzy_mail_host() {
    return this.cache.src_fuzzy_mail_host ??= new RegExp("(?:" + this.get_ipv6_mail_host().source + `|(?:(?:(?:${this.get_domain().source})[.]){1,4}${this.get_domain_root().source}))` + this.get_host_terminator().source);
  }
  get_path_extra() {
    return this.cache.src_path_extra ??= /* @__PURE__ */ new RegExp("");
  }
  get_fuzzy_mail_host_search() {
    return this.cache.mail_fuzzy_host_search ??= new RegExp(`@${this.get_fuzzy_mail_host().source}`, "ig");
  }
  get_fuzzy_link_search() {
    return this.cache.link_fuzzy_search ??= new RegExp(`(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uFF5C]|${this.src_ZPCc}))(?:(?![$+<=>^\`|\uFF5C])${this.get_fuzzy_url_host_port().source}${this.get_path().source})`, "ig");
  }
  get_http_validator() {
    return this.cache.http_validator ??= new RegExp("\\/\\/" + (this.opts.urlAuth ? this.get_auth().source : "") + this.get_url_host_port().source + this.get_path().source, "iy");
  }
  get_relative_proto_validator() {
    return this.cache.relative_proto_validator ??= new RegExp((this.opts.urlAuth ? this.get_auth().source : "") + `(?:localhost|${this.get_ipv6_url_host().source}|(?:(?:${this.get_domain().source})[.]){1,10}${this.get_domain_root().source})` + this.get_port().source + this.get_host_terminator().source + this.get_path().source, "iy");
  }
  get_mail_name_validator() {
    return this.cache.mail_name_validator ??= new RegExp(`(?:^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})(${this.get_mail_name().source})$`);
  }
  get_mailto_validator() {
    return this.cache.mailto_validator ??= new RegExp(`${this.get_mail_name().source}@${this.get_mail_host().source}`, "iy");
  }
  get_schema_names() {
    return this.cache.schema_names ??= new RegExp((this.opts.schema_names || []).map((name) => this.escapeRE(name)).join("|"));
  }
  get_schema_search() {
    return this.cache.schema_search ??= new RegExp(`(^|(?!_)(?:[><\uFF5C]|${this.src_ZPCc}))(${this.get_schema_names().source})`, "ig");
  }
  get_schema_at_start() {
    return this.cache.schema_at_start ??= new RegExp(`^${this.get_schema_search().source}`, "i");
  }
};
var web_schema = {
  validate: (text2, pos, self) => {
    const re = self.re.get_http_validator();
    re.lastIndex = pos;
    const m = re.exec(text2);
    return m ? m[0].length : 0;
  },
  normalize: (match, self) => self.normalize(match)
};
var defaultSchemas = {
  "http:": web_schema,
  "https:": web_schema,
  "ftp:": web_schema,
  "//": {
    validate: function(text2, pos, self) {
      const re = self.re.get_relative_proto_validator();
      re.lastIndex = pos;
      const m = re.exec(text2);
      if (m) {
        if (pos >= 3 && text2[pos - 3] === ":") return 0;
        if (pos >= 3 && text2[pos - 3] === "/") return 0;
        return m[0].length;
      }
      return 0;
    },
    normalize: (match, self) => self.normalize(match)
  },
  "mailto:": {
    validate: function(text2, pos, self) {
      const re = self.re.get_mailto_validator();
      re.lastIndex = pos;
      const m = re.exec(text2);
      return m ? m[0].length : 0;
    },
    normalize: (match, self) => self.normalize(match)
  }
};
var tlds_2ch = "a:cdefgilmnoqrstuwxz|b:abdefghijmnorstvwyz|c:acdfghiklmnoruvwxyz|d:ejkmoz|e:cegrstu|f:ijkmor|g:abdefghilmnpqrstuwy|h:kmnrtu|i:delmnoqrst|j:emop|k:eghimnprwyz|l:abcikrstuvy|m:acdeghklmnopqrstuvwxyz|n:acefgilopruz|o:m|p:aefghklmnrstwy|q:a|r:eosuw|s:abcdeghijklmnortuvxyz|t:cdfghjklmnortvwz|u:agksyz|v:aceginu|w:fs|y:et|z:amw";
var tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444";
function unpackTlds() {
  const result = tlds_default.split("|");
  tlds_2ch.split("|").forEach((item) => {
    const sep = item.indexOf(":");
    const prefix = item.slice(0, sep);
    for (const suffix of item.slice(sep + 1)) result.push(prefix + suffix);
  });
  return result;
}
var defaultOptions = {
  fuzzyLink: false,
  fuzzyEmail: true,
  fuzzyIP: false,
  "---": false,
  tlds: unpackTlds(),
  urlAuth: false,
  maxLength: 1e4
};
var Match = class {
  /** Prefix (protocol) for matched string. Empty for fuzzy links. */
  schema;
  /** First position of matched string. */
  index;
  /** Next position after matched string. */
  lastIndex;
  /** Matched string. */
  raw;
  /** Normalized text of matched string. */
  text;
  /** Normalized URL of matched string. */
  url;
  constructor(text2, schema, index, lastIndex) {
    const raw = text2.slice(index, lastIndex);
    this.schema = schema.toLowerCase();
    this.index = index;
    this.lastIndex = lastIndex;
    this.raw = raw;
    this.text = raw;
    this.url = raw;
  }
};
var LinkifyIt = class {
  __opts__;
  __schemas__;
  re;
  /**
  * Creates new linkifier instance.
  *
  * By default understands:
  *
  * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
  * - "fuzzy" emails (foo@bar.com).
  *
  * See {@link LinkifyConstructorOptions} for available options.
  *
  * @param options Recognition options.
  *
  * @example
  * ```javascript
  * import { LinkifyIt } from 'linkify-it'
  *
  * const linkify = new LinkifyIt({ fuzzyLink: true })
  *
  * linkify
  *   .tlds(require('tlds'))       // Reload with full TLD list
  *   .tlds('onion', true)         // Add unofficial `.onion` domain
  *   .add('ftp:', null)           // Disable `ftp:` protocol
  *   .set({ fuzzyIP: true })      // Enable IPs in fuzzy links
  *
  * console.log(linkify.test('Site github.com!')) // true
  * console.log(linkify.match('Site github.com!'))
  * ```
  */
  constructor(options = {}) {
    const { rebuilder, ...linkifyOptions } = options;
    this.__opts__ = {
      ...defaultOptions,
      ...linkifyOptions
    };
    this.__schemas__ = { ...defaultSchemas };
    this.re = rebuilder || new REBuilder();
    this.re.set({
      ...this.__opts__,
      schema_names: Object.keys(this.__schemas__)
    });
  }
  /**
  * Add new rule definition.
  *
  * `schema` is a link prefix (usually, protocol name with `:` at the end,
  * `skype:` for example). `linkify-it` makes sure that prefix is not
  * preceded with alphanumeric char and symbols. Only whitespaces and
  * punctuation allowed.
  *
  * `definition` is a rule to check tail after link prefix. To disable an
  * existing rule, pass `null`.
  *
  * @param schema Rule name (fixed pattern prefix).
  * @param definition Schema definition, or `null` to disable the rule.
  *
  * See [twitter mentions example](https://github.com/markdown-it/linkify-it/blob/master/examples/twitter.mjs).
  */
  add(schema, definition = null) {
    if (!definition) delete this.__schemas__[schema];
    else {
      const def = {
        normalize: (match, self) => self.normalize(match),
        ...definition
      };
      this.__schemas__[schema] = def;
    }
    this.re.set({
      ...this.__opts__,
      schema_names: Object.keys(this.__schemas__)
    });
    return this;
  }
  /**
  * Set recognition options for links without schema.
  *
  * @param options Recognition options.
  */
  set(options = {}) {
    this.__opts__ = {
      ...this.__opts__,
      ...options
    };
    this.re.set({
      ...this.__opts__,
      schema_names: Object.keys(this.__schemas__)
    });
    return this;
  }
  /**
  * Searches linkifiable pattern and returns `true` on success or `false` on fail.
  *
  * @param text Text to scan.
  */
  test(text2) {
    if (!text2.length) return false;
    let m, re;
    re = this.re.get_schema_search();
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) if (this.testSchemaAt(text2, m[2], re.lastIndex)) return true;
    if (this.__opts__.fuzzyLink && this.__schemas__["http:"]) {
      re = this.re.get_fuzzy_link_search();
      re.lastIndex = 0;
      if (re.exec(text2) !== null) return true;
    }
    if (this.__opts__.fuzzyEmail && this.__schemas__["mailto:"]) {
      if (text2.indexOf("@") >= 0) {
        const mailHostRe = this.re.get_fuzzy_mail_host_search();
        const mailNameRe = this.re.get_mail_name_validator();
        mailHostRe.lastIndex = 0;
        while ((m = mailHostRe.exec(text2)) !== null) {
          const name = text2.slice(Math.max(0, m.index - 65), m.index);
          if (mailNameRe.test(name)) return true;
        }
      }
    }
    return false;
  }
  /**
  * Similar to {@link LinkifyIt.test} but checks only specific protocol tail exactly
  * at given position. Returns length of found pattern (0 on fail).
  *
  * @param text Text to scan.
  * @param schema Rule (schema) name.
  * @param pos Text offset to check from.
  */
  testSchemaAt(text2, schema, pos) {
    if (!this.__schemas__[schema.toLowerCase()]) return 0;
    return this.__schemas__[schema.toLowerCase()].validate(text2.slice(0, pos + this.__opts__.maxLength), pos, this);
  }
  /**
  * Returns array of found link descriptions or `null` on fail. We strongly
  * recommend to use {@link LinkifyIt.test} first, for best speed.
  *
  * @param text Text to scan.
  */
  match(text2) {
    const result = [];
    const schemaRe = this.re.get_schema_search();
    let fuzzyLinkRe;
    let mailHostRe;
    let mailNameRe;
    let fuzzyLinkCandidate;
    let fuzzyEmailCandidate;
    let schemaPrefix;
    let schemaDone = false;
    let fuzzyLinkDone = false;
    let fuzzyEmailDone = false;
    let pos = 0;
    if (!text2.length) return null;
    schemaRe.lastIndex = 0;
    if (this.__opts__.fuzzyLink && this.__schemas__["http:"]) {
      fuzzyLinkRe = this.re.get_fuzzy_link_search();
      fuzzyLinkRe.lastIndex = 0;
    }
    if (this.__opts__.fuzzyEmail && this.__schemas__["mailto:"]) {
      mailHostRe = this.re.get_fuzzy_mail_host_search();
      mailHostRe.lastIndex = 0;
      mailNameRe = this.re.get_mail_name_validator();
    }
    for (; ; ) {
      const scanFrom = Math.max(pos - 1, 0);
      if (mailHostRe && mailNameRe && !fuzzyEmailDone && (!fuzzyEmailCandidate || fuzzyEmailCandidate.index < pos)) {
        if (mailHostRe.lastIndex < scanFrom) mailHostRe.lastIndex = scanFrom;
        for (; ; ) {
          const m = mailHostRe.exec(text2);
          if (!m) {
            fuzzyEmailDone = true;
            fuzzyEmailCandidate = void 0;
            break;
          }
          const name = mailNameRe.exec(text2.slice(Math.max(0, m.index - 65), m.index));
          if (!name) continue;
          fuzzyEmailCandidate = {
            schema: "mailto:",
            index: m.index - name[1].length,
            lastIndex: m.index + m[0].length
          };
          if (fuzzyEmailCandidate.index >= pos) break;
          if (mailHostRe.lastIndex < scanFrom) mailHostRe.lastIndex = scanFrom;
        }
      }
      if (fuzzyLinkRe && !fuzzyLinkDone && (!fuzzyLinkCandidate || fuzzyLinkCandidate.index < pos)) {
        if (fuzzyLinkRe.lastIndex < scanFrom) fuzzyLinkRe.lastIndex = scanFrom;
        for (; ; ) {
          const m = fuzzyLinkRe.exec(text2);
          if (!m) {
            fuzzyLinkDone = true;
            fuzzyLinkCandidate = void 0;
            break;
          }
          fuzzyLinkCandidate = {
            schema: "",
            index: m.index + m[1].length,
            lastIndex: m.index + m[0].length
          };
          if (fuzzyLinkCandidate.index >= pos) break;
          if (fuzzyLinkRe.lastIndex < scanFrom) fuzzyLinkRe.lastIndex = scanFrom;
        }
      }
      let fuzzyCandidate = fuzzyEmailCandidate;
      if (!fuzzyCandidate || fuzzyLinkCandidate && (fuzzyLinkCandidate.index < fuzzyCandidate.index || fuzzyLinkCandidate.index === fuzzyCandidate.index && fuzzyLinkCandidate.lastIndex > fuzzyCandidate.lastIndex)) fuzzyCandidate = fuzzyLinkCandidate;
      let schemaCandidate;
      if (!schemaDone) for (; ; ) {
        if (!schemaPrefix) {
          if (schemaRe.lastIndex < scanFrom) schemaRe.lastIndex = scanFrom;
          const m = schemaRe.exec(text2);
          if (!m) {
            schemaDone = true;
            break;
          }
          schemaPrefix = {
            schema: m[2],
            index: m.index + m[1].length,
            lastIndex: m.index + m[0].length
          };
        }
        if (schemaPrefix.index < pos) {
          schemaPrefix = void 0;
          continue;
        }
        if (fuzzyCandidate && schemaPrefix.index > fuzzyCandidate.index) break;
        const prefix = schemaPrefix;
        schemaPrefix = void 0;
        const len = this.testSchemaAt(text2, prefix.schema, prefix.lastIndex);
        if (len) {
          schemaCandidate = {
            schema: prefix.schema,
            index: prefix.index,
            lastIndex: prefix.lastIndex + len
          };
          break;
        }
      }
      let candidate = schemaCandidate;
      if (!candidate || fuzzyEmailCandidate && (fuzzyEmailCandidate.index < candidate.index || fuzzyEmailCandidate.index === candidate.index && fuzzyEmailCandidate.lastIndex > candidate.lastIndex)) candidate = fuzzyEmailCandidate;
      if (!candidate || fuzzyLinkCandidate && (fuzzyLinkCandidate.index < candidate.index || fuzzyLinkCandidate.index === candidate.index && fuzzyLinkCandidate.lastIndex > candidate.lastIndex)) candidate = fuzzyLinkCandidate;
      if (!candidate) break;
      if (candidate === fuzzyEmailCandidate) fuzzyEmailCandidate = void 0;
      else if (candidate === fuzzyLinkCandidate) fuzzyLinkCandidate = void 0;
      const match = new Match(text2, candidate.schema, candidate.index, candidate.lastIndex);
      if (match.schema) this.__schemas__[match.schema].normalize(match, this);
      else this.normalize(match);
      result.push(match);
      pos = candidate.lastIndex;
    }
    if (result.length) return result;
    return null;
  }
  /**
  * Returns fully-formed (not fuzzy) link if it starts at the beginning
  * of the string, and null otherwise.
  *
  * @param text Text to scan.
  */
  matchAtStart(text2) {
    if (!text2.length) return null;
    const m = this.re.get_schema_at_start().exec(text2);
    if (!m) return null;
    const len = this.testSchemaAt(text2, m[2], m[0].length);
    if (!len) return null;
    const match = new Match(text2, m[2], m.index + m[1].length, m.index + m[0].length + len);
    this.__schemas__[match.schema].normalize(match, this);
    return match;
  }
  /**
  * Load (or merge) new TLDs list. Those are used for fuzzy links (without
  * prefix) to avoid false positives. By default this algorithm is used:
  *
  * - hostname with any 2-letter root zones are ok.
  * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
  *   are ok.
  * - encoded (`xn--...`) root zones are ok.
  *
  * If list is replaced, then exact match for 2-chars root zones will be checked.
  *
  * @param list List of TLDs.
  * @param keepOld Merge with current list if `true` (`false` by default).
  */
  tlds(list2, keepOld = false) {
    list2 = Array.isArray(list2) ? list2 : [list2];
    if (!keepOld) this.__opts__.tlds = list2;
    else this.__opts__.tlds = this.__opts__.tlds.concat(list2);
    this.re.set({
      ...this.__opts__,
      schema_names: Object.keys(this.__schemas__)
    });
    return this;
  }
  /**
  * Default normalizer (if schema does not define its own).
  *
  * @param match Match to normalize.
  */
  normalize(match) {
    if (!match.schema) match.url = `http://${match.url}`;
    if (match.schema === "mailto:" && !/^mailto:/i.test(match.url)) match.url = `mailto:${match.url}`;
  }
};

// ../../.workbuddy/binaries/node/workspace/node_modules/markdown-it/dist/markdown-it.mjs
var import_punycode = __toESM(require_punycode(), 1);
var __defProp2 = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
  let target = {};
  for (var name in all) __defProp2(target, name, {
    get: all[name],
    enumerable: true
  });
  if (!no_symbols) __defProp2(target, Symbol.toStringTag, { value: "Module" });
  return target;
};
var utils_exports = /* @__PURE__ */ __exportAll({
  arrayReplaceAt: () => arrayReplaceAt,
  asciiTrim: () => asciiTrim,
  callable: () => callable,
  escapeHtml: () => escapeHtml,
  escapeRE: () => escapeRE,
  fromCodePoint: () => fromCodePoint,
  isMdAsciiPunct: () => isMdAsciiPunct,
  isPunctChar: () => isPunctChar,
  isPunctCharCode: () => isPunctCharCode,
  isSpace: () => isSpace,
  isValidEntityCode: () => isValidEntityCode,
  isWhiteSpace: () => isWhiteSpace,
  lib: () => lib,
  normalizeReference: () => normalizeReference,
  unescapeAll: () => unescapeAll,
  unescapeMd: () => unescapeMd
});
function callable(cls) {
  const wrapper = function(...args) {
    return Reflect.construct(cls, args, new.target && new.target !== wrapper ? new.target : cls);
  };
  Object.defineProperty(wrapper, "name", { value: cls.name });
  Object.setPrototypeOf(wrapper, cls);
  wrapper.prototype = cls.prototype;
  return wrapper;
}
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}
function isValidEntityCode(c) {
  if (c >= 55296 && c <= 57343) return false;
  if (c >= 64976 && c <= 65007) return false;
  if ((c & 65535) === 65535 || (c & 65535) === 65534) return false;
  if (c >= 0 && c <= 8) return false;
  if (c === 11) return false;
  if (c >= 14 && c <= 31) return false;
  if (c >= 127 && c <= 159) return false;
  if (c > 1114111) return false;
  return true;
}
function fromCodePoint(c) {
  if (c > 65535) {
    c -= 65536;
    const surrogate1 = 55296 + (c >> 10);
    const surrogate2 = 56320 + (c & 1023);
    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}
var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
var UNESCAPE_ALL_RE = new RegExp(`${UNESCAPE_MD_RE.source}|${/&([a-z#][a-z0-9]{1,31});/gi.source}`, "gi");
var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function replaceEntityPattern(match, name) {
  if (name.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name)) {
    const code2 = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    if (isValidEntityCode(code2)) return fromCodePoint(code2);
    return match;
  }
  const decoded = decodeHTMLStrict(match);
  if (decoded !== match) return decoded;
  return match;
}
function unescapeMd(str) {
  if (str.indexOf("\\") < 0) return str;
  return str.replace(UNESCAPE_MD_RE, "$1");
}
function unescapeAll(str) {
  if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) return str;
  return str.replace(UNESCAPE_ALL_RE, function(match, escaped, entity2) {
    if (escaped) return escaped;
    return replaceEntityPattern(match, entity2);
  });
}
var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  return str;
}
var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
function escapeRE(str) {
  return str.replace(REGEXP_ESCAPE_RE, "\\$&");
}
function isSpace(code2) {
  switch (code2) {
    case 9:
    case 32:
      return true;
  }
  return false;
}
function isWhiteSpace(code2) {
  if (code2 >= 8192 && code2 <= 8202) return true;
  switch (code2) {
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 32:
    case 160:
    case 5760:
    case 8239:
    case 8287:
    case 12288:
      return true;
  }
  return false;
}
function isPunctChar(ch) {
  return P.test(ch) || S.test(ch);
}
function isPunctCharCode(code2) {
  return isPunctChar(fromCodePoint(code2));
}
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 124:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function normalizeReference(str) {
  str = str.trim().replace(/\s+/g, " ");
  return str.toLowerCase().toUpperCase();
}
function isAsciiTrimmable(c) {
  return c === 32 || c === 9 || c === 10 || c === 13;
}
function asciiTrim(str) {
  let start = 0;
  for (; start < str.length; start++) if (!isAsciiTrimmable(str.charCodeAt(start))) break;
  let end = str.length - 1;
  for (; end >= start; end--) if (!isAsciiTrimmable(str.charCodeAt(end))) break;
  return str.slice(start, end + 1);
}
var lib = {
  mdurl: mdurl_exports,
  ucmicro: build_exports
};
function parseLinkLabel(state, start, disableNested) {
  let level, found, marker, prevPos;
  const max = state.posMax;
  const oldPos = state.pos;
  state.pos = start + 1;
  level = 1;
  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 93) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }
    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 91) {
      if (prevPos === state.pos - 1) level++;
      else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }
  let labelEnd = -1;
  if (found) labelEnd = state.pos;
  state.pos = oldPos;
  return labelEnd;
}
function parseLinkDestination(str, start, max) {
  let code2;
  let pos = start;
  const result = {
    ok: false,
    pos: 0,
    str: ""
  };
  if (str.charCodeAt(pos) === 60) {
    pos++;
    while (pos < max) {
      code2 = str.charCodeAt(pos);
      if (code2 === 10) return result;
      if (code2 === 60) return result;
      if (code2 === 62) {
        result.pos = pos + 1;
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code2 === 92 && pos + 1 < max) {
        pos += 2;
        continue;
      }
      pos++;
    }
    return result;
  }
  let level = 0;
  while (pos < max) {
    code2 = str.charCodeAt(pos);
    if (code2 === 32) break;
    if (code2 < 32 || code2 === 127) break;
    if (code2 === 92 && pos + 1 < max) {
      if (str.charCodeAt(pos + 1) === 32) {
        pos++;
        continue;
      }
      pos += 2;
      continue;
    }
    if (code2 === 40) {
      level++;
      if (level > 32) return result;
    }
    if (code2 === 41) {
      if (level === 0) break;
      level--;
    }
    pos++;
  }
  if (start === pos) return result;
  if (level !== 0) return result;
  result.str = unescapeAll(str.slice(start, pos));
  result.pos = pos;
  result.ok = true;
  return result;
}
function parseLinkTitle(str, start, max, prev_state) {
  let code2;
  let pos = start;
  const state = {
    ok: false,
    can_continue: false,
    pos: 0,
    str: "",
    marker: 0
  };
  if (prev_state) {
    state.str = prev_state.str;
    state.marker = prev_state.marker;
  } else {
    if (pos >= max) return state;
    let marker = str.charCodeAt(pos);
    if (marker !== 34 && marker !== 39 && marker !== 40) return state;
    start++;
    pos++;
    if (marker === 40) marker = 41;
    state.marker = marker;
  }
  while (pos < max) {
    code2 = str.charCodeAt(pos);
    if (code2 === state.marker) {
      state.pos = pos + 1;
      state.str += unescapeAll(str.slice(start, pos));
      state.ok = true;
      return state;
    } else if (code2 === 40 && state.marker === 41) return state;
    else if (code2 === 92 && pos + 1 < max) pos++;
    pos++;
  }
  state.can_continue = true;
  state.str += unescapeAll(str.slice(start, pos));
  return state;
}
var helpers_exports = /* @__PURE__ */ __exportAll({
  parseLinkDestination: () => parseLinkDestination,
  parseLinkLabel: () => parseLinkLabel,
  parseLinkTitle: () => parseLinkTitle
});
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
var Token = class {
  constructor(type, tag, nesting) {
    _defineProperty(
      this,
      /**
      * Source map info. Format: `[ line_begin, line_end ]`
      */
      "map",
      null
    );
    _defineProperty(
      this,
      /**
      * nesting level, the same as `state.level`
      */
      "level",
      0
    );
    _defineProperty(
      this,
      /**
      * An array of child nodes (inline and img tokens)
      */
      "children",
      null
    );
    _defineProperty(
      this,
      /**
      * In a case of self-closing tag (code, html, fence, etc.),
      * it has contents of this tag.
      */
      "content",
      ""
    );
    _defineProperty(
      this,
      /**
      * '*' or '_' for emphasis, fence string for fence, etc.
      */
      "markup",
      ""
    );
    _defineProperty(
      this,
      /**
      * Additional information:
      *
      * - Info string for "fence" tokens
      * - The value "auto" for autolink "link_open" and "link_close" tokens
      * - The string value of the item marker for ordered-list "list_item_open" tokens
      */
      "info",
      ""
    );
    _defineProperty(
      this,
      /**
      * True for block-level tokens, false for inline tokens.
      * Used in renderer to calculate line breaks
      */
      "block",
      false
    );
    _defineProperty(
      this,
      /**
      * If it's true, ignore this element when rendering. Used for tight lists
      * to hide paragraphs.
      */
      "hidden",
      false
    );
    this.type = type;
    this.tag = tag;
    this.attrs = null;
    this.nesting = nesting;
    this.meta = null;
  }
  /**
  * Search attribute index by name.
  */
  attrIndex(name) {
    if (!this.attrs) return -1;
    const attrs = this.attrs;
    for (let i = 0, len = attrs.length; i < len; i++) if (attrs[i][0] === name) return i;
    return -1;
  }
  /**
  * Add `[ name, value ]` attribute to list. Init attrs if necessary
  */
  attrPush(attrData) {
    if (this.attrs) this.attrs.push(attrData);
    else this.attrs = [attrData];
  }
  /**
  * Set `name` attribute to `value`. Override old value if exists.
  */
  attrSet(name, value) {
    const idx = this.attrIndex(name);
    const attrData = [name, value];
    if (idx < 0) this.attrPush(attrData);
    else this.attrs[idx] = attrData;
  }
  /**
  * Get the value of attribute `name`, or null if it does not exist.
  */
  attrGet(name) {
    const idx = this.attrIndex(name);
    let value = null;
    if (idx >= 0) value = this.attrs[idx][1];
    return value;
  }
  /**
  * Join value to existing attribute via space. Or create new attribute if not
  * exists. Useful to operate with token classes.
  */
  attrJoin(name, value) {
    const idx = this.attrIndex(name);
    if (idx < 0) this.attrPush([name, value]);
    else this.attrs[idx][1] = `${this.attrs[idx][1]} ${value}`;
  }
};
var Ruler = class {
  constructor() {
    _defineProperty(this, "__rules__", []);
    _defineProperty(this, "__cache__", null);
  }
  __find__(name) {
    for (let i = 0; i < this.__rules__.length; i++) if (this.__rules__[i].name === name) return i;
    return -1;
  }
  __compile__() {
    const chains = /* @__PURE__ */ new Set();
    this.__rules__.forEach((rule) => {
      if (!rule.enabled) return;
      rule.alt.forEach((altName) => {
        if (altName) chains.add(altName);
      });
    });
    this.__cache__ = /* @__PURE__ */ Object.create(null);
    this.__cache__[""] = [];
    this.__rules__.forEach((rule) => {
      if (rule.enabled) this.__cache__[""].push(rule.fn);
    });
    chains.forEach((chain) => {
      this.__cache__[chain] = [];
      this.__rules__.forEach((rule) => {
        if (rule.enabled && rule.alt.indexOf(chain) >= 0) this.__cache__[chain].push(rule.fn);
      });
    });
  }
  /**
  * Replace rule by name with new function & options. Throws error if name not
  * found.
  *
  * @param name Rule name to replace.
  * @param fn New rule function.
  * @param options Rule options. `alt` is an array with names of "alternate"
  * chains.
  *
  * @example Replace existing typographer replacement rule with new one
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * md.core.ruler.at('replacements', function replace(state) {
  *   //...
  * });
  * ```
  */
  at(name, fn, options = {}) {
    const index = this.__find__(name);
    if (index === -1) throw new Error(`Parser rule not found: ${name}`);
    this.__rules__[index].fn = fn;
    this.__rules__[index].alt = options.alt || [];
    this.__cache__ = null;
  }
  /**
  * Add new rule to chain before one with given name. See also
  * {@link Ruler.after}, {@link Ruler.push}.
  *
  * @param beforeName New rule will be added before this one.
  * @param ruleName Name of added rule.
  * @param fn Rule function.
  * @param options Rule options. `alt` is an array with names of "alternate"
  * chains.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
  *   //...
  * });
  * ```
  */
  before(beforeName, ruleName, fn, options = {}) {
    const index = this.__find__(beforeName);
    if (index === -1) throw new Error(`Parser rule not found: ${beforeName}`);
    this.__rules__.splice(index, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }
  /**
  * Add new rule to chain after one with given name. See also
  * {@link Ruler.before}, {@link Ruler.push}.
  *
  * @param afterName New rule will be added after this one.
  * @param ruleName Name of added rule.
  * @param fn Rule function.
  * @param options Rule options. `alt` is an array with names of "alternate"
  * chains.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * md.inline.ruler.after('text', 'my_rule', function replace(state) {
  *   //...
  * });
  * ```
  */
  after(afterName, ruleName, fn, options = {}) {
    const index = this.__find__(afterName);
    if (index === -1) throw new Error(`Parser rule not found: ${afterName}`);
    this.__rules__.splice(index + 1, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }
  /**
  * Push new rule to the end of chain. See also
  * {@link Ruler.before}, {@link Ruler.after}.
  *
  * @param ruleName Name of added rule.
  * @param fn Rule function.
  * @param options Rule options. `alt` is an array with names of "alternate"
  * chains.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * md.core.ruler.push('my_rule', function replace(state) {
  *   //...
  * });
  * ```
  */
  push(ruleName, fn, options = {}) {
    this.__rules__.push({
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }
  /**
  * Enable rules with given names. If any rule name not found - throw Error.
  * Errors can be disabled by second param.
  *
  * See also {@link Ruler.disable}, {@link Ruler.enableOnly}.
  *
  * @param list List of rule names to enable.
  * @param ignoreInvalid Set `true` to ignore errors when rule not found.
  * @returns List of found rule names (if no exception happened).
  */
  enable(list2, ignoreInvalid = false) {
    if (!Array.isArray(list2)) list2 = [list2];
    const result = [];
    list2.forEach((name) => {
      const idx = this.__find__(name);
      if (idx < 0) {
        if (ignoreInvalid) return;
        throw new Error(`Rules manager: invalid rule name ${name}`);
      }
      this.__rules__[idx].enabled = true;
      result.push(name);
    });
    this.__cache__ = null;
    return result;
  }
  /**
  * Enable rules with given names, and disable everything else. If any rule name
  * not found - throw Error. Errors can be disabled by second param.
  *
  * See also {@link Ruler.disable}, {@link Ruler.enable}.
  *
  * @param list List of rule names to enable (whitelist).
  * @param ignoreInvalid Set `true` to ignore errors when rule not found.
  */
  enableOnly(list2, ignoreInvalid = false) {
    if (!Array.isArray(list2)) list2 = [list2];
    this.__rules__.forEach((rule) => {
      rule.enabled = false;
    });
    this.enable(list2, ignoreInvalid);
  }
  /**
  * Disable rules with given names. If any rule name not found - throw Error.
  * Errors can be disabled by second param.
  *
  * See also {@link Ruler.enable}, {@link Ruler.enableOnly}.
  *
  * @param list List of rule names to disable.
  * @param ignoreInvalid Set `true` to ignore errors when rule not found.
  * @returns List of found rule names (if no exception happened).
  */
  disable(list2, ignoreInvalid = false) {
    if (!Array.isArray(list2)) list2 = [list2];
    const result = [];
    list2.forEach((name) => {
      const idx = this.__find__(name);
      if (idx < 0) {
        if (ignoreInvalid) return;
        throw new Error(`Rules manager: invalid rule name ${name}`);
      }
      this.__rules__[idx].enabled = false;
      result.push(name);
    });
    this.__cache__ = null;
    return result;
  }
  /**
  * Return array of active functions (rules) for given chain name. It analyzes
  * rules configuration, compiles caches if not exists and returns result.
  *
  * Default chain name is `''` (empty string). It can't be skipped. That's
  * done intentionally, to keep signature monomorphic for high speed.
  */
  getRules(chainName) {
    if (!this.__cache__) this.__compile__();
    return this.__cache__[chainName] || [];
  }
};
var default_rules = {};
default_rules.code_inline = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return `<code${slf.renderAttrs(token)}>${escapeHtml(token.content)}</code>`;
};
default_rules.code_block = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return `<pre${slf.renderAttrs(token)}><code>${escapeHtml(tokens[idx].content)}</code></pre>
`;
};
default_rules.fence = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? unescapeAll(token.info).trim() : "";
  let langName = "";
  let langAttrs = "";
  if (info) {
    const arr = info.split(/(\s+)/g);
    langName = arr[0];
    langAttrs = arr.slice(2).join("");
  }
  let highlighted;
  if (options.highlight) highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
  else highlighted = escapeHtml(token.content);
  if (highlighted.indexOf("<pre") === 0) return highlighted + "\n";
  if (info) {
    const i = token.attrIndex("class");
    const tmpAttrs = token.attrs ? token.attrs.slice() : [];
    if (i < 0) tmpAttrs.push(["class", `${options.langPrefix}${langName}`]);
    else {
      tmpAttrs[i] = [tmpAttrs[i][0], tmpAttrs[i][1]];
      tmpAttrs[i][1] += ` ${options.langPrefix}${langName}`;
    }
    const tmpToken = { attrs: tmpAttrs };
    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>
`;
  }
  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>
`;
};
default_rules.image = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
  return slf.renderToken(tokens, idx, options);
};
default_rules.hardbreak = function(tokens, idx, options) {
  return options.xhtmlOut ? "<br />\n" : "<br>\n";
};
default_rules.softbreak = function(tokens, idx, options) {
  return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
};
default_rules.text = function(tokens, idx) {
  return escapeHtml(tokens[idx].content);
};
default_rules.html_block = function(tokens, idx) {
  return tokens[idx].content;
};
default_rules.html_inline = function(tokens, idx) {
  return tokens[idx].content;
};
var Renderer = class {
  constructor() {
    _defineProperty(
      this,
      /**
      * Contains render rules for tokens. Can be updated and extended.
      *
      * See [source code](https://github.com/markdown-it/markdown-it/blob/master/src/renderer.ts)
      * for more details and examples.
      *
      * @example Custom render rules
      * ```javascript
      * import MarkdownIt from 'markdown-it'
      * const md = new MarkdownIt()
      *
      * md.renderer.rules.strong_open  = function () { return '<b>'; };
      * md.renderer.rules.strong_close = function () { return '</b>'; };
      *
      * const result = md.renderInline(...);
      * ```
      *
      * @example Each rule is called as independent static function with fixed signature
      * ```javascript
      * function my_token_render(tokens, idx, options, env, renderer) {
      *   // ...
      *   return renderedHTML;
      * }
      * ```
      */
      "rules",
      Object.assign({}, default_rules)
    );
  }
  /**
  * Render token attributes to string.
  */
  renderAttrs(token) {
    let i, l, result;
    if (!token.attrs) return "";
    result = "";
    for (i = 0, l = token.attrs.length; i < l; i++) result += ` ${escapeHtml(token.attrs[i][0])}="${escapeHtml(String(token.attrs[i][1]))}"`;
    return result;
  }
  /**
  * Default token renderer. Can be overriden by custom function
  * in {@link Renderer.rules}.
  *
  * @param tokens List of tokens.
  * @param idx Token index to render.
  * @param options Params of parser instance.
  */
  renderToken(tokens, idx, options) {
    const token = tokens[idx];
    let result = "";
    if (token.hidden) return "";
    let prev = idx - 1;
    while (prev >= 0 && tokens[prev].hidden && tokens[prev].nesting === 0) prev--;
    if (token.block && token.nesting !== -1 && prev >= 0 && tokens[prev].hidden && tokens[prev].nesting === -1) result += "\n";
    result += (token.nesting === -1 ? "</" : "<") + token.tag;
    result += this.renderAttrs(token);
    if (token.nesting === 0 && options.xhtmlOut) result += " /";
    let needLf = false;
    if (token.block) {
      needLf = true;
      if (token.nesting === 1) {
        let next = idx + 1;
        while (next < tokens.length && tokens[next].hidden && tokens[next].nesting === 0) next++;
        if (next < tokens.length) {
          const nextToken = tokens[next];
          if (nextToken.type === "inline" || nextToken.hidden) needLf = false;
          else if (nextToken.nesting === -1 && nextToken.tag === token.tag) needLf = false;
        }
      }
    }
    result += needLf ? ">\n" : ">";
    return result;
  }
  /**
  * The same as {@link Renderer.render}, but for single token of `inline` type.
  *
  * @param tokens List on block tokens to render.
  * @param options Params of parser instance.
  * @param env Additional data from parsed input (references, for example).
  */
  renderInline(tokens, options, env) {
    let result = "";
    const rules = this.rules;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type;
      if (typeof rules[type] !== "undefined") result += rules[type](tokens, i, options, env, this);
      else result += this.renderToken(tokens, i, options);
    }
    return result;
  }
  /**
  * Special kludge for image `alt` attributes to conform CommonMark spec.
  * Don't try to use it! Spec requires to show `alt` content with stripped markup,
  * instead of simple escaping.
  *
  * @param tokens List on block tokens to render.
  * @param options Params of parser instance.
  * @param env Additional data from parsed input (references, for example).
  */
  renderInlineAsText(tokens, options, env) {
    let result = "";
    for (let i = 0, len = tokens.length; i < len; i++) switch (tokens[i].type) {
      case "text":
      case "code_inline":
        result += tokens[i].content;
        break;
      case "image":
        result += this.renderInlineAsText(tokens[i].children, options, env);
        break;
      case "html_inline":
      case "html_block":
        result += tokens[i].content;
        break;
      case "softbreak":
      case "hardbreak":
        result += "\n";
    }
    return result;
  }
  /**
  * Takes token stream and generates HTML. Probably, you will never need to call
  * this method directly.
  *
  * @param tokens List on block tokens to render.
  * @param options Params of parser instance.
  * @param env Additional data from parsed input (references, for example).
  */
  render(tokens, options, env) {
    let result = "";
    const rules = this.rules;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const type = tokens[i].type;
      if (type === "inline") result += this.renderInline(tokens[i].children, options, env);
      else if (typeof rules[type] !== "undefined") result += rules[type](tokens, i, options, env, this);
      else result += this.renderToken(tokens, i, options);
    }
    return result;
  }
};
var StateCore = class {
  constructor(src, md, env) {
    _defineProperty(this, "tokens", []);
    _defineProperty(this, "inlineMode", false);
    _defineProperty(this, "Token", Token);
    this.src = src;
    this.env = env;
    this.md = md;
  }
};
var NEWLINES_RE = /\r\n?|\n/g;
var NULL_RE = /\0/g;
function normalize(state) {
  let str;
  str = state.src.replace(NEWLINES_RE, "\n");
  str = str.replace(NULL_RE, "\uFFFD");
  state.src = str;
}
function block(state) {
  let token;
  if (state.inlineMode) {
    token = new state.Token("inline", "", 0);
    token.content = state.src;
    token.map = [0, 1];
    token.children = [];
    state.tokens.push(token);
  } else state.md.block.parse(state.src, state.md, state.env, state.tokens);
}
function strip_references(state) {
  const tokens = state.tokens;
  let last = 0;
  for (let curr = 0; curr < tokens.length; curr++) {
    if (tokens[curr].type === "reference_definition") continue;
    if (curr !== last) tokens[last] = tokens[curr];
    last++;
  }
  if (tokens.length !== last) tokens.length = last;
}
function inline(state) {
  const tokens = state.tokens;
  for (let i = 0, l = tokens.length; i < l; i++) {
    const tok = tokens[i];
    if (tok.type === "inline") state.md.inline.parse(tok.content, state.md, state.env, tok.children);
  }
}
function isLinkOpen$1(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose$1(str) {
  return /^<\/a\s*>/i.test(str);
}
function linkify$1(state) {
  const blockTokens = state.tokens;
  if (!state.md.options.linkify) return;
  for (let j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== "inline" || !state.md.linkify.test(blockTokens[j].content)) continue;
    let tokens = blockTokens[j].children;
    let htmlLinkLevel = 0;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const currentToken = tokens[i];
      if (currentToken.type === "link_close") {
        i--;
        while (tokens[i].level !== currentToken.level && tokens[i].type !== "link_open") i--;
        continue;
      }
      if (currentToken.type === "html_inline") {
        if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) htmlLinkLevel--;
        if (isLinkClose$1(currentToken.content)) htmlLinkLevel++;
      }
      if (htmlLinkLevel > 0) continue;
      if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
        const text2 = currentToken.content;
        let links = state.md.linkify.match(text2);
        const nodes = [];
        let level = currentToken.level;
        let lastPos = 0;
        if (links.length > 0 && links[0].index === 0 && i > 0 && tokens[i - 1].type === "text_special") links = links.slice(1);
        for (let ln = 0; ln < links.length; ln++) {
          const url = links[ln].url;
          const fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) continue;
          let urlText = links[ln].text;
          if (!links[ln].schema) urlText = state.md.normalizeLinkText(`http://${urlText}`).replace(/^http:\/\//, "");
          else if (links[ln].schema === "mailto:" && !/^mailto:/i.test(urlText)) urlText = state.md.normalizeLinkText(`mailto:${urlText}`).replace(/^mailto:/, "");
          else urlText = state.md.normalizeLinkText(urlText);
          const pos = links[ln].index;
          if (pos > lastPos) {
            const token = new state.Token("text", "", 0);
            token.content = text2.slice(lastPos, pos);
            token.level = level;
            nodes.push(token);
          }
          const token_o = new state.Token("link_open", "a", 1);
          token_o.attrs = [["href", fullUrl]];
          token_o.level = level++;
          token_o.markup = "linkify";
          token_o.info = "auto";
          nodes.push(token_o);
          const token_t = new state.Token("text", "", 0);
          token_t.content = urlText;
          token_t.level = level;
          nodes.push(token_t);
          const token_c = new state.Token("link_close", "a", -1);
          token_c.level = --level;
          token_c.markup = "linkify";
          token_c.info = "auto";
          nodes.push(token_c);
          lastPos = links[ln].lastIndex;
        }
        if (lastPos < text2.length) {
          const token = new state.Token("text", "", 0);
          token.content = text2.slice(lastPos);
          token.level = level;
          nodes.push(token);
        }
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }
}
var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
var SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
var SCOPED_ABBR_RE = /\((c|tm|r)\)/gi;
var SCOPED_ABBR = {
  c: "\xA9",
  r: "\xAE",
  tm: "\u2122"
};
function replaceFn(match, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}
function replace_scoped(inlineTokens) {
  let inside_autolink = 0;
  for (let i = inlineTokens.length - 1; i >= 0; i--) {
    const token = inlineTokens[i];
    if (token.type === "text" && !inside_autolink) token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    if (token.type === "link_open" && token.info === "auto") inside_autolink--;
    if (token.type === "link_close" && token.info === "auto") inside_autolink++;
  }
}
function replace_rare(inlineTokens) {
  let inside_autolink = 0;
  for (let i = inlineTokens.length - 1; i >= 0; i--) {
    const token = inlineTokens[i];
    if (token.type === "text" && !inside_autolink) {
      if (RARE_RE.test(token.content)) token.content = token.content.replace(/\+-/g, "\xB1").replace(/\.{2,}/g, "\u2026").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/gm, "$1\u2014").replace(/(^|\s)--(?=\s|$)/gm, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1\u2013");
    }
    if (token.type === "link_open" && token.info === "auto") inside_autolink--;
    if (token.type === "link_close" && token.info === "auto") inside_autolink++;
  }
}
function replace(state) {
  let blkIdx;
  if (!state.md.options.typographer) return;
  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline") continue;
    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) replace_scoped(state.tokens[blkIdx].children);
    if (RARE_RE.test(state.tokens[blkIdx].content)) replace_rare(state.tokens[blkIdx].children);
  }
}
var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var APOSTROPHE = "\u2019";
function addReplacement(replacements, tokenIdx, pos, ch) {
  if (!replacements[tokenIdx]) replacements[tokenIdx] = [];
  replacements[tokenIdx].push({
    pos,
    ch
  });
}
function applyReplacements(str, replacements) {
  let result = "";
  let lastPos = 0;
  replacements.sort((a, b) => a.pos - b.pos);
  for (let i = 0; i < replacements.length; i++) {
    const replacement = replacements[i];
    result += str.slice(lastPos, replacement.pos) + replacement.ch;
    lastPos = replacement.pos + 1;
  }
  return result + str.slice(lastPos);
}
function process_inlines(tokens, state) {
  let j;
  const stack = [];
  const replacements = {};
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const thisLevel = tokens[i].level;
    for (j = stack.length - 1; j >= 0; j--) if (stack[j].level <= thisLevel) break;
    stack.length = j + 1;
    if (token.type !== "text") continue;
    const text2 = token.content;
    let pos = 0;
    const max = text2.length;
    OUTER: while (pos < max) {
      QUOTE_RE.lastIndex = pos;
      const t = QUOTE_RE.exec(text2);
      if (!t) break;
      let canOpen = true;
      let canClose = true;
      pos = t.index + 1;
      const isSingle = t[0] === "'";
      let lastChar = 32;
      if (t.index - 1 >= 0) lastChar = text2.charCodeAt(t.index - 1);
      else for (j = i - 1; j >= 0; j--) {
        if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
        if (!tokens[j].content) continue;
        lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
        break;
      }
      let nextChar = 32;
      if (pos < max) nextChar = text2.charCodeAt(pos);
      else for (j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
        if (!tokens[j].content) continue;
        nextChar = tokens[j].content.charCodeAt(0);
        break;
      }
      const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
      const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
      const isLastWhiteSpace = isWhiteSpace(lastChar);
      const isNextWhiteSpace = isWhiteSpace(nextChar);
      if (isNextWhiteSpace) canOpen = false;
      else if (isNextPunctChar) {
        if (!(isLastWhiteSpace || isLastPunctChar)) canOpen = false;
      }
      if (isLastWhiteSpace) canClose = false;
      else if (isLastPunctChar) {
        if (!(isNextWhiteSpace || isNextPunctChar)) canClose = false;
      }
      if (nextChar === 34 && t[0] === '"') {
        if (lastChar >= 48 && lastChar <= 57) canClose = canOpen = false;
      }
      if (canOpen && canClose) {
        canOpen = isLastPunctChar;
        canClose = isNextPunctChar;
      }
      if (!canOpen && !canClose) {
        if (isSingle) addReplacement(replacements, i, t.index, APOSTROPHE);
        continue;
      }
      if (canClose) for (j = stack.length - 1; j >= 0; j--) {
        let item = stack[j];
        if (stack[j].level < thisLevel) break;
        if (item.single === isSingle && stack[j].level === thisLevel) {
          item = stack[j];
          let openQuote;
          let closeQuote;
          if (isSingle) {
            openQuote = state.md.options.quotes[2];
            closeQuote = state.md.options.quotes[3];
          } else {
            openQuote = state.md.options.quotes[0];
            closeQuote = state.md.options.quotes[1];
          }
          addReplacement(replacements, i, t.index, closeQuote);
          addReplacement(replacements, item.token, item.pos, openQuote);
          stack.length = j;
          continue OUTER;
        }
      }
      if (canOpen) stack.push({
        token: i,
        pos: t.index,
        single: isSingle,
        level: thisLevel
      });
      else if (canClose && isSingle) addReplacement(replacements, i, t.index, APOSTROPHE);
    }
  }
  Object.keys(replacements).forEach(function(tokenIdx) {
    const idx = Number(tokenIdx);
    tokens[idx].content = applyReplacements(tokens[idx].content, replacements[tokenIdx]);
  });
}
function smartquotes(state) {
  if (!state.md.options.typographer) return;
  for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) continue;
    process_inlines(state.tokens[blkIdx].children, state);
  }
}
function join_alt(tokens) {
  let curr, last;
  const max = tokens.length;
  for (curr = 0; curr < max; curr++) if (tokens[curr].type === "text_special") tokens[curr].type = "text";
  for (curr = last = 0; curr < max; curr++) if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
  else {
    if (curr !== last) tokens[last] = tokens[curr];
    last++;
  }
  if (curr !== last) tokens.length = last;
}
function text_join(state) {
  let curr, last;
  const blockTokens = state.tokens;
  const l = blockTokens.length;
  for (let j = 0; j < l; j++) {
    if (blockTokens[j].type !== "inline") continue;
    const tokens = blockTokens[j].children;
    const max = tokens.length;
    for (curr = 0; curr < max; curr++) {
      if (tokens[curr].type === "text_special") tokens[curr].type = "text";
      if (tokens[curr].children) join_alt(tokens[curr].children);
    }
    for (curr = last = 0; curr < max; curr++) if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    else {
      if (curr !== last) tokens[last] = tokens[curr];
      last++;
    }
    if (curr !== last) tokens.length = last;
  }
}
var _rules$2 = [
  ["normalize", normalize],
  ["block", block],
  ["strip_references", strip_references],
  ["inline", inline],
  ["linkify", linkify$1],
  ["replacements", replace],
  ["smartquotes", smartquotes],
  ["text_join", text_join]
];
var ParserCore = class {
  constructor() {
    _defineProperty(
      this,
      /**
      * {@link Ruler} instance. Keep configuration of core rules.
      */
      "ruler",
      new Ruler()
    );
    _defineProperty(this, "State", StateCore);
    for (let i = 0; i < _rules$2.length; i++) this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
  }
  /**
  * Executes core chain rules.
  */
  process(state) {
    const rules = this.ruler.getRules("");
    for (let i = 0, l = rules.length; i < l; i++) rules[i](state);
  }
};
var StateBlock = class {
  constructor(src, md, env, tokens) {
    _defineProperty(this, "bMarks", []);
    _defineProperty(this, "eMarks", []);
    _defineProperty(this, "tShift", []);
    _defineProperty(this, "sCount", []);
    _defineProperty(this, "bsCount", []);
    _defineProperty(this, "blkIndent", 0);
    _defineProperty(this, "line", 0);
    _defineProperty(this, "lineMax", 0);
    _defineProperty(this, "tight", false);
    _defineProperty(this, "listIndent", -1);
    _defineProperty(this, "parentType", "root");
    _defineProperty(this, "level", 0);
    _defineProperty(this, "Token", Token);
    this.src = src;
    this.md = md;
    this.env = env;
    this.tokens = tokens;
    const s = this.src;
    for (let start = 0, pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false; pos < len; pos++) {
      const ch = s.charCodeAt(pos);
      if (!indent_found) if (isSpace(ch)) {
        indent++;
        if (ch === 9) offset += 4 - offset % 4;
        else offset++;
        continue;
      } else indent_found = true;
      if (ch === 10 || pos === len - 1) {
        if (ch !== 10) pos++;
        this.bMarks.push(start);
        this.eMarks.push(pos);
        this.tShift.push(indent);
        this.sCount.push(offset);
        this.bsCount.push(0);
        indent_found = false;
        indent = 0;
        offset = 0;
        start = pos + 1;
      }
    }
    this.bMarks.push(s.length);
    this.eMarks.push(s.length);
    this.tShift.push(0);
    this.sCount.push(0);
    this.bsCount.push(0);
    this.lineMax = this.bMarks.length - 1;
  }
  push(type, tag, nesting) {
    const token = new Token(type, tag, nesting);
    token.block = true;
    if (nesting < 0) this.level--;
    token.level = this.level;
    if (nesting > 0) this.level++;
    this.tokens.push(token);
    return token;
  }
  isEmpty(line) {
    return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
  }
  skipEmptyLines(from) {
    for (let max = this.lineMax; from < max; from++) if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) break;
    return from;
  }
  skipSpaces(pos) {
    for (let max = this.src.length; pos < max; pos++) if (!isSpace(this.src.charCodeAt(pos))) break;
    return pos;
  }
  skipSpacesBack(pos, min) {
    if (pos <= min) return pos;
    while (pos > min) if (!isSpace(this.src.charCodeAt(--pos))) return pos + 1;
    return pos;
  }
  skipChars(pos, code2) {
    for (let max = this.src.length; pos < max; pos++) if (this.src.charCodeAt(pos) !== code2) break;
    return pos;
  }
  skipCharsBack(pos, code2, min) {
    if (pos <= min) return pos;
    while (pos > min) if (code2 !== this.src.charCodeAt(--pos)) return pos + 1;
    return pos;
  }
  getLines(begin, end, indent, keepLastLF) {
    if (begin >= end) return "";
    const queue = new Array(end - begin);
    for (let i = 0, line = begin; line < end; line++, i++) {
      let lineIndent = 0;
      const lineStart = this.bMarks[line];
      let first = lineStart;
      let last;
      if (line + 1 < end || keepLastLF) last = this.eMarks[line] + 1;
      else last = this.eMarks[line];
      while (first < last && lineIndent < indent) {
        const ch = this.src.charCodeAt(first);
        if (isSpace(ch)) if (ch === 9) lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
        else lineIndent++;
        else if (first - lineStart < this.tShift[line]) lineIndent++;
        else break;
        first++;
      }
      if (lineIndent > indent) queue[i] = new Array(lineIndent - indent + 1).join(" ") + this.src.slice(first, last);
      else queue[i] = this.src.slice(first, last);
    }
    return queue.join("");
  }
};
var MAX_AUTOCOMPLETED_CELLS = 65536;
function getLine(state, line) {
  const pos = state.bMarks[line] + state.tShift[line];
  const max = state.eMarks[line];
  return state.src.slice(pos, max);
}
function escapedSplit(str) {
  const result = [];
  const max = str.length;
  let pos = 0;
  let ch = str.charCodeAt(pos);
  let isEscaped = false;
  let lastPos = 0;
  let current = "";
  while (pos < max) {
    if (ch === 124) if (!isEscaped) {
      result.push(current + str.substring(lastPos, pos));
      current = "";
      lastPos = pos + 1;
    } else {
      current += str.substring(lastPos, pos - 1);
      lastPos = pos;
    }
    isEscaped = ch === 92;
    pos++;
    ch = str.charCodeAt(pos);
  }
  result.push(current + str.substring(lastPos));
  return result;
}
function table(state, startLine, endLine, silent) {
  if (startLine + 2 > endLine) return false;
  let nextLine = startLine + 1;
  if (state.sCount[nextLine] < state.blkIndent) return false;
  if (state.sCount[nextLine] - state.blkIndent >= 4) return false;
  let pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) return false;
  const firstCh = state.src.charCodeAt(pos++);
  if (firstCh !== 124 && firstCh !== 45 && firstCh !== 58) return false;
  if (pos >= state.eMarks[nextLine]) return false;
  const secondCh = state.src.charCodeAt(pos++);
  if (secondCh !== 124 && secondCh !== 45 && secondCh !== 58 && !isSpace(secondCh)) return false;
  if (firstCh === 45 && isSpace(secondCh)) return false;
  while (pos < state.eMarks[nextLine]) {
    const ch = state.src.charCodeAt(pos);
    if (ch !== 124 && ch !== 45 && ch !== 58 && !isSpace(ch)) return false;
    pos++;
  }
  let lineText = getLine(state, startLine + 1);
  let columns = lineText.split("|");
  const aligns = [];
  for (let i = 0; i < columns.length; i++) {
    const t = columns[i].trim();
    if (!t) if (i === 0 || i === columns.length - 1) continue;
    else return false;
    if (!/^:?-+:?$/.test(t)) return false;
    if (t.charCodeAt(t.length - 1) === 58) aligns.push(t.charCodeAt(0) === 58 ? "center" : "right");
    else if (t.charCodeAt(0) === 58) aligns.push("left");
    else aligns.push("");
  }
  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf("|") === -1) return false;
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  columns = escapedSplit(lineText);
  if (columns.length && columns[0] === "") columns.shift();
  if (columns.length && columns[columns.length - 1] === "") columns.pop();
  const columnCount = columns.length;
  if (columnCount === 0 || columnCount !== aligns.length) return false;
  if (silent) return true;
  const oldParentType = state.parentType;
  state.parentType = "table";
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const token_to = state.push("table_open", "table", 1);
  const tableLines = [startLine, 0];
  token_to.map = tableLines;
  const token_tho = state.push("thead_open", "thead", 1);
  token_tho.map = [startLine, startLine + 1];
  const token_htro = state.push("tr_open", "tr", 1);
  token_htro.map = [startLine, startLine + 1];
  for (let i = 0; i < columns.length; i++) {
    const token_ho = state.push("th_open", "th", 1);
    if (aligns[i]) token_ho.attrs = [["style", `text-align:${aligns[i]}`]];
    const token_il = state.push("inline", "", 0);
    token_il.content = columns[i].trim();
    token_il.children = [];
    state.push("th_close", "th", -1);
  }
  state.push("tr_close", "tr", -1);
  state.push("thead_close", "thead", -1);
  let tbodyLines;
  let autocompletedCells = 0;
  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) break;
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) if (terminatorRules[i](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) break;
    lineText = getLine(state, nextLine).trim();
    if (!lineText) break;
    if (state.sCount[nextLine] - state.blkIndent >= 4) break;
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "") columns.shift();
    if (columns.length && columns[columns.length - 1] === "") columns.pop();
    autocompletedCells += columnCount - columns.length;
    if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) break;
    if (nextLine === startLine + 2) {
      const token_tbo = state.push("tbody_open", "tbody", 1);
      token_tbo.map = tbodyLines = [startLine + 2, 0];
    }
    const token_tro = state.push("tr_open", "tr", 1);
    token_tro.map = [nextLine, nextLine + 1];
    for (let i = 0; i < columnCount; i++) {
      const token_tdo = state.push("td_open", "td", 1);
      if (aligns[i]) token_tdo.attrs = [["style", `text-align:${aligns[i]}`]];
      const token_il = state.push("inline", "", 0);
      token_il.content = columns[i] ? columns[i].trim() : "";
      token_il.children = [];
      state.push("td_close", "td", -1);
    }
    state.push("tr_close", "tr", -1);
  }
  if (tbodyLines) {
    state.push("tbody_close", "tbody", -1);
    tbodyLines[1] = nextLine;
  }
  state.push("table_close", "table", -1);
  tableLines[1] = nextLine;
  state.parentType = oldParentType;
  state.line = nextLine;
  return true;
}
function code(state, startLine, endLine) {
  if (state.sCount[startLine] - state.blkIndent < 4) return false;
  let nextLine = startLine + 1;
  let last = nextLine;
  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }
  state.line = last;
  const token = state.push("code_block", "code", 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + "\n";
  token.map = [startLine, state.line];
  return true;
}
function fence(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (pos + 3 > max) return false;
  const marker = state.src.charCodeAt(pos);
  if (marker !== 126 && marker !== 96) return false;
  let mem = pos;
  pos = state.skipChars(pos, marker);
  let len = pos - mem;
  if (len < 3) return false;
  const markup = state.src.slice(mem, pos);
  const params = state.src.slice(pos, max);
  if (marker === 96) {
    if (params.indexOf(String.fromCharCode(marker)) >= 0) return false;
  }
  if (silent) return true;
  let nextLine = startLine;
  let haveEndMarker = false;
  for (; ; ) {
    nextLine++;
    if (nextLine >= endLine) break;
    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos < max && state.sCount[nextLine] < state.blkIndent) break;
    if (state.src.charCodeAt(pos) !== marker) continue;
    if (state.sCount[nextLine] - state.blkIndent >= 4) continue;
    pos = state.skipChars(pos, marker);
    if (pos - mem < len) continue;
    pos = state.skipSpaces(pos);
    if (pos < max) continue;
    haveEndMarker = true;
    break;
  }
  len = state.sCount[startLine];
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  const token = state.push("fence", "code", 0);
  token.info = params;
  token.content = state.getLines(startLine + 1, nextLine, len, true);
  token.markup = markup;
  token.map = [startLine, state.line];
  return true;
}
function blockquote(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  const oldLineMax = state.lineMax;
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (state.src.charCodeAt(pos) !== 62) return false;
  if (silent) return true;
  const oldBMarks = [];
  const oldBSCount = [];
  const oldSCount = [];
  const oldTShift = [];
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const oldParentType = state.parentType;
  state.parentType = "blockquote";
  let lastLineEmpty = false;
  let nextLine;
  for (nextLine = startLine; nextLine < endLine; nextLine++) {
    const isOutdented = state.sCount[nextLine] < state.blkIndent;
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos >= max) break;
    if (state.src.charCodeAt(pos++) === 62 && !isOutdented) {
      let initial = state.sCount[nextLine] + 1;
      let spaceAfterMarker;
      let adjustTab;
      if (state.src.charCodeAt(pos) === 32) {
        pos++;
        initial++;
        adjustTab = false;
        spaceAfterMarker = true;
      } else if (state.src.charCodeAt(pos) === 9) {
        spaceAfterMarker = true;
        if ((state.bsCount[nextLine] + initial) % 4 === 3) {
          pos++;
          initial++;
          adjustTab = false;
        } else adjustTab = true;
      } else spaceAfterMarker = false;
      let offset = initial;
      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;
      while (pos < max) {
        const ch = state.src.charCodeAt(pos);
        if (isSpace(ch)) if (ch === 9) offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
        else offset++;
        else break;
        pos++;
      }
      lastLineEmpty = pos >= max;
      oldBSCount.push(state.bsCount[nextLine]);
      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = offset - initial;
      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }
    if (lastLineEmpty) break;
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) if (terminatorRules[i](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) {
      state.lineMax = nextLine;
      if (state.blkIndent !== 0) {
        oldBMarks.push(state.bMarks[nextLine]);
        oldBSCount.push(state.bsCount[nextLine]);
        oldTShift.push(state.tShift[nextLine]);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] -= state.blkIndent;
      }
      break;
    }
    oldBMarks.push(state.bMarks[nextLine]);
    oldBSCount.push(state.bsCount[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);
    state.sCount[nextLine] = -1;
  }
  const oldIndent = state.blkIndent;
  state.blkIndent = 0;
  const token_o = state.push("blockquote_open", "blockquote", 1);
  token_o.markup = ">";
  const lines = [startLine, 0];
  token_o.map = lines;
  state.md.block.tokenize(state, startLine, nextLine);
  const token_c = state.push("blockquote_close", "blockquote", -1);
  token_c.markup = ">";
  state.lineMax = oldLineMax;
  state.parentType = oldParentType;
  lines[1] = state.line;
  for (let i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
    state.bsCount[i + startLine] = oldBSCount[i];
  }
  state.blkIndent = oldIndent;
  return true;
}
function hr(state, startLine, endLine, silent) {
  const max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 95) return false;
  let cnt = 1;
  while (pos < max) {
    const ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) return false;
    if (ch === marker) cnt++;
  }
  if (cnt < 3) return false;
  if (silent) return true;
  state.line = startLine + 1;
  const token = state.push("hr", "hr", 0);
  token.map = [startLine, state.line];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
  return true;
}
function skipBulletListMarker(state, startLine) {
  const max = state.eMarks[startLine];
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 43) return -1;
  if (pos < max) {
    if (!isSpace(state.src.charCodeAt(pos))) return -1;
  }
  return pos;
}
function skipOrderedListMarker(state, startLine) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  let pos = start;
  if (pos + 1 >= max) return -1;
  let ch = state.src.charCodeAt(pos++);
  if (ch < 48 || ch > 57) return -1;
  for (; ; ) {
    if (pos >= max) return -1;
    ch = state.src.charCodeAt(pos++);
    if (ch >= 48 && ch <= 57) {
      if (pos - start >= 10) return -1;
      continue;
    }
    if (ch === 41 || ch === 46) break;
    return -1;
  }
  if (pos < max) {
    ch = state.src.charCodeAt(pos);
    if (!isSpace(ch)) return -1;
  }
  return pos;
}
function markTightParagraphs(state, idx) {
  const level = state.level + 2;
  for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") {
    state.tokens[i + 2].hidden = true;
    state.tokens[i].hidden = true;
    i += 2;
  }
}
function list(state, startLine, endLine, silent) {
  let max, pos, start, token;
  let nextLine = startLine;
  let tight = true;
  if (state.sCount[nextLine] - state.blkIndent >= 4) return false;
  if (state.listIndent >= 0 && state.sCount[nextLine] - state.listIndent >= 4 && state.sCount[nextLine] < state.blkIndent) return false;
  let isTerminatingParagraph = false;
  if (silent && state.parentType === "paragraph") {
    if (state.sCount[nextLine] >= state.blkIndent) isTerminatingParagraph = true;
  }
  let isOrdered;
  let markerValue;
  let posAfterMarker;
  if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
    isOrdered = true;
    start = state.bMarks[nextLine] + state.tShift[nextLine];
    markerValue = Number(state.src.slice(start, posAfterMarker - 1));
    if (isTerminatingParagraph && markerValue !== 1) return false;
  } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) isOrdered = false;
  else return false;
  if (isTerminatingParagraph) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false;
  }
  if (silent) return true;
  const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
  const listTokIdx = state.tokens.length;
  if (isOrdered) {
    token = state.push("ordered_list_open", "ol", 1);
    if (markerValue !== 1) token.attrs = [["start", markerValue]];
  } else token = state.push("bullet_list_open", "ul", 1);
  const listLines = [nextLine, 0];
  token.map = listLines;
  token.markup = String.fromCharCode(markerCharCode);
  let prevEmptyEnd = false;
  const terminatorRules = state.md.block.ruler.getRules("list");
  const oldParentType = state.parentType;
  state.parentType = "list";
  while (nextLine < endLine) {
    pos = posAfterMarker;
    max = state.eMarks[nextLine];
    const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
    let offset = initial;
    while (pos < max) {
      const ch = state.src.charCodeAt(pos);
      if (ch === 9) offset += 4 - (offset + state.bsCount[nextLine]) % 4;
      else if (ch === 32) offset++;
      else break;
      pos++;
    }
    const contentStart = pos;
    let indentAfterMarker;
    if (contentStart >= max) indentAfterMarker = 1;
    else indentAfterMarker = offset - initial;
    if (indentAfterMarker > 4) indentAfterMarker = 1;
    const indent = initial + indentAfterMarker;
    token = state.push("list_item_open", "li", 1);
    token.markup = String.fromCharCode(markerCharCode);
    const itemLines = [nextLine, 0];
    token.map = itemLines;
    if (isOrdered) token.info = state.src.slice(start, posAfterMarker - 1);
    const oldTight = state.tight;
    const oldTShift = state.tShift[nextLine];
    const oldSCount = state.sCount[nextLine];
    const oldListIndent = state.listIndent;
    state.listIndent = state.blkIndent;
    state.blkIndent = indent;
    state.tight = true;
    state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
    state.sCount[nextLine] = offset;
    if (contentStart >= max && state.isEmpty(nextLine + 1)) state.line = Math.min(state.line + 2, endLine);
    else state.md.block.tokenize(state, nextLine, endLine);
    if (!state.tight || prevEmptyEnd) tight = false;
    prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);
    state.blkIndent = state.listIndent;
    state.listIndent = oldListIndent;
    state.tShift[nextLine] = oldTShift;
    state.sCount[nextLine] = oldSCount;
    state.tight = oldTight;
    token = state.push("list_item_close", "li", -1);
    token.markup = String.fromCharCode(markerCharCode);
    nextLine = state.line;
    itemLines[1] = nextLine;
    if (nextLine >= endLine) break;
    if (state.sCount[nextLine] < state.blkIndent) break;
    if (state.sCount[nextLine] - state.blkIndent >= 4) break;
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) if (terminatorRules[i](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) break;
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) break;
      start = state.bMarks[nextLine] + state.tShift[nextLine];
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) break;
    }
    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) break;
  }
  if (isOrdered) token = state.push("ordered_list_close", "ol", -1);
  else token = state.push("bullet_list_close", "ul", -1);
  token.markup = String.fromCharCode(markerCharCode);
  listLines[1] = nextLine;
  state.line = nextLine;
  state.parentType = oldParentType;
  if (tight) markTightParagraphs(state, listTokIdx);
  return true;
}
function reference(state, startLine, _endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  let nextLine = startLine + 1;
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (state.src.charCodeAt(pos) !== 91) return false;
  function getNextLine(nextLine2) {
    const endLine = state.lineMax;
    if (nextLine2 >= endLine || state.isEmpty(nextLine2)) return null;
    let isContinuation = false;
    if (state.sCount[nextLine2] - state.blkIndent > 3) isContinuation = true;
    if (state.sCount[nextLine2] < 0) isContinuation = true;
    if (!isContinuation) {
      const terminatorRules = state.md.block.ruler.getRules("reference");
      const oldParentType = state.parentType;
      state.parentType = "reference";
      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) if (terminatorRules[i](state, nextLine2, endLine, true)) {
        terminate = true;
        break;
      }
      state.parentType = oldParentType;
      if (terminate) return null;
    }
    const pos2 = state.bMarks[nextLine2] + state.tShift[nextLine2];
    const max2 = state.eMarks[nextLine2];
    return state.src.slice(pos2, max2 + 1);
  }
  let str = state.src.slice(pos, max + 1);
  max = str.length;
  let labelEnd = -1;
  for (pos = 1; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 91) return false;
    else if (ch === 93) {
      labelEnd = pos;
      break;
    } else if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (ch === 92) {
      pos++;
      if (pos < max && str.charCodeAt(pos) === 10) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      }
    }
  }
  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 58) return false;
  for (pos = labelEnd + 2; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (isSpace(ch)) {
    } else break;
  }
  const destRes = state.md.helpers.parseLinkDestination(str, pos, max);
  if (!destRes.ok) return false;
  const href = state.md.normalizeLink(destRes.str);
  if (!state.md.validateLink(href)) return false;
  pos = destRes.pos;
  const destEndPos = pos;
  const destEndLineNo = nextLine;
  const start = pos;
  for (; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (isSpace(ch)) {
    } else break;
  }
  let titleRes = state.md.helpers.parseLinkTitle(str, pos, max);
  while (titleRes.can_continue) {
    const lineContent = getNextLine(nextLine);
    if (lineContent === null) break;
    str += lineContent;
    pos = max;
    max = str.length;
    nextLine++;
    titleRes = state.md.helpers.parseLinkTitle(str, pos, max, titleRes);
  }
  let title;
  if (pos < max && start !== pos && titleRes.ok) {
    title = titleRes.str;
    pos = titleRes.pos;
  } else {
    title = "";
    pos = destEndPos;
    nextLine = destEndLineNo;
  }
  while (pos < max) {
    if (!isSpace(str.charCodeAt(pos))) break;
    pos++;
  }
  if (pos < max && str.charCodeAt(pos) !== 10) {
    if (title) {
      title = "";
      pos = destEndPos;
      nextLine = destEndLineNo;
      while (pos < max) {
        if (!isSpace(str.charCodeAt(pos))) break;
        pos++;
      }
    }
  }
  if (pos < max && str.charCodeAt(pos) !== 10) return false;
  const label = normalizeReference(str.slice(1, labelEnd));
  if (!label) return false;
  if (silent) return true;
  if (typeof state.env.references === "undefined") state.env.references = {};
  if (typeof state.env.references[label] === "undefined") state.env.references[label] = {
    title,
    href
  };
  const token = state.push("reference_definition", "", 0);
  token.map = [startLine, nextLine];
  token.hidden = true;
  const meta = /* @__PURE__ */ Object.create(null);
  meta.label = label;
  token.meta = meta;
  state.line = nextLine;
  return true;
}
var html_blocks_default = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
];
var open_tag = `<[A-Za-z][A-Za-z0-9\\-]*(?:\\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\\s*=\\s*(?:[^"'=<>\`\\x00-\\x20]+|'[^']*'|"[^"]*"))?)*\\s*\\/?>`;
var close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
var HTML_TAG_RE = new RegExp(`^(?:${open_tag}|${close_tag}|<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->|<[?][\\s\\S]*?[?]>|<![A-Za-z][^>]*>|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)`);
var HTML_OPEN_CLOSE_TAG_RE = new RegExp(`^(?:${open_tag}|${close_tag})`);
var HTML_SEQUENCES = [
  [
    /^<(script|pre|style|textarea)(?=(\s|>|$))/i,
    /<\/(script|pre|style|textarea)>/i,
    true
  ],
  [
    /^<!--/,
    /-->/,
    true
  ],
  [
    /^<\?/,
    /\?>/,
    true
  ],
  [
    /^<![A-Za-z]/,
    />/,
    true
  ],
  [
    /^<!\[CDATA\[/,
    /\]\]>/,
    true
  ],
  [
    new RegExp(`^</?(${html_blocks_default.join("|")})(?=(\\s|/?>|$))`, "i"),
    /^$/,
    true
  ],
  [
    new RegExp(`${HTML_OPEN_CLOSE_TAG_RE.source}\\s*$`),
    /^$/,
    false
  ]
];
function html_block(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (!state.md.options.html) return false;
  if (state.src.charCodeAt(pos) !== 60) return false;
  let lineText = state.src.slice(pos, max);
  let i = 0;
  for (; i < HTML_SEQUENCES.length; i++) if (HTML_SEQUENCES[i][0].test(lineText)) break;
  if (i === HTML_SEQUENCES.length) return false;
  if (silent) return HTML_SEQUENCES[i][2];
  let nextLine = startLine + 1;
  const endsOnBlankLine = HTML_SEQUENCES[i][1].test("");
  if (!HTML_SEQUENCES[i][1].test(lineText)) for (; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) {
      if (endsOnBlankLine || !state.isEmpty(nextLine)) break;
    }
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    lineText = state.src.slice(pos, max);
    if (HTML_SEQUENCES[i][1].test(lineText)) {
      if (lineText.length !== 0) nextLine++;
      break;
    }
  }
  state.line = nextLine;
  const token = state.push("html_block", "", 0);
  token.map = [startLine, nextLine];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
  return true;
}
function heading(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  let ch = state.src.charCodeAt(pos);
  if (ch !== 35 || pos >= max) return false;
  let level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 35 && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }
  if (level > 6 || pos < max && !isSpace(ch)) return false;
  if (silent) return true;
  max = state.skipSpacesBack(max, pos);
  const tmp = state.skipCharsBack(max, 35, pos);
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) max = tmp;
  state.line = startLine + 1;
  const token_o = state.push("heading_open", `h${level}`, 1);
  token_o.markup = "########".slice(0, level);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = asciiTrim(state.src.slice(pos, max));
  token_i.map = [startLine, state.line];
  token_i.children = [];
  const token_c = state.push("heading_close", `h${level}`, -1);
  token_c.markup = "########".slice(0, level);
  return true;
}
function lheading(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  const oldParentType = state.parentType;
  state.parentType = "paragraph";
  let level = 0;
  let marker;
  let nextLine = startLine + 1;
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) continue;
    if (state.sCount[nextLine] >= state.blkIndent) {
      let pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];
      if (pos < max) {
        marker = state.src.charCodeAt(pos);
        if (marker === 45 || marker === 61) {
          pos = state.skipChars(pos, marker);
          pos = state.skipSpaces(pos);
          if (pos >= max) {
            level = marker === 61 ? 1 : 2;
            break;
          }
        }
      }
    }
    if (state.sCount[nextLine] < 0) continue;
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) if (terminatorRules[i](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) break;
  }
  if (!level) {
    state.parentType = oldParentType;
    return false;
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine + 1;
  const token_o = state.push("heading_open", `h${level}`, 1);
  token_o.markup = String.fromCharCode(marker);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line - 1];
  token_i.children = [];
  const token_c = state.push("heading_close", `h${level}`, -1);
  token_c.markup = String.fromCharCode(marker);
  state.parentType = oldParentType;
  return true;
}
function paragraph(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  const oldParentType = state.parentType;
  let nextLine = startLine + 1;
  state.parentType = "paragraph";
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) continue;
    if (state.sCount[nextLine] < 0) continue;
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) if (terminatorRules[i](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) break;
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine;
  const token_o = state.push("paragraph_open", "p", 1);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line];
  token_i.children = [];
  state.push("paragraph_close", "p", -1);
  state.parentType = oldParentType;
  return true;
}
var _rules$1 = [
  [
    "table",
    table,
    ["paragraph", "reference"]
  ],
  ["code", code],
  [
    "fence",
    fence,
    [
      "paragraph",
      "reference",
      "blockquote",
      "list"
    ]
  ],
  [
    "blockquote",
    blockquote,
    [
      "paragraph",
      "reference",
      "blockquote",
      "list"
    ]
  ],
  [
    "hr",
    hr,
    [
      "paragraph",
      "reference",
      "blockquote",
      "list"
    ]
  ],
  [
    "list",
    list,
    [
      "paragraph",
      "reference",
      "blockquote"
    ]
  ],
  ["reference", reference],
  [
    "html_block",
    html_block,
    [
      "paragraph",
      "reference",
      "blockquote"
    ]
  ],
  [
    "heading",
    heading,
    [
      "paragraph",
      "reference",
      "blockquote"
    ]
  ],
  ["lheading", lheading],
  ["paragraph", paragraph]
];
var ParserBlock = class {
  constructor() {
    _defineProperty(
      this,
      /**
      * {@link Ruler} instance. Keep configuration of block rules.
      */
      "ruler",
      new Ruler()
    );
    _defineProperty(this, "State", StateBlock);
    for (let i = 0; i < _rules$1.length; i++) this.ruler.push(_rules$1[i][0], _rules$1[i][1], { alt: (_rules$1[i][2] || []).slice() });
  }
  tokenize(state, startLine, endLine) {
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    let line = startLine;
    let hasEmptyLines = false;
    while (line < endLine) {
      state.line = line = state.skipEmptyLines(line);
      if (line >= endLine) break;
      if (state.sCount[line] < state.blkIndent) break;
      if (state.level >= maxNesting) {
        state.line = endLine;
        break;
      }
      const prevLine = state.line;
      let ok = false;
      for (let i = 0; i < len; i++) {
        ok = rules[i](state, line, endLine, false);
        if (ok) {
          if (prevLine >= state.line) throw new Error("block rule didn't increment state.line");
          break;
        }
      }
      if (!ok) throw new Error("none of the block rules matched");
      state.tight = !hasEmptyLines;
      if (state.isEmpty(state.line - 1)) hasEmptyLines = true;
      line = state.line;
      if (line < endLine && state.isEmpty(line)) {
        hasEmptyLines = true;
        line++;
        state.line = line;
      }
    }
  }
  /**
  * Process input string and push block tokens into `outTokens`
  */
  parse(src, md, env, outTokens) {
    if (!src) return;
    const state = new this.State(src, md, env, outTokens);
    this.tokenize(state, state.line, state.lineMax);
  }
};
var StateInline = class {
  constructor(src, md, env, outTokens) {
    _defineProperty(this, "pos", 0);
    _defineProperty(this, "level", 0);
    _defineProperty(this, "pending", "");
    _defineProperty(this, "pendingLevel", 0);
    _defineProperty(this, "cache", {});
    _defineProperty(this, "backticks", {});
    _defineProperty(this, "backticksScanned", false);
    _defineProperty(this, "linkLevel", 0);
    _defineProperty(this, "delimiters", []);
    _defineProperty(this, "_prev_delimiters", []);
    _defineProperty(this, "Token", Token);
    this.src = src;
    this.env = env;
    this.md = md;
    this.tokens = outTokens;
    this.tokens_meta = Array(outTokens.length);
    this.posMax = this.src.length;
  }
  pushPending() {
    const token = new Token("text", "", 0);
    token.content = this.pending;
    token.level = this.pendingLevel;
    this.tokens.push(token);
    this.pending = "";
    return token;
  }
  push(type, tag, nesting) {
    if (this.pending) this.pushPending();
    const token = new Token(type, tag, nesting);
    let token_meta = void 0;
    if (nesting < 0) {
      this.level--;
      this.delimiters = this._prev_delimiters.pop();
    }
    token.level = this.level;
    if (nesting > 0) {
      this.level++;
      this._prev_delimiters.push(this.delimiters);
      this.delimiters = [];
      token_meta = { delimiters: this.delimiters };
    }
    this.pendingLevel = this.level;
    this.tokens.push(token);
    this.tokens_meta.push(token_meta);
    return token;
  }
  scanDelims(start, canSplitWord) {
    const max = this.posMax;
    const marker = this.src.charCodeAt(start);
    let lastChar;
    if (start === 0) lastChar = 32;
    else if (start === 1) {
      lastChar = this.src.charCodeAt(0);
      if ((lastChar & 63488) === 55296) lastChar = 65533;
    } else {
      lastChar = this.src.charCodeAt(start - 1);
      if ((lastChar & 64512) === 56320) {
        const highSurr = this.src.charCodeAt(start - 2);
        lastChar = (highSurr & 64512) === 55296 ? 65536 + (highSurr - 55296 << 10) + (lastChar - 56320) : 65533;
      } else if ((lastChar & 64512) === 55296) lastChar = 65533;
    }
    let pos = start;
    while (pos < max && this.src.charCodeAt(pos) === marker) pos++;
    const count = pos - start;
    let nextChar = pos < max ? this.src.charCodeAt(pos) : 32;
    if ((nextChar & 64512) === 55296) {
      const lowSurr = this.src.charCodeAt(pos + 1);
      nextChar = (lowSurr & 64512) === 56320 ? 65536 + (nextChar - 55296 << 10) + (lowSurr - 56320) : 65533;
    } else if ((nextChar & 64512) === 56320) nextChar = 65533;
    const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
    const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
    const isLastWhiteSpace = isWhiteSpace(lastChar);
    const isNextWhiteSpace = isWhiteSpace(nextChar);
    const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
    const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);
    return {
      can_open: left_flanking && (canSplitWord || !right_flanking || isLastPunctChar),
      can_close: right_flanking && (canSplitWord || !left_flanking || isNextPunctChar),
      length: count
    };
  }
};
function isTerminatorChar(ch) {
  switch (ch) {
    case 10:
    case 33:
    case 35:
    case 36:
    case 37:
    case 38:
    case 42:
    case 43:
    case 45:
    case 58:
    case 60:
    case 61:
    case 62:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function text(state, silent) {
  let pos = state.pos;
  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) pos++;
  if (pos === state.pos) return false;
  if (!silent) state.pending += state.src.slice(state.pos, pos);
  state.pos = pos;
  return true;
}
var SCHEME_RE = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
function linkify(state, silent) {
  if (!state.md.options.linkify) return false;
  if (state.linkLevel > 0) return false;
  const pos = state.pos;
  const max = state.posMax;
  if (pos + 3 > max) return false;
  if (state.src.charCodeAt(pos) !== 58) return false;
  if (state.src.charCodeAt(pos + 1) !== 47) return false;
  if (state.src.charCodeAt(pos + 2) !== 47) return false;
  const match = state.pending.match(SCHEME_RE);
  if (!match) return false;
  const proto = match[1];
  const link2 = state.md.linkify.matchAtStart(state.src.slice(pos - proto.length));
  if (!link2) return false;
  let url = link2.url;
  if (url.length <= proto.length) return false;
  let urlEnd = url.length;
  while (urlEnd > 0 && url.charCodeAt(urlEnd - 1) === 42) urlEnd--;
  if (urlEnd !== url.length) url = url.slice(0, urlEnd);
  const fullUrl = state.md.normalizeLink(url);
  if (!state.md.validateLink(fullUrl)) return false;
  if (!silent) {
    state.pending = state.pending.slice(0, -proto.length);
    const token_o = state.push("link_open", "a", 1);
    token_o.attrs = [["href", fullUrl]];
    token_o.markup = "linkify";
    token_o.info = "auto";
    const token_t = state.push("text", "", 0);
    token_t.content = state.md.normalizeLinkText(url);
    const token_c = state.push("link_close", "a", -1);
    token_c.markup = "linkify";
    token_c.info = "auto";
  }
  state.pos += url.length - proto.length;
  return true;
}
function newline(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 10) return false;
  const pmax = state.pending.length - 1;
  const max = state.posMax;
  if (!silent) if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
    let ws = pmax - 1;
    while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 32) ws--;
    state.pending = state.pending.slice(0, ws);
    state.push("hardbreak", "br", 0);
  } else {
    state.pending = state.pending.slice(0, -1);
    state.push("softbreak", "br", 0);
  }
  else state.push("softbreak", "br", 0);
  pos++;
  while (pos < max && isSpace(state.src.charCodeAt(pos))) pos++;
  state.pos = pos;
  return true;
}
var ESCAPED = [];
for (let i = 0; i < 256; i++) ESCAPED.push(0);
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(ch) {
  ESCAPED[ch.charCodeAt(0)] = 1;
});
function escape(state, silent) {
  let pos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(pos) !== 92) return false;
  pos++;
  if (pos >= max) return false;
  let ch1 = state.src.charCodeAt(pos);
  if (ch1 === 10) {
    if (!silent) state.push("hardbreak", "br", 0);
    pos++;
    while (pos < max) {
      ch1 = state.src.charCodeAt(pos);
      if (!isSpace(ch1)) break;
      pos++;
    }
    state.pos = pos;
    return true;
  }
  if (ch1 === 32) {
    if (!silent) {
      const token = state.push("text_special", "", 0);
      token.content = "\\";
      token.markup = "\\";
      token.info = "escape";
    }
    state.pos = pos;
    return true;
  }
  let escapedStr = state.src[pos];
  if (ch1 >= 55296 && ch1 <= 56319 && pos + 1 < max) {
    const ch2 = state.src.charCodeAt(pos + 1);
    if (ch2 >= 56320 && ch2 <= 57343) {
      escapedStr += state.src[pos + 1];
      pos++;
    }
  }
  const origStr = "\\" + escapedStr;
  if (!silent) {
    const token = state.push("text_special", "", 0);
    if (ch1 < 256 && ESCAPED[ch1] !== 0) token.content = escapedStr;
    else token.content = origStr;
    token.markup = origStr;
    token.info = "escape";
  }
  state.pos = pos + 1;
  return true;
}
function backtick(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 96) return false;
  const start = pos;
  pos++;
  const max = state.posMax;
  while (pos < max && state.src.charCodeAt(pos) === 96) pos++;
  const marker = state.src.slice(start, pos);
  const openerLength = marker.length;
  if (state.backticksScanned && (state.backticks[openerLength] || 0) <= start) {
    if (!silent) state.pending += marker;
    state.pos += openerLength;
    return true;
  }
  let matchEnd = pos;
  let matchStart;
  while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1) {
    matchEnd = matchStart + 1;
    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 96) matchEnd++;
    const closerLength = matchEnd - matchStart;
    if (closerLength === openerLength) {
      if (!silent) {
        const token = state.push("code_inline", "code", 0);
        token.markup = marker;
        token.content = state.src.slice(pos, matchStart).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
      }
      state.pos = matchEnd;
      return true;
    }
    state.backticks[closerLength] = matchStart;
  }
  state.backticksScanned = true;
  if (!silent) state.pending += marker;
  state.pos += openerLength;
  return true;
}
function strikethrough_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) return false;
  if (marker !== 126) return false;
  const scanned = state.scanDelims(state.pos, true);
  let len = scanned.length;
  const ch = String.fromCharCode(marker);
  if (len < 2) return false;
  let token;
  if (len % 2) {
    token = state.push("text", "", 0);
    token.content = ch;
    len--;
  }
  for (let i = 0; i < len; i += 2) {
    token = state.push("text", "", 0);
    token.content = ch + ch;
    state.delimiters.push({
      marker,
      length: 0,
      token: state.tokens.length - 1,
      end: -1,
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess$1(state, delimiters) {
  let token;
  const loneMarkers = [];
  const max = delimiters.length;
  for (let i = 0; i < max; i++) {
    const startDelim = delimiters[i];
    if (startDelim.marker !== 126) continue;
    if (startDelim.end === -1) continue;
    const endDelim = delimiters[startDelim.end];
    token = state.tokens[startDelim.token];
    token.type = "s_open";
    token.tag = "s";
    token.nesting = 1;
    token.markup = "~~";
    token.content = "";
    token = state.tokens[endDelim.token];
    token.type = "s_close";
    token.tag = "s";
    token.nesting = -1;
    token.markup = "~~";
    token.content = "";
    if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") loneMarkers.push(endDelim.token - 1);
  }
  while (loneMarkers.length) {
    const i = loneMarkers.pop();
    let j = i + 1;
    while (j < state.tokens.length && state.tokens[j].type === "s_close") j++;
    j--;
    if (i !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i];
      state.tokens[i] = token;
    }
  }
}
function strikethrough_postProcess(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  postProcess$1(state, state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    var _tokens_meta$curr;
    const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
    if (delimiters) postProcess$1(state, delimiters);
  }
}
var strikethrough_default = {
  tokenize: strikethrough_tokenize,
  postProcess: strikethrough_postProcess
};
function emphasis_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) return false;
  if (marker !== 95 && marker !== 42) return false;
  const scanned = state.scanDelims(state.pos, marker === 42);
  for (let i = 0; i < scanned.length; i++) {
    const token = state.push("text", "", 0);
    token.content = String.fromCharCode(marker);
    state.delimiters.push({
      marker,
      length: scanned.length,
      token: state.tokens.length - 1,
      end: -1,
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess(state, delimiters) {
  const max = delimiters.length;
  for (let i = max - 1; i >= 0; i--) {
    const startDelim = delimiters[i];
    if (startDelim.marker !== 95 && startDelim.marker !== 42) continue;
    if (startDelim.end === -1) continue;
    const endDelim = delimiters[startDelim.end];
    const isStrong = i > 0 && delimiters[i - 1].end === startDelim.end + 1 && delimiters[i - 1].marker === startDelim.marker && delimiters[i - 1].token === startDelim.token - 1 && delimiters[startDelim.end + 1].token === endDelim.token + 1;
    const ch = String.fromCharCode(startDelim.marker);
    const token_o = state.tokens[startDelim.token];
    token_o.type = isStrong ? "strong_open" : "em_open";
    token_o.tag = isStrong ? "strong" : "em";
    token_o.nesting = 1;
    token_o.markup = isStrong ? ch + ch : ch;
    token_o.content = "";
    const token_c = state.tokens[endDelim.token];
    token_c.type = isStrong ? "strong_close" : "em_close";
    token_c.tag = isStrong ? "strong" : "em";
    token_c.nesting = -1;
    token_c.markup = isStrong ? ch + ch : ch;
    token_c.content = "";
    if (isStrong) {
      state.tokens[delimiters[i - 1].token].content = "";
      state.tokens[delimiters[startDelim.end + 1].token].content = "";
      i--;
    }
  }
}
function emphasis_post_process(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  postProcess(state, state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    var _tokens_meta$curr;
    const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
    if (delimiters) postProcess(state, delimiters);
  }
}
var emphasis_default = {
  tokenize: emphasis_tokenize,
  postProcess: emphasis_post_process
};
function link(state, silent) {
  let code2, label, res, ref;
  let href = "";
  let title = "";
  let start = state.pos;
  let parseReference = true;
  if (state.src.charCodeAt(state.pos) !== 91) return false;
  const oldPos = state.pos;
  const max = state.posMax;
  const labelStart = state.pos + 1;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);
  if (labelEnd < 0) return false;
  let pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 40) {
    parseReference = false;
    pos++;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) break;
    }
    if (pos >= max) return false;
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) pos = res.pos;
      else href = "";
      start = pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) break;
      }
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;
        for (; pos < max; pos++) {
          code2 = state.src.charCodeAt(pos);
          if (!isSpace(code2) && code2 !== 10) break;
        }
      }
    }
    if (pos >= max || state.src.charCodeAt(pos) !== 41) parseReference = true;
    pos++;
  }
  if (parseReference) {
    if (typeof state.env.references === "undefined") return false;
    if (pos < max && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) label = state.src.slice(start, pos++);
      else pos = labelEnd + 1;
    } else pos = labelEnd + 1;
    if (!label) label = state.src.slice(labelStart, labelEnd);
    label = normalizeReference(label);
    ref = state.env.references[label];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;
    const token_o = state.push("link_open", "a", 1);
    const attrs = [["href", href]];
    token_o.attrs = attrs;
    if (title) attrs.push(["title", title]);
    if (label) {
      const meta = /* @__PURE__ */ Object.create(null);
      meta.label = label;
      token_o.meta = meta;
    }
    state.linkLevel++;
    state.md.inline.tokenize(state);
    state.linkLevel--;
    state.push("link_close", "a", -1);
  }
  state.pos = pos;
  state.posMax = max;
  return true;
}
function image(state, silent) {
  let code2, content, label, pos, ref, res, title, start;
  let href = "";
  const oldPos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(state.pos) !== 33) return false;
  if (state.src.charCodeAt(state.pos + 1) !== 91) return false;
  const labelStart = state.pos + 2;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
  if (labelEnd < 0) return false;
  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 40) {
    pos++;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) break;
    }
    if (pos >= max) return false;
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) pos = res.pos;
      else href = "";
    }
    start = pos;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) break;
    }
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) break;
      }
    } else title = "";
    if (pos >= max || state.src.charCodeAt(pos) !== 41) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    if (typeof state.env.references === "undefined") return false;
    if (pos < max && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) label = state.src.slice(start, pos++);
      else pos = labelEnd + 1;
    } else pos = labelEnd + 1;
    if (!label) label = state.src.slice(labelStart, labelEnd);
    label = normalizeReference(label);
    ref = state.env.references[label];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    content = state.src.slice(labelStart, labelEnd);
    const tokens = [];
    state.md.inline.parse(content, state.md, state.env, tokens);
    const token = state.push("image", "img", 0);
    const attrs = [["src", href], ["alt", ""]];
    token.attrs = attrs;
    token.children = tokens;
    token.content = content;
    if (title) attrs.push(["title", title]);
    if (label) {
      const meta = /* @__PURE__ */ Object.create(null);
      meta.label = label;
      token.meta = meta;
    }
  }
  state.pos = pos;
  state.posMax = max;
  return true;
}
var EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
var AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function autolink(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60) return false;
  const start = state.pos;
  const max = state.posMax;
  for (; ; ) {
    if (++pos >= max) return false;
    const ch = state.src.charCodeAt(pos);
    if (ch === 60) return false;
    if (ch === 62) break;
  }
  const url = state.src.slice(start + 1, pos);
  if (AUTOLINK_RE.test(url)) {
    const fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) return false;
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  if (EMAIL_RE.test(url)) {
    const fullUrl = state.md.normalizeLink(`mailto:${url}`);
    if (!state.md.validateLink(fullUrl)) return false;
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  return false;
}
function isLinkOpen(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose(str) {
  return /^<\/a\s*>/i.test(str);
}
function isLetter(ch) {
  const lc = ch | 32;
  return lc >= 97 && lc <= 122;
}
function html_inline(state, silent) {
  if (!state.md.options.html) return false;
  const max = state.posMax;
  const pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max) return false;
  const ch = state.src.charCodeAt(pos + 1);
  if (ch !== 33 && ch !== 63 && ch !== 47 && !isLetter(ch)) return false;
  const match = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match) return false;
  if (!silent) {
    const token = state.push("html_inline", "", 0);
    token.content = match[0];
    if (isLinkOpen(token.content)) state.linkLevel++;
    if (isLinkClose(token.content)) state.linkLevel--;
  }
  state.pos += match[0].length;
  return true;
}
var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
function entity(state, silent) {
  const pos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(pos) !== 38) return false;
  if (pos + 1 >= max) return false;
  if (state.src.charCodeAt(pos + 1) === 35) {
    const match = state.src.slice(pos).match(DIGITAL_RE);
    if (match) {
      if (!silent) {
        const code2 = match[1][0].toLowerCase() === "x" ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
        const token = state.push("text_special", "", 0);
        token.content = isValidEntityCode(code2) ? fromCodePoint(code2) : fromCodePoint(65533);
        token.markup = match[0];
        token.info = "entity";
      }
      state.pos += match[0].length;
      return true;
    }
  } else {
    const match = state.src.slice(pos).match(NAMED_RE);
    if (match) {
      const decoded = decodeHTMLStrict(match[0]);
      if (decoded !== match[0]) {
        if (!silent) {
          const token = state.push("text_special", "", 0);
          token.content = decoded;
          token.markup = match[0];
          token.info = "entity";
        }
        state.pos += match[0].length;
        return true;
      }
    }
  }
  return false;
}
function processDelimiters(delimiters) {
  const openersBottom = {};
  const max = delimiters.length;
  if (!max) return;
  let headerIdx = 0;
  let lastTokenIdx = -2;
  const jumps = [];
  for (let closerIdx = 0; closerIdx < max; closerIdx++) {
    const closer = delimiters[closerIdx];
    jumps.push(0);
    if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) headerIdx = closerIdx;
    lastTokenIdx = closer.token;
    closer.length = closer.length || 0;
    if (!closer.close) continue;
    if (!openersBottom.hasOwnProperty(closer.marker)) openersBottom[closer.marker] = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3];
    let openerIdx = headerIdx - jumps[headerIdx] - 1;
    let newMinOpenerIdx = openerIdx;
    for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
      const opener = delimiters[openerIdx];
      if (opener.marker !== closer.marker) continue;
      if (opener.open && opener.end < 0) {
        let isOddMatch = false;
        if (opener.close || closer.open) {
          if ((opener.length + closer.length) % 3 === 0) {
            if (opener.length % 3 !== 0 || closer.length % 3 !== 0) isOddMatch = true;
          }
        }
        if (!isOddMatch) {
          const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0;
          jumps[closerIdx] = closerIdx - openerIdx + lastJump;
          jumps[openerIdx] = lastJump;
          closer.open = false;
          opener.end = closerIdx;
          opener.close = false;
          newMinOpenerIdx = -1;
          lastTokenIdx = -2;
          break;
        }
      }
    }
    if (newMinOpenerIdx !== -1) openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx;
  }
}
function link_pairs(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  processDelimiters(state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    var _tokens_meta$curr;
    const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
    if (delimiters) processDelimiters(delimiters);
  }
}
function fragments_join(state) {
  let curr, last;
  let level = 0;
  const tokens = state.tokens;
  const max = state.tokens.length;
  for (curr = last = 0; curr < max; curr++) {
    if (tokens[curr].nesting < 0) level--;
    tokens[curr].level = level;
    if (tokens[curr].nesting > 0) level++;
    if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    else {
      if (curr !== last) tokens[last] = tokens[curr];
      last++;
    }
  }
  if (curr !== last) tokens.length = last;
}
var _rules = [
  ["text", text],
  ["linkify", linkify],
  ["newline", newline],
  ["escape", escape],
  ["backticks", backtick],
  ["strikethrough", strikethrough_default.tokenize],
  ["emphasis", emphasis_default.tokenize],
  ["link", link],
  ["image", image],
  ["autolink", autolink],
  ["html_inline", html_inline],
  ["entity", entity]
];
var _rules2 = [
  ["balance_pairs", link_pairs],
  ["strikethrough", strikethrough_default.postProcess],
  ["emphasis", emphasis_default.postProcess],
  ["fragments_join", fragments_join]
];
var ParserInline = class {
  constructor() {
    _defineProperty(
      this,
      /**
      * {@link Ruler} instance. Keep configuration of inline rules.
      */
      "ruler",
      new Ruler()
    );
    _defineProperty(
      this,
      /**
      * {@link Ruler} instance. Second ruler used for post-processing
      * (e.g. in emphasis-like rules).
      */
      "ruler2",
      new Ruler()
    );
    _defineProperty(this, "State", StateInline);
    for (let i = 0; i < _rules.length; i++) this.ruler.push(_rules[i][0], _rules[i][1]);
    for (let i = 0; i < _rules2.length; i++) this.ruler2.push(_rules2[i][0], _rules2[i][1]);
  }
  skipToken(state) {
    const pos = state.pos;
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    const cache = state.cache;
    if (typeof cache[pos] !== "undefined") {
      state.pos = cache[pos];
      return;
    }
    let ok = false;
    if (state.level < maxNesting) for (let i = 0; i < len; i++) {
      state.level++;
      ok = rules[i](state, true);
      state.level--;
      if (ok) {
        if (pos >= state.pos) throw new Error("inline rule didn't increment state.pos");
        break;
      }
    }
    else state.pos = state.posMax;
    if (!ok) state.pos++;
    cache[pos] = state.pos;
  }
  tokenize(state) {
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const end = state.posMax;
    const maxNesting = state.md.options.maxNesting;
    while (state.pos < end) {
      const prevPos = state.pos;
      let ok = false;
      if (state.level < maxNesting) for (let i = 0; i < len; i++) {
        ok = rules[i](state, false);
        if (ok) {
          if (prevPos >= state.pos) throw new Error("inline rule didn't increment state.pos");
          break;
        }
      }
      if (ok) {
        if (state.pos >= end) break;
        continue;
      }
      state.pending += state.src[state.pos++];
    }
    if (state.pending) state.pushPending();
  }
  /**
  * Process input string and push inline tokens into `outTokens`
  */
  parse(str, md, env, outTokens) {
    const state = new this.State(str, md, env, outTokens);
    this.tokenize(state);
    const rules = this.ruler2.getRules("");
    const len = rules.length;
    for (let i = 0; i < len; i++) rules[i](state);
  }
};
var config = {
  default: {
    options: {
      html: false,
      xhtmlOut: false,
      breaks: false,
      langPrefix: "language-",
      linkify: false,
      typographer: false,
      quotes: "\u201C\u201D\u2018\u2019",
      highlight: null,
      maxNesting: 100
    },
    components: {
      core: {},
      block: {},
      inline: {}
    }
  },
  zero: {
    options: {
      html: false,
      xhtmlOut: false,
      breaks: false,
      langPrefix: "language-",
      linkify: false,
      typographer: false,
      quotes: "\u201C\u201D\u2018\u2019",
      highlight: null,
      maxNesting: 20
    },
    components: {
      core: { rules: [
        "normalize",
        "block",
        "strip_references",
        "inline",
        "text_join"
      ] },
      block: { rules: ["paragraph"] },
      inline: {
        rules: ["text"],
        rules2: ["balance_pairs", "fragments_join"]
      }
    }
  },
  commonmark: {
    options: {
      html: true,
      xhtmlOut: true,
      breaks: false,
      langPrefix: "language-",
      linkify: false,
      typographer: false,
      quotes: "\u201C\u201D\u2018\u2019",
      highlight: null,
      maxNesting: 20
    },
    components: {
      core: { rules: [
        "normalize",
        "block",
        "strip_references",
        "inline",
        "text_join"
      ] },
      block: { rules: [
        "blockquote",
        "code",
        "fence",
        "heading",
        "hr",
        "html_block",
        "lheading",
        "list",
        "reference",
        "paragraph"
      ] },
      inline: {
        rules: [
          "autolink",
          "backticks",
          "emphasis",
          "entity",
          "escape",
          "html_inline",
          "image",
          "link",
          "newline",
          "text"
        ],
        rules2: [
          "balance_pairs",
          "emphasis",
          "fragments_join"
        ]
      }
    }
  }
};
var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
var RECODE_HOSTNAME_FOR = [
  "http:",
  "https:",
  "mailto:"
];
var MarkdownIt = class {
  /**
  * Link validation function. CommonMark allows too much in links. By default
  * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
  * except some embedded image types.
  *
  * You can change this behaviour:
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * // enable everything
  * md.validateLink = function () { return true; }
  * ```
  */
  validateLink(url) {
    const str = url.trim().toLowerCase();
    return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true;
  }
  /**
  * Function used to encode link url to a machine-readable format,
  * which includes url-encoding, punycode, etc.
  */
  normalizeLink(url) {
    const parsed = parse_default(url, true);
    if (parsed.hostname) {
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) try {
        parsed.hostname = import_punycode.default.toASCII(parsed.hostname);
      } catch (er) {
      }
    }
    return encode_default(format(parsed));
  }
  /**
  * Function used to decode link url to a human-readable format`
  */
  normalizeLinkText(url) {
    const parsed = parse_default(url, true);
    if (parsed.hostname) {
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) try {
        parsed.hostname = import_punycode.default.toUnicode(parsed.hostname);
      } catch (er) {
      }
    }
    return decode_default(format(parsed), decode_default.defaultChars + "%");
  }
  constructor(...args) {
    _defineProperty(
      this,
      /**
      * Instance of {@link ParserInline}. You may need it to add new rules when
      * writing plugins. For simple rules control use {@link MarkdownIt.disable}
      * and {@link MarkdownIt.enable}.
      */
      "inline",
      new ParserInline()
    );
    _defineProperty(
      this,
      /**
      * Instance of {@link ParserBlock}. You may need it to add new rules when
      * writing plugins. For simple rules control use {@link MarkdownIt.disable}
      * and {@link MarkdownIt.enable}.
      */
      "block",
      new ParserBlock()
    );
    _defineProperty(
      this,
      /**
      * Instance of {@link ParserCore} chain executor. You may need it to add new
      * rules when writing plugins. For simple rules control use
      * {@link MarkdownIt.disable} and {@link MarkdownIt.enable}.
      */
      "core",
      new ParserCore()
    );
    _defineProperty(
      this,
      /**
      * Instance of {@link Renderer}. Use it to modify output look. Or to add rendering
      * rules for new token types, generated by plugins.
      *
      * See {@link Renderer} docs and
      * [source code](https://github.com/markdown-it/markdown-it/blob/master/src/renderer.ts).
      *
      * @example
      * ```javascript
      * import MarkdownIt from 'markdown-it'
      * const md = new MarkdownIt()
      *
      * function myToken(tokens, idx, options, env, self) {
      *   //...
      *   return result;
      * };
      *
      * md.renderer.rules['my_token'] = myToken
      * ```
      */
      "renderer",
      new Renderer()
    );
    _defineProperty(
      this,
      /**
      * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
      * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/src/rules_core/linkify.ts)
      * rule.
      */
      "linkify",
      new LinkifyIt()
    );
    _defineProperty(
      this,
      /**
      * Assorted utility functions, useful to write plugins. See details
      * [here](https://github.com/markdown-it/markdown-it/blob/master/src/common/utils.ts).
      */
      "utils",
      utils_exports
    );
    _defineProperty(
      this,
      /**
      * Link components parser functions, useful to write plugins. See details
      * [here](https://github.com/markdown-it/markdown-it/blob/master/src/helpers).
      */
      "helpers",
      Object.assign({}, helpers_exports)
    );
    const [presetNameOrOptions, options] = args;
    if (typeof presetNameOrOptions === "string") {
      this.configure(presetNameOrOptions);
      if (options) this.set(options);
    } else {
      this.configure("default");
      this.set(presetNameOrOptions || {});
    }
  }
  /**
  * Set parser options (in the same format as in constructor). Probably, you
  * will never need it, but you can change options after constructor call.
  *
  * __Note:__ To achieve the best possible performance, don't modify a
  * `markdown-it` instance options on the fly. If you need multiple configurations
  * it's best to create multiple instances and initialize each with separate
  * config.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  *
  * const md = new MarkdownIt()
  *   .set({ html: true, breaks: true })
  *   .set({ typographer: true })
  * ```
  */
  set(options) {
    Object.assign(this.options, options);
    return this;
  }
  /**
  * Batch load of all options and compenent settings. This is internal method,
  * and you probably will not need it. But if you will - see available presets
  * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/src/presets)
  *
  * We strongly recommend to use presets instead of direct config loads. That
  * will give better compatibility with next versions.
  */
  configure(presets) {
    let p;
    if (typeof presets === "string") {
      const presetName = presets;
      p = config[presetName];
      if (!p) throw new Error(`Wrong 'markdown-it' preset "${presetName}", check name`);
    } else p = presets;
    if (!p) throw new Error("Wrong `markdown-it` preset, can't be empty");
    if (p.options) this.options = { ...p.options };
    const components = p.components;
    if (components) {
      var _components$inline;
      [
        "core",
        "block",
        "inline"
      ].forEach((name) => {
        var _components$name;
        const rules = (_components$name = components[name]) === null || _components$name === void 0 ? void 0 : _components$name.rules;
        if (rules) this[name].ruler.enableOnly(rules);
      });
      const rules2 = (_components$inline = components.inline) === null || _components$inline === void 0 ? void 0 : _components$inline.rules2;
      if (rules2) this.inline.ruler2.enableOnly(rules2);
    }
    return this;
  }
  /**
  * Enable list or rules. It will automatically find appropriate components,
  * containing rules with given names. If rule not found, and `ignoreInvalid`
  * not set - throws exception.
  *
  * @param list Rule name or list of rule names to enable.
  * @param ignoreInvalid Set `true` to ignore errors when rule not found.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  *
  * const md = new MarkdownIt()
  *   .enable(['sub', 'sup'])
  *   .disable('smartquotes')
  * ```
  */
  enable(list2, ignoreInvalid = false) {
    let result = [];
    if (!Array.isArray(list2)) list2 = [list2];
    [
      "core",
      "block",
      "inline"
    ].forEach((chain) => {
      result = result.concat(this[chain].ruler.enable(list2, true));
    });
    result = result.concat(this.inline.ruler2.enable(list2, true));
    const missed = list2.filter((name) => result.indexOf(name) < 0);
    if (missed.length && !ignoreInvalid) throw new Error(`MarkdownIt. Failed to enable unknown rule(s): ${missed}`);
    return this;
  }
  /**
  * The same as {@link MarkdownIt.enable}, but turn specified rules off.
  *
  * @param list Rule name or list of rule names to disable.
  * @param ignoreInvalid Set `true` to ignore errors when rule not found.
  */
  disable(list2, ignoreInvalid = false) {
    let result = [];
    if (!Array.isArray(list2)) list2 = [list2];
    [
      "core",
      "block",
      "inline"
    ].forEach((chain) => {
      result = result.concat(this[chain].ruler.disable(list2, true));
    });
    result = result.concat(this.inline.ruler2.disable(list2, true));
    const missed = list2.filter((name) => result.indexOf(name) < 0);
    if (missed.length && !ignoreInvalid) throw new Error(`MarkdownIt. Failed to disable unknown rule(s): ${missed}`);
    return this;
  }
  /**
  * Load specified plugin with given params into current parser instance.
  * It's just a sugar to call `plugin(md, params)` with curring.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * import iterator from 'markdown-it-for-inline'
  *
  * const md = new MarkdownIt()
  *   .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
  *     tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar')
  *   })
  * ```
  */
  use(plugin, ...params) {
    plugin.apply(plugin, [this, ...params]);
    return this;
  }
  /**
  * Parse input string and return list of block tokens (special token type
  * "inline" will contain list of inline tokens). You should not call this
  * method directly, until you write custom renderer (for example, to produce
  * AST).
  *
  * `env` is used to pass data between "distributed" rules and return additional
  * metadata like reference info, needed for the renderer. It also can be used to
  * inject data in specific cases. Usually, you will be ok to pass `{}`,
  * and then pass updated object to renderer.
  *
  * @param src Source string.
  * @param env Environment sandbox.
  */
  parse(src, env) {
    if (typeof src !== "string") throw new Error("Input data should be a String");
    const state = new this.core.State(src, this, env);
    this.core.process(state);
    return state.tokens;
  }
  /**
  * Render markdown string into html. It does all magic for you :).
  *
  * `env` can be used to inject additional metadata (`{}` by default).
  * But you will not need it with high probability. See also comment
  * in {@link MarkdownIt.parse}.
  *
  * @param src Source string.
  * @param env Environment sandbox.
  */
  render(src, env = {}) {
    return this.renderer.render(this.parse(src, env), this.options, env);
  }
  /**
  * The same as {@link MarkdownIt.parse} but skip all block rules. It returns
  * the block tokens list with the single `inline` element, containing parsed
  * inline tokens in `children` property. Also updates `env` object.
  *
  * @param src Source string.
  * @param env Environment sandbox.
  */
  parseInline(src, env) {
    const state = new this.core.State(src, this, env);
    state.inlineMode = true;
    this.core.process(state);
    return state.tokens;
  }
  /**
  * Similar to {@link MarkdownIt.render} but for single paragraph content.
  * Result will NOT be wrapped into `<p>` tags.
  *
  * @param src Source string.
  * @param env Environment sandbox.
  */
  renderInline(src, env = {}) {
    return this.renderer.render(this.parseInline(src, env), this.options, env);
  }
};
_defineProperty(MarkdownIt, "Token", Token);
_defineProperty(MarkdownIt, "Ruler", Ruler);
_defineProperty(MarkdownIt, "Renderer", Renderer);
_defineProperty(MarkdownIt, "ParserCore", ParserCore);
_defineProperty(MarkdownIt, "StateCore", StateCore);
_defineProperty(MarkdownIt, "ParserBlock", ParserBlock);
_defineProperty(MarkdownIt, "StateBlock", StateBlock);
_defineProperty(MarkdownIt, "ParserInline", ParserInline);
_defineProperty(MarkdownIt, "StateInline", StateInline);
var MarkdownItCallable = callable(MarkdownIt);

// ui.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
var mdServer = MarkdownItCallable({ html: false, linkify: true, breaks: true, typographer: false });
var _mdClientSrc = null;
function mdClientSrc() {
  if (_mdClientSrc !== null) return _mdClientSrc;
  const cands = [
    path3.join(__dirname, "dist", "md-client.js"),
    path3.join(__dirname, "md-client.js"),
    path3.join(__dirname, "..", "dist", "md-client.js")
  ];
  for (const c of cands) {
    try {
      _mdClientSrc = fs3.readFileSync(c, "utf8");
      return _mdClientSrc;
    } catch {
    }
  }
  _mdClientSrc = "";
  return _mdClientSrc;
}
var MARKDOWN_CSS = [
  ".bubble>p{margin:.35em 0}.bubble>p:first-child{margin-top:0}.bubble>p:last-child{margin-bottom:0}",
  ".bubble ul,.bubble ol{margin:.4em 0;padding-left:1.4em}",
  ".bubble li{margin:.15em 0}",
  ".bubble h1,.bubble h2,.bubble h3,.bubble h4{margin:.5em 0 .3em;line-height:1.3;color:#bd4531}",
  ".bubble h1{font-size:1.3em}.bubble h2{font-size:1.18em}.bubble h3{font-size:1.05em}",
  ".bubble blockquote{margin:.5em 0;padding:.3em .9em;border-left:3px solid var(--line);color:var(--muted);background:#faf9f6;border-radius:6px}",
  ".bubble a{color:var(--red);text-decoration:underline;word-break:break-word}",
  ".bubble table{border-collapse:collapse;margin:.5em 0;width:100%;font-size:13px}",
  ".bubble th,.bubble td{border:1px solid var(--line);padding:5px 8px;text-align:left}",
  ".bubble th{background:#faf9f6;font-weight:700}",
  ".bubble hr{border:none;border-top:1px solid var(--line);margin:.8em 0}",
  ".bubble pre{background:#f6f5f2;border:1px solid var(--line);border-radius:8px;padding:10px 12px;margin:.5em 0;overflow:auto}",
  ".bubble code{background:rgba(0,0,0,.05);padding:.1em .35em;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:.92em}",
  ".bubble pre code{background:none;padding:0;border-radius:0}",
  ".bubble img{max-width:100%;border-radius:8px;margin:.4em 0}"
].join("");
var CSS = `:root{--ink:#252421;--muted:#78746d;--line:#e8e3da;--paper:#fffefa;--canvas:#f5f2ec;--red:#d84a38;--redsoft:#fff1ed;--teal:#168f89;--radius:14px;--radius-sm:9px;--shadow:0 2px 10px rgba(86,75,56,.06);--field:#fff;--field-border:#ded8ce}*{box-sizing:border-box}html,body{height:100%}body.page-list{overflow:hidden}body.page-detail{overflow-y:auto}body{margin:0;background:var(--canvas);color:var(--ink);font:14px Arial,"PingFang SC","Microsoft YaHei",sans-serif}button,input{font:inherit}button{cursor:pointer}.app{position:relative;width:min(1500px,calc(100% - 40px));margin:auto;padding:4px 0 0;height:100vh;display:flex;flex-direction:column}.top{display:flex;flex-direction:column;align-items:flex-start;gap:0;margin-bottom:20px;flex-shrink:0}.top h1{margin:0;font-size:22px;font-weight:650;color:#bd4531;letter-spacing:-.03em;line-height:1.2}.top p{margin:4px 0 0;color:#252421;font-size:13px;opacity:.85}.card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.filters{padding:20px;margin-bottom:16px;flex-shrink:0}.list-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;margin-bottom:0}.list-card .tablebox{flex:1;overflow:auto;min-height:0}#filters{display:grid;grid-template-columns:1fr 1.2fr 1fr 2.2fr auto;gap:14px;align-items:end}.field{position:relative}.field>label{display:block;margin-bottom:8px;color:#5e5a53;font-size:13px;font-weight:700}.control{width:100%;height:42px;border:1px solid var(--field-border);border-radius:var(--radius-sm);background:var(--field);padding:0 12px;color:#555}.control:focus{outline:none;border-color:var(--red)}.select{display:flex;align-items:center;justify-content:space-between;text-align:left}.muted{color:#aaa49b}.menu{display:none;position:absolute;z-index:20;top:calc(100% + 6px);left:0;width:100%;padding:7px;background:#fff;border:1px solid #dcd6cc;border-radius:10px;box-shadow:0 10px 28px rgba(63,57,44,.14)}.menu.open{display:block}.option{display:flex;gap:9px;align-items:center;padding:10px;border-radius:7px;cursor:pointer;font-size:13px;color:var(--ink);min-width:0}.option>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.option:hover{background:#f7f3ed}.option input{accent-color:var(--red);width:16px;height:16px}.input{display:flex;align-items:center;gap:8px;padding:0 12px}.input input{min-width:0;flex:1;border:0;outline:0;color:#555}.range{display:flex;align-items:center;gap:8px}.range .control{min-width:0;padding:0 9px}.range span{flex:none;color:#80796f}.range input[type=date]{position:relative;cursor:pointer;background-image:url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%2378746d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="4" width="18" height="18" rx="2"/%3E%3Cline x1="16" y1="2" x2="16" y2="6"/%3E%3Cline x1="8" y1="2" x2="8" y2="6"/%3E%3Cline x1="3" y1="10" x2="21" y2="10"/%3E%3C/svg%3E');background-repeat:no-repeat;background-position:right 12px center;background-size:16px;padding-right:34px}.range input[type=date]::-webkit-calendar-picker-indicator{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;opacity:0;cursor:pointer}.buttons{display:flex;gap:10px}.btn{height:42px;padding:0 18px;border-radius:var(--radius-sm);border:1px solid transparent;font-weight:600;font-size:14px}.btn.primary{background:var(--red);color:#fff}.btn.primary:hover{background:#c23f2f}.btn.primary:disabled{opacity:.6;cursor:default}.btn.secondary{background:#fff;border-color:var(--field-border);color:var(--ink)}.btn.secondary:hover{background:#f7f3ed}.heading{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--line)}.heading h2{margin:0;font-size:17px}.heading p{margin:5px 0 0;color:var(--muted);font-size:13px}table{width:100%;border-collapse:collapse;font-size:13px}thead th{position:sticky;top:0;z-index:5;background:var(--paper);text-align:left;padding:12px 18px;color:var(--muted);font-size:14px;font-weight:700;letter-spacing:.04em;border-bottom:1px solid var(--line);white-space:nowrap}tbody td{padding:14px 18px;border-bottom:1px solid #f1ece4;vertical-align:middle}tbody tr:last-child td{border-bottom:none}tbody tr:hover{background:#faf7f1}.agent{display:flex;align-items:center;gap:10px}.agent strong{font-weight:600}.person{display:flex;align-items:center;gap:9px}.avatar{width:28px;height:28px;border-radius:50%;background:var(--redsoft);color:var(--red);display:grid;place-items:center;font-weight:700;font-size:13px;flex:none}.time{white-space:nowrap}.time small{display:block;color:var(--muted);font-size:12px;margin-top:2px}.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}.badge.single{background:#eef6f4;color:var(--teal)}.badge.group{background:#fdf0e8;color:#c47932}.source{color:var(--muted);font-size:13px}.title-cell{max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.name-cell{max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.agent-cell{max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.detail{background:none;border:none;color:var(--red);font-weight:600;font-size:13px;padding:6px 0;cursor:pointer}.detail:hover{text-decoration:underline}.empty{display:none;text-align:center;padding:60px 20px;color:var(--muted)}.empty b{display:block;margin:8px 0 4px;color:var(--ink);font-size:15px}.empty small{color:var(--muted)}.error-banner{display:none;margin:0 20px 16px;padding:12px 14px;background:var(--redsoft);border:1px solid #f3c9bf;border-radius:10px;color:var(--red);font-size:13px}.page-size{height:34px;padding:4px 28px 4px 10px;border:1px solid var(--field-border);border-radius:var(--radius-sm);background:var(--field);color:var(--ink);font-size:13px;cursor:pointer;outline:none;margin-left:auto}.page-size:focus{border-color:var(--red)}.pager{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}.pg-controls{display:flex;align-items:center;gap:8px}.pager button{height:32px;min-width:32px;padding:0 12px;border:1px solid var(--field-border);background:#fff;border-radius:8px;color:var(--ink);font-weight:600;cursor:pointer}.pager button:disabled{opacity:.45;cursor:default}.pager button.active{background:var(--red);color:#fff;border-color:var(--red)}.layer{display:none}.layer.open{display:block;position:fixed;inset:0;z-index:1000}.backdrop{position:absolute;inset:0;background:rgba(40,36,30,.4)}.drawer{position:absolute;top:0;right:0;height:100%;width:min(880px,96vw);background:var(--paper);box-shadow:-12px 0 40px rgba(40,36,30,.18);display:flex;flex-direction:column;animation:slidein .22s ease}@keyframes slidein{from{transform:translateX(20px);opacity:.6}to{transform:none;opacity:1}}.drawer-head{display:flex;align-items:center;gap:12px;padding:10px 14px 10px 18px;border-bottom:1px solid var(--line)}.drawer-head h2{margin:0;font-size:17px}.drawer-head p{margin:5px 0 0;color:var(--muted);font-size:13px}.close{width:34px;height:34px;border:1px solid var(--field-border);background:#fff;border-radius:8px;font-size:20px;line-height:1;color:var(--muted);cursor:pointer}.close:hover{background:#f7f3ed}.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:10px 20px;background:#faf7f1;border-bottom:1px solid var(--line)}.meta>div{display:flex;flex-direction:column;gap:2px;min-width:0}.meta span{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}.meta strong{font-size:13px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.divider{padding:6px 20px;color:var(--muted);font-size:12px;border-bottom:1px solid var(--line)}.messages{flex:1;overflow-y:auto;padding:12px 20px 64px;background:var(--canvas)}.fab{position:absolute;right:16px;bottom:16px;z-index:6;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:999px;border:1px solid var(--teal);background:rgba(255,255,255,.92);color:var(--teal);font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(40,36,30,.22);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:transform .15s ease,background .15s ease,color .15s ease}.fab:hover{background:var(--teal);color:#fff;transform:translateY(-2px)}.fab:active{transform:translateY(0)}.fab:disabled{opacity:.55;cursor:default;transform:none}.fab:focus-visible{outline:2px solid var(--teal);outline-offset:2px}.message{display:flex;gap:12px;margin-bottom:18px}.message.user{flex-direction:row}.message.bot{flex-direction:row-reverse}.mbody{display:flex;flex-direction:column;gap:6px;max-width:80%}.message.user .mbody{align-items:flex-start}.message.user .bubble{background:#f8f7f4;border-color:#e8e3da;box-shadow:0 1px 3px rgba(37,36,33,.04)}.message.user .bubble pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}.message.bot .mbody{align-items:flex-end}.mavatar{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-weight:700;flex:none;font-size:14px}.message.user .mavatar{background:#e7f4f2;color:var(--teal)}.message.bot .mavatar{background:var(--redsoft);color:var(--red)}.mmeta{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}.message.bot .mmeta{flex-direction:row-reverse}.mmeta strong{color:var(--ink);font-weight:600}.bubble{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;line-height:1.65;white-space:normal;word-break:break-word;font-size:14px;color:var(--ink)}.message.bot .bubble{background:#fff;color:var(--ink);border-color:#e8e3da;box-shadow:0 1px 3px rgba(37,36,33,.04)}.message.bot .bubble pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}.message.bot .bubble code{background:rgba(0,0,0,.05)}.channel{font-size:11px;color:var(--muted)}.toolcard{background:#faf9f6;border-left:3px solid var(--teal);border-radius:10px;padding:10px 12px;margin:6px 0;font-size:13px;overflow-x:auto;max-width:100%}.toolcard.err{border-left-color:var(--red);background:var(--redsoft)}.toolcard .tname{font-weight:700;color:var(--teal);margin-bottom:4px}.toolcard.err .tname{color:var(--red)}.toolcard pre{margin:6px 0 0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--ink)}.thinking{background:#fdfbf7;border:1px dashed #ddd6c8;border-radius:10px;padding:10px 14px;margin:6px 0;font-size:12px;color:var(--muted);font-style:italic}.msg-collapse{border-radius:10px;margin:6px 0;overflow:hidden;background:#fff}.msg-collapse summary{cursor:pointer;padding:8px 12px;font-size:12px;color:var(--muted);background:var(--canvas);list-style:none;display:flex;align-items:center;gap:6px;user-select:none}.msg-collapse summary::-webkit-details-marker{display:none}.msg-collapse summary::before{content:'\u25B8';font-size:10px;transition:transform .2s}.msg-collapse[open] > summary::before{transform:rotate(90deg)}.msg-collapse[open] > summary{color:var(--ink);background:#f9f6f0;border-bottom:1px solid var(--line)}.loading{padding:40px;text-align:center;color:var(--muted)}.spinner{display:inline-block;width:22px;height:22px;border:2px solid var(--line);border-top-color:var(--red);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:10px}@keyframes spin{to{transform:rotate(360deg)}}



.drawer-dates{display:flex;align-items:center;gap:10px;padding:8px 18px;border-bottom:1px solid var(--line);background:var(--paper);flex-wrap:wrap}.drawer-dates .date-info{color:var(--muted);font-size:12px}.drawer-dates input[type=date]{width:140px}.jump-nav{position:fixed;right:16px;bottom:68px;z-index:20;display:flex;pointer-events:none}
.jump-btn{pointer-events:auto;display:inline-flex;align-items:center;gap:4px;height:40px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.95);color:var(--ink);font-size:13px;font-weight:600;line-height:1;white-space:nowrap;cursor:pointer;box-shadow:0 4px 14px rgba(40,36,30,.14);transition:background .15s,color .15s,transform .1s}
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
  js.push("var topDate = null;");
  js.push("var bottomDate = null;");
  js.push("var currentMatchIdx = -1;");
  js.push("");
  js.push("function $(id){ return document.getElementById(id); }");
  js.push(`function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\"/g, '&quot;'); }`);
  js.push("function pad(n){ return (n < 10 ? '0' : '') + n; }");
  js.push("function fmt(ts){ if (!ts) return '-'; var d = new Date(ts); if (isNaN(d.getTime())) return '-'; return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }");
  js.push("function fmtTime(ts){ return fmt(ts); }");
  js.push("function agentLabel(id){ return id || '\u672A\u77E5 Agent'; }");
  js.push("function sourceLabel(ch){ if (ch === 'feishu') return '\u98DE\u4E66'; if (ch === 'weixin') return '\u5FAE\u4FE1'; if (ch === 'webchat') return 'Web'; return ch || '-'; }");
  js.push("function catLabel(s){ return s && (s.is_group === 1 || s.is_group === true) ? '\u7FA4\u804A' : '\u5355\u804A'; }");
  js.push("function checkedValues(menu){ return Array.prototype.slice.call(menu.querySelectorAll('input:checked')).map(function(x){ return x.value; }); }");
  js.push("");
  js.push("function md(t){");
  js.push("  if (!t) return '';");
  js.push("  try { if (window.MD && typeof window.MD.render === 'function') return window.MD.render(t); } catch (e) {}");
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
  js.push("function buildBatchHtml(msgs, startLastDate){");
  js.push("  var html = '';");
  js.push("  msgs.forEach(function(m){");
  js.push("    html += renderMessage(m);");
  js.push("  });");
  js.push("  return { html: html, lastDate: startLastDate };");
  js.push("}");
  js.push("function renderMessages(msgs){");
  js.push("  var b = buildBatchHtml(msgs, null);");
  js.push(`  return '<div id="msgTop"></div>' + b.html + '<div id="msgBottom"></div>';`);
  js.push("}");
  js.push(`async function jumpToTop(){ var box = $('messages'); if (!box) return; if (msgMode === 'asc') { box.scrollTop = 0; return; } msgMode = 'asc'; msgAllLoaded = false; newestSeq = null; currentMessages = []; topDate = null; bottomDate = null; msgOffset = 0; box.innerHTML = '<div class="loading"><div class="spinner"></div><br>\u52A0\u8F7D\u6700\u65E9\u6D88\u606F\u2026</div>'; await loadMoreMessages(); box.scrollTop = 0; }`);
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
  js.push("  if (start && end && start > end) { $('errorBox').textContent = '\u5F00\u59CB\u65E5\u671F\u4E0D\u80FD\u665A\u4E8E\u7ED3\u675F\u65E5\u671F'; $('errorBox').style.display = 'block'; btn.disabled = false; btn.textContent = '\u641C\u7D22'; return; }");
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
  js.push("  msgOffset = 0; msgAllLoaded = false; oldestSeq = null; newestSeq = null; msgMode = 'desc'; msgHighlight = null; currentMessages = []; topDate = null; bottomDate = null;");
  js.push("  var ds = $('dStart'), de = $('dEnd'); if (ds) ds.value = ''; if (de) de.value = ''; var dclr = $('dateClear'); if (dclr) dclr.style.display = 'none'; var dinfo = $('dateInfo'); if (dinfo) dinfo.textContent = '';");
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
  js.push("    var sd = $('dStart').value, ed = $('dEnd').value;");
  js.push("    if (sd) params.set('dateFrom', sd);");
  js.push("    if (ed) params.set('dateTo', ed);");
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
  js.push("      if (msgOffset === 0) {");
  js.push("        var b0 = buildBatchHtml(msgs, null);");
  js.push(`        box.innerHTML = '<div id="msgTop"></div>' + b0.html + '<div id="msgBottom"></div>';`);
  js.push("        bottomDate = b0.lastDate;");
  js.push("        box.scrollTop = 0;");
  js.push("      } else {");
  js.push("        var atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 2;");
  js.push("        var b = buildBatchHtml(msgs, bottomDate);");
  js.push("        var mb = document.getElementById('msgBottom');");
  js.push("        if (mb) mb.insertAdjacentHTML('beforebegin', b.html); else box.insertAdjacentHTML('beforeend', b.html);");
  js.push("        bottomDate = b.lastDate;");
  js.push("        if (atBottom) box.scrollTop = box.scrollHeight;");
  js.push("      }");
  js.push("      if (msgs.length && (newestSeq == null || msgs[msgs.length-1].seq > newestSeq)) newestSeq = msgs[msgs.length-1].seq;");
  js.push("    } else {");
  js.push("      if (msgOffset === 0) { currentMessages = msgs; }");
  js.push("      else { currentMessages = msgs.concat(currentMessages); }");
  js.push("      if (msgOffset === 0) {");
  js.push("        var bd0 = buildBatchHtml(msgs, null);");
  js.push(`        box.innerHTML = '<div id="msgTop"></div>' + bd0.html + '<div id="msgBottom"></div>';`);
  js.push("        topDate = msgs.length ? fmt(msgs[0].timestamp).split(' ')[0] : null;");
  js.push("        bottomDate = bd0.lastDate;");
  js.push("        box.scrollTop = box.scrollHeight - box.clientHeight;");
  js.push("      } else {");
  js.push("        var prevH = box.scrollHeight;");
  js.push("        var prevTop = box.scrollTop;");
  js.push("        var bb = buildBatchHtml(msgs, topDate);");
  js.push("        var mt = document.getElementById('msgTop');");
  js.push("        if (mt) mt.insertAdjacentHTML('afterend', bb.html); else box.insertAdjacentHTML('afterbegin', bb.html);");
  js.push("        topDate = msgs.length ? fmt(msgs[0].timestamp).split(' ')[0] : topDate;");
  js.push("        box.scrollTop = prevTop + (box.scrollHeight - prevH);");
  js.push("      }");
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
  js.push("  msgMode = 'desc'; msgAllLoaded = false; oldestSeq = null; newestSeq = null; msgOffset = 0; currentMessages = []; topDate = null; bottomDate = null;");
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
  js.push("    var sd = $('dStart').value, ed = $('dEnd').value;");
  js.push("    if (sd) params.set('dateFrom', sd);");
  js.push("    if (ed) params.set('dateTo', ed);");
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
  js.push("function applyDateFilter(){");
  js.push("  var sd = $('dStart').value, ed = $('dEnd').value;");
  js.push("  var dinfo = $('dateInfo'), dclr = $('dateClear');");
  js.push("  if (sd && ed && sd > ed) { $('errorBox').textContent = '\u5F00\u59CB\u65E5\u671F\u4E0D\u80FD\u665A\u4E8E\u7ED3\u675F\u65E5\u671F'; $('errorBox').style.display = 'block'; return; }");
  js.push("  $('errorBox').style.display = 'none';");
  js.push("  dclr.style.display = (sd || ed) ? 'inline-block' : 'none';");
  js.push("  dinfo.textContent = (sd || ed) ? ('\u7B5B\u9009\uFF1A' + (sd || '\u2026') + ' \u81F3 ' + (ed || '\u2026')) : '';");
  js.push("  msgMode = 'desc'; msgAllLoaded = false; oldestSeq = null; newestSeq = null; msgOffset = 0; currentMessages = []; topDate = null; bottomDate = null;");
  js.push("  var box = $('messages'); box.innerHTML = '';");
  js.push("  loadMoreMessages().then(function(){ box.scrollTop = box.scrollHeight - box.clientHeight; });");
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
  js.push("  var ds = document.getElementById('dStart'); if (ds) ds.addEventListener('change', applyDateFilter);");
  js.push("  var de = document.getElementById('dEnd'); if (de) de.addEventListener('change', applyDateFilter);");
  js.push("  var dclr = document.getElementById('dateClear'); if (dclr) dclr.addEventListener('click', function(){ var a = document.getElementById('dStart'), b = document.getElementById('dEnd'); if (a) a.value = ''; if (b) b.value = ''; applyDateFilter(); });");
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
  lines.push("<style>" + MARKDOWN_CSS + "</style>");
  const mdSrc = mdClientSrc().replace(/<\/script>/gi, "<\\/script>");
  if (mdSrc) lines.push("<script>" + mdSrc + "</script>");
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
  lines.push('    <div class="drawer-dates"><div class="range"><input id="dStart" class="control" type="date" aria-label="\u5F00\u59CB\u65E5\u671F"><span>\u81F3</span><input id="dEnd" class="control" type="date" aria-label="\u7ED3\u675F\u65E5\u671F"></div><span class="date-info" id="dateInfo"></span><button class="search-clear" id="dateClear" style="display:none">\u6E05\u9664\u65E5\u671F</button></div>');
  lines.push('    <div class="jump-nav" aria-label="\u6D88\u606F\u8DF3\u8F6C">');
  lines.push('      <button class="jump-btn" id="jumpTop" aria-label="\u5230\u6700\u65E9\u7684\u6D88\u606F">\u25B2 \u9876\u90E8</button>');
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
  return fmtTs(ts);
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
  return mdServer.render(t);
}
function toolCallCardTs(b) {
  const name = b.name || "tool";
  const args = b.arguments || b.input || {};
  const a = typeof args === "string" ? args : JSON.stringify(args, null, 2);
  return '<div class="toolcard"><div class="tname">\u{1F527} ' + escHtml(name) + "</div>" + (a && a !== "{}" ? "<pre>" + escHtml(a) + "</pre>" : "") + (b.id ? '<div style="color:var(--muted);font-size:11px;margin-top:4px">id: ' + escHtml(b.id) + "</div>" : "") + "</div>";
}
function toolResultCardTs(msg, c) {
  let text2 = "";
  if (typeof c === "string") text2 = c;
  else if (Array.isArray(c)) {
    c.forEach(function(b) {
      if (typeof b === "string") text2 += b + "\n";
      else if (b && b.type === "text") text2 += b.text + "\n";
    });
  } else {
    text2 = JSON.stringify(c, null, 2);
  }
  const isErr = msg.is_error === true || msg.is_error === 1;
  return '<div class="toolcard' + (isErr ? " err" : "") + '"><div class="tname">' + (isErr ? "\u26A0 " : "") + escHtml(msg.tool_name || "tool result") + "</div>" + (text2 ? "<pre>" + escHtml(text2.substring(0, 8e3)) + "</pre>" : "") + "</div>";
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
  msgs.forEach(function(m) {
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
  L.push("<style>" + MARKDOWN_CSS + "</style>");
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
  L.push('    <a class="jump-btn" href="#msgTop" aria-label="\u5230\u6700\u65E9\u7684\u6D88\u606F">\u25B2 \u9876\u90E8</a>');
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
function buildExportText(session, messages, byteBudget) {
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
  let text2 = lines.join("\n");
  let truncated = false;
  if (byteBudget && byteBudget > 0) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text2);
    if (bytes.length > byteBudget) {
      let cut = byteBudget;
      while (cut > 0 && bytes[cut] >> 6 === 2) cut--;
      text2 = new TextDecoder().decode(bytes.slice(0, cut)) + "\n\n[\u5BFC\u51FA\u5185\u5BB9\u8FC7\u957F\uFF0C\u5DF2\u622A\u65AD]";
      truncated = true;
    }
  }
  return { text: text2, truncated };
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
  let dir = path4.dirname(fileURLToPath2(import.meta.url));
  while (dir !== path4.dirname(dir)) {
    if (fs4.existsSync(path4.join(dir, "openclaw.plugin.json"))) return dir;
    dir = path4.dirname(dir);
  }
  return path4.dirname(fileURLToPath2(import.meta.url));
}
function resolveDbPath() {
  return path4.join(resolveExtensionDir(), "data", "session-admin.db");
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
        const text2 = buildExportText(detail, result.messages).text;
        res.statusCode = 200;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.setHeader("content-disposition", 'attachment; filename="conversation_' + encodeURIComponent(sessionKey) + '.txt"');
        res.end(text2);
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
    const list2 = listSessions(db, {
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
      sessions: list2.sessions,
      total: list2.total,
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
        const dateFrom = url.searchParams.get("dateFrom")?.trim();
        const dateTo = url.searchParams.get("dateTo")?.trim();
        const startTs = dateFrom ? new Date(dateFrom).getTime() : void 0;
        const endTs = dateTo ? new Date(dateTo).getTime() + 864e5 : void 0;
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
        const EXPORT_BYTE_BUDGET = 10 * 1024 * 1024;
        const built = buildExportText(session, result.messages, EXPORT_BYTE_BUDGET);
        const text2 = built.text;
        const truncated = built.truncated;
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
        if (truncated) res.setHeader("X-Export-Truncated", "1");
        res.end("\uFEFF" + text2);
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
/*! Bundled license information:

markdown-it/dist/markdown-it.mjs:
  (*! markdown-it 15.0.0 https://github.com/markdown-it/markdown-it @license MIT *)
*/
