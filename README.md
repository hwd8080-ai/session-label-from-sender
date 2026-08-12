[🇨🇳 中文](README.md) · [🇺🇸 English](README.en.md)

# Session Label from Sender

OpenClaw 会话管理后台：把分散在各渠道（WebUI / 飞书 / 微信）的对话集中到一个界面，按**渠道、用户、日期**检索会话列表，并查看任意一段对话的完整时间线。它最大的价值是：以「发送者」维度聚合，用户发 `/new` 旋转会话后，旧对话依然连贯可查——这是 OpenClaw 原生后台做不到的。

## 解决了什么问题

OpenClaw 原生「会话」围绕 `sessionId` 组织，日常有两个原生后台解决不了的痛点：

1. **无法按渠道 / 用户 / 日期检索历史对话。** 想回看「某飞书客户上周聊了什么」「微信里某个用户的所有咨询」，原生界面没有集中、可筛选的入口，只能翻聊天窗口。
2. **`/new` 之后旧对话在原生后台「消失」。** 用户发 `/new` 时，OpenClaw 把旧 `sessionId.jsonl` 封存并新建会话，对原生后台而言是一段全新会话，之前的历史就此看不见。

本插件补上这个「会话管理后台」，并聚焦于两件事：**① 会话列表查询**（按渠道、用户、日期筛选）+ **② 会话详情查询**（时间线查看用户文本、助手回复、思考过程、工具调用/结果）。它以「发送者」维度（`session_key` = agent + 渠道 + 发送者身份，**而非** `sessionId`）聚合，因此即使客户多次 `/new`，所有历史仍归并到同一行，连续可查。

## 效果预览

### 会话列表 —— 多渠道聚合、按人归一

![会话列表](docs/screenshots/session-list.png)

聚合所有渠道的会话到一张表，支持按姓名 / 标题 / 渠道筛选，并按时间范围检索。同一客户多次 `/new` 后，所有历史仍归到同一行。

### 会话详情 —— 时间线 + 工具卡

![对话详情](docs/screenshots/session-detail.png)

按时间线完整呈现一段对话：用户气泡（右）、助手气泡（左）；思考过程默认折叠、可展开；工具调用 / 结果显示为折叠卡片。所有数据通过服务端渲染进 HTML，无需客户端脚本也能阅读。

## 安装

### 方式一：从 ClawHub 安装（推荐）

在 OpenClaw 中执行以下命令安装，安装后按提示重启 Gateway 即可：

```bash
openclaw plugins install clawhub:@hwd8080-ai/session-label-from-sender
```

### 方式二：从源码构建部署

```bash
# 1. 克隆仓库
git clone https://github.com/hwd8080-ai/session-label-from-sender.git
cd session-label-from-sender

# 2. 构建（需要 Node >= 22.5，因为用到了 node:sqlite）
node build.mjs
# 产物：根目录 index.mjs、dist/index.mjs、dist/md-client.js（esbuild 自包含 bundle）

# 3. 部署到 OpenClaw 扩展目录
mkdir -p ~/.openclaw/extensions/session-label-from-sender
cp index.mjs openclaw.plugin.json ~/.openclaw/extensions/session-label-from-sender/
cp -r dist ~/.openclaw/extensions/session-label-from-sender/

# 4. 重启 daemon 使生效
openclaw daemon restart
```

安装后，在 OpenClaw 控制界面的「更多」区域会看到 **会话记录（Session Admin）** 标签页，点击进入即可。

## 使用

1. 打开 OpenClaw 控制界面，进入 **会话记录（Session Admin）** 标签页。
2. 在列表中按姓名 / 标题 / 渠道 / 日期范围筛选，定位目标客户或会话。
3. 点击任意一行进入详情，按时间线查看完整对话（思考过程、工具调用可展开）。
4. 点右下角 **复制全文** 把整段对话复制到剪贴板（受插件 iframe 沙盒限制，下载降级为复制）。

若页面未生效，清掉浏览器缓存再刷新一次。

## 许可证

本插件随仓库许可证发布；如需变更请查看仓库 LICENSE 文件。
