[🇨🇳 中文](README.md) · [🇺🇸 English](README.en.md)

# Session Label from Sender

An OpenClaw session admin: it brings conversations scattered across channels (WebUI / Feishu / WeChat) into one interface, where you can search the session list by **channel, user, and date**, and view the full timeline of any conversation. Its biggest value: it aggregates by **sender**, so when a user runs `/new` and rotates the session, the old history stays continuous and searchable — something the native OpenClaw admin cannot do.

## What problem it solves

OpenClaw's native "sessions" are organized around `sessionId`, which leaves two gaps the native admin can't address:

1. **No way to search history by channel / user / date.** To review "what a certain Feishu customer talked about last week" or "all of a WeChat user's questions", the native UI has no central, filterable entry — you can only scroll through chat windows.
2. **Old conversations "disappear" from the native admin after `/new`.** When a user sends `/new`, OpenClaw archives the old `sessionId.jsonl` and starts a new session, which the native admin treats as a brand-new conversation — all prior history vanishes from view.

This plugin adds that missing "session admin", focused on two things: **① session list query** (filter by channel, user, date) + **② session detail query** (timeline view of user text, assistant replies, thinking, and tool calls/results). It aggregates by **sender** (`session_key` = agent + channel + sender identity, **not** `sessionId`), so even after multiple `/new`s, all history merges under one row and stays continuous.

## Preview

### Session list — multi-channel aggregation, grouped by person

![session list](docs/screenshots/session-list.png)

Aggregates all channels into one table with filtering by name / title / channel and date-range search. After a customer runs `/new` multiple times, all history still lands on a single row.

### Session detail — timeline + tool cards

![conversation detail](docs/screenshots/session-detail.png)

Shows a full conversation on a timeline: user bubbles (right), assistant bubbles (left); thinking is collapsed by default and expandable; tool calls / results render as collapsible cards. All data is server-rendered into the HTML, so it remains readable without client scripts.

## Install

### Option 1: Install from ClawHub (recommended)

Run the following command in OpenClaw, then restart the Gateway when prompted:

```bash
openclaw plugins install clawhub:@hwd8080-ai/session-label-from-sender
```

### Option 2: Build and deploy from source

```bash
# 1. Clone the repo
git clone https://github.com/hwd8080-ai/session-label-from-sender.git
cd session-label-from-sender

# 2. Build (requires Node >= 22.5, because node:sqlite is used)
node build.mjs
# Outputs: root index.mjs, dist/index.mjs, dist/md-client.js (esbuild self-contained bundle)

# 3. Deploy to the OpenClaw extensions directory
mkdir -p ~/.openclaw/extensions/session-label-from-sender
cp index.mjs openclaw.plugin.json ~/.openclaw/extensions/session-label-from-sender/
cp -r dist ~/.openclaw/extensions/session-label-from-sender/

# 4. Restart the daemon to apply
openclaw daemon restart
```

After installation, you'll see the **Session Admin** tab under the "More" area of the OpenClaw control UI. Click it to enter.

## Usage

1. Open the OpenClaw control UI and go to the **Session Admin** tab.
2. Filter the list by name / title / channel / date range to locate the target customer or session.
3. Click any row to open the detail and view the full conversation on a timeline (thinking and tool calls are expandable).
4. Click **Copy full text** at the bottom right to copy the whole conversation to the clipboard (download is downgraded to copy due to the plugin iframe sandbox).

If the page doesn't take effect, clear the browser cache and refresh once.

## License

Released under the repository's license; see the LICENSE file for changes.
