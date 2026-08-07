# Session Label from Sender

> OpenClaw 会话管理插件 —— 自动标注发送者、SQLite 增量同步、对话详情搜索与复制。

`session-label-from-sender` 是一个 OpenClaw 扩展插件，把分散在多个渠道（WebUI、飞书、微信）和多个 agent（main / work / code 等）下的会话集中到一个管理界面里，自动按「发送者」标注，并提供会话搜索、时间线对话查看、全文复制等能力。

---

## 功能特性

- **多渠道会话聚合**：自动扫描 `<stateDir>/agents/<agentId>/sessions/` 下的所有 agent 与所有渠道会话（WebUI / 飞书 / 微信等），统一聚合进一张会话列表。
- **发送者自动标注**：
  - 通过 WebUI 创建的会话，发送者统一显示为 `admin`；
  - 飞书 / 微信等 IM 渠道，能拿到真实昵称就显示昵称，否则退化为显示发送人 ID（openid / 微信号等）。
- **增量同步（SQLite）**：直接读取 OpenClaw 原生的 JSONL 转录文件，按字节偏移（`sync_cursor`）做增量同步，只解析新增内容，性能稳定。
- **会话搜索与筛选**：按「姓名」、「会话标题」、「来源渠道」筛选；支持按时间范围检索。
- **对话详情查看**：以时间线方式完整呈现一段对话，包含用户文本、助手回复、思考过程（折叠）、工具调用 / 工具结果（工具卡）。
- **全文复制**：一键把整段对话复制到剪贴板（详见「已知平台限制」）。
- **`/new` 会话旋转自愈**：执行 `/new`（或任何让 OpenClaw 重建 sessionId 的操作）后，新消息能自动同步进来，不会卡在旧历史。
- **内容级去重 + 时间线重排**：多套解析器、sessionId 旋转可能产生的重复消息与乱序，由内容级唯一索引与按时间戳重排 `seq` 根治。

---

## 安装

### 方式一：从 ClawHub 安装（推荐）

在 OpenClaw 中通过 ClawHub 搜索并安装 `@hwd8080-ai/session-label-from-sender`（兼容 `pluginApi >= 2026.7.1`，宿主版本 `>= 2026.7.1`）。

### 方式二：从源码构建部署

```bash
# 1. 克隆仓库
git clone https://github.com/hwd8080-ai/session-label-from-sender.git
cd session-label-from-sender

# 2. 构建（需要 Node >= 22.5，因为用到了 node:sqlite）
node build.mjs
# 产物：根目录 index.mjs 与 dist/index.mjs（esbuild 自包含 bundle）

# 3. 部署到 OpenClaw 扩展目录
mkdir -p ~/.openclaw/extensions/session-label-from-sender
cp -r dist/index.mjs openclaw.plugin.json ~/.openclaw/extensions/session-label-from-sender/
# 注意：dist/index.mjs 才是运行时入口（见 openclaw.plugin.json 的 extensions 字段）

# 4. 重启 daemon
openclaw daemon restart
```

安装后，在 OpenClaw 控制界面的「更多」区域会看到 **会话记录（Session Admin）** 标签页，点击进入即可。

> 说明：插件页面通过 `auth: "plugin"` 直连网关（默认 `127.0.0.1:18789`），无需二次 token。页面路径 `/plugins/session-admin`，数据接口 `/plugins/session-admin/api/*`。

---

## 字段语义说明

插件维护一张 `sessions` 表，其中几个关键字段的语义如下（也是列表页「姓名」「会话标题」「来源」列的数据来源）：

| 字段 | 含义 | 取值规则 |
| --- | --- | --- |
| `sender_name` | **姓名列**数据源 | WebUI / dashboard 会话 → `admin`；IM 渠道有真实昵称用昵称，否则用发送人 ID（openid / 微信号）。 |
| `display_name` | **会话标题 / 主题**，列表行标题，**永远非空** | 三级回退：OpenClaw 的 `entry.displayName` → 回退 `sender_name` → 再回退渠道通用标题（Web 会话 / 飞书 / 微信 等）。 |
| `label` | OpenClaw 原生会话标签 | 由 OpenClaw 自己管理（1:1 私聊时 inbound hook 会写入 senderName），基本为空是正常现象，**不作为主展示字段**。 |
| `channel` | 来源渠道 | **必须按 `session_key` 推导**（`feishu` / `weixin` / `webchat`），不能信 `entry.origin.provider`（微信场景会被误报成 `webchat`）。 |
| `is_group` | 是否群聊 | 纯信任 `session_key` 中的 `:group:` / `:direct:` 分类，**不**靠扫消息内容启发式判断（飞书单聊消息同样带 `ou_xxx: 文本` 前缀，会误判）。 |

`sender_name` 与 `display_name` 的计算逻辑集中在 `sync.ts`（`computeSenderName` / `computeDisplayName` / `channelFromSessionKey` 等），与 OpenClaw 原始行为对齐。

---

## 数据存储位置

插件的 SQLite 数据库固定放在**插件自己的目录**，与 OpenClaw 核心文件分离，便于备份与清理：

```
~/.openclaw/extensions/session-label-from-sender/data/session-admin.db
```

该目录下还会自动生成同名的 `-shm` / `-wal` 附属文件（WAL 模式），三者需一起对待（备份 / 迁移时一并处理）。

- 会话列表、消息、筛选、分页、搜索 **全部查询这份 SQLite**，前端不直接读取 JSONL 文件。
- 数据源是 OpenClaw 原生 JSONL 转录：`<stateDir>/agents/<agentId>/sessions/<sessionId>.jsonl`，仅在「同步」时按字节偏移增量解析写入。
- 同步触发：页面「同步数据」按钮（`/api/sync`）+ daemon 内定时同步。

---

## 已知平台限制

这些限制来自 OpenClaw 的插件 iframe 沙盒机制，**非插件 bug**，也无法在不改 OpenClaw 主仓库的前提下解决：

1. **文件下载不可行 → 降级为「复制全文」**
   OpenClaw 给插件 iframe 的 sandbox 只有 `allow-scripts`，**没有** `allow-downloads` / `allow-popups`。因此浏览器会静默拦截插件内触发的文件下载。插件改为「复制全文」按钮（`navigator.clipboard` + `execCommand` 兜底），把整段对话复制到剪贴板。

2. **首屏 strict 沙盒竞态 → 服务端渲染兜底**
   WebUI 首屏 iframe 的 sandbox 默认是 `strict`（禁脚本），真正允许脚本的 `scripts` 配置是异步到达的，已用 strict 建好的 iframe 不会追溯生效，表现为「硬刷新一次会短暂报错、切走再切回才正常」。
   插件采用**服务端渲染（SSR）**根治：数据直接渲染进 HTML，翻页 / 筛选 / 进入详情用 `<a>` 链接，同步用 `?sync=1`（服务端 302 回干净 URL）——静态 HTML + 链接导航在 strict 沙盒下也完整可用，脚本仅作增强。

---

## 工作原理要点

- **增量同步**：`sync.ts` 按 `session_key`（如 `agent:main:feishu:direct:ou_xxx`）记录每个会话的 JSONL 字节偏移 `sync_cursor`，下次只解析新增部分。
- **`/new` 会话旋转修复**：`/new` 会让 OpenClaw 把旧 `sessionId.jsonl` 重命名为 `*.jsonl.reset.<ts>.json`（封存旧历史）并新建 session 写新文件。插件在 `session_id` 变化时自动把 `sync_cursor` 归零，确保新文件从 0 重读。
- **重复消息根治**：插件有两套解析器（标准 `.jsonl` 用 OpenClaw 原生短哈希 id；`.trajectory.jsonl` 用 `${sessionId}-m${i}` id），id 方案不同会导致 `INSERT OR IGNORE` 拦不住重复。改用**内容级唯一索引**（`session_key, role, type, timestamp, substr(content_json,1,200)`）去重。
- **时间线乱序根治**：各解析器各自分配的 `seq` 范围交叠、不可信。`sync` 后用 `renumberSeq()` 按 `timestamp ASC, id ASC` 把该会话 `seq` 重排为 1..N 连续，保证 `ORDER BY seq` 等于时间线。

---

## 构建与开发

- 构建：`node build.mjs`（esbuild 打包，要求 Node >= 22.5，因使用 `node:sqlite`）。
- 部署：把 `dist/index.mjs` 覆盖到 `~/.openclaw/extensions/session-label-from-sender/dist/`，然后 `openclaw daemon restart`。
- 前端 `ui.ts` 的浏览器端 JS 全部以 `js.push("...")` 行拼接，HTML 属性双引号需写成 `\"`；改这类行建议用 Python 原始三引号字符串逐行重写，改完务必 `node build.mjs` 验证不报错。

---

## 链接

- GitHub：<https://github.com/hwd8080-ai/session-label-from-sender>
- ClawHub：`@hwd8080-ai/session-label-from-sender`
- 版本：`2026.8.7`（兼容 `pluginApi >= 2026.7.1`）

---

## 许可证

本插件随仓库许可证发布；如需变更请查看仓库 LICENSE 文件。
