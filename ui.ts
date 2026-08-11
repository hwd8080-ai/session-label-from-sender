// Auto-generated Session Admin UI (light warm theme).
// HTML and JS are built via array joins so each line is a real newline.
// Server helpers live here; the client drawer's JS is emitted as strings in
// buildJs() and uses the inlined markdown-it browser bundle (globalThis.MD).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import markdownit from "markdown-it";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// markdown-it for the server-rendered (SSR) detail page. html:false escapes raw
// HTML in the source, so chat content can never inject scripts/styles (XSS-safe).
const mdServer = markdownit({ html: false, linkify: true, breaks: true, typographer: false });

// Lazily load the browser IIFE bundle of markdown-it (built by build.mjs into
// dist/md-client.js). Inlined into the list page so the client drawer renderer
// can call window.MD.render(). Cached; resolves from root or dist deployment.
let _mdClientSrc: string | null = null;
function mdClientSrc(): string {
  if (_mdClientSrc !== null) return _mdClientSrc;
  const cands = [
    path.join(__dirname, "dist", "md-client.js"),
    path.join(__dirname, "md-client.js"),
    path.join(__dirname, "..", "dist", "md-client.js"),
  ];
  for (const c of cands) {
    try { _mdClientSrc = fs.readFileSync(c, "utf8"); return _mdClientSrc; } catch { /* try next */ }
  }
  _mdClientSrc = "";
  return _mdClientSrc;
}

// Extra CSS for markdown block elements rendered inside `.bubble`.
const MARKDOWN_CSS = [
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
  ".bubble img{max-width:100%;border-radius:8px;margin:.4em 0}",
].join("");

const CSS = ":root{--ink:#252421;--muted:#78746d;--line:#e8e3da;--paper:#fffefa;--canvas:#f5f2ec;--red:#d84a38;--redsoft:#fff1ed;--teal:#168f89;--radius:14px;--radius-sm:9px;--shadow:0 2px 10px rgba(86,75,56,.06);--field:#fff;--field-border:#ded8ce}*{box-sizing:border-box}html,body{height:100%}body.page-list{overflow:hidden}body.page-detail{overflow-y:auto}body{margin:0;background:var(--canvas);color:var(--ink);font:14px Arial,\"PingFang SC\",\"Microsoft YaHei\",sans-serif}button,input{font:inherit}button{cursor:pointer}.app{position:relative;width:min(1500px,calc(100% - 40px));margin:auto;padding:4px 0 0;height:100vh;display:flex;flex-direction:column}.top{display:flex;flex-direction:column;align-items:flex-start;gap:0;margin-bottom:20px;flex-shrink:0}.top h1{margin:0;font-size:22px;font-weight:650;color:#bd4531;letter-spacing:-.03em;line-height:1.2}.top p{margin:4px 0 0;color:#252421;font-size:13px;opacity:.85}.card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.filters{padding:20px;margin-bottom:16px;flex-shrink:0}.list-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;margin-bottom:0}.list-card .tablebox{flex:1;overflow:auto;min-height:0}#filters{display:grid;grid-template-columns:1fr 1.2fr 1fr 2.2fr auto;gap:14px;align-items:end}.field{position:relative}.field>label{display:block;margin-bottom:8px;color:#5e5a53;font-size:13px;font-weight:700}.control{width:100%;height:42px;border:1px solid var(--field-border);border-radius:var(--radius-sm);background:var(--field);padding:0 12px;color:#555}.control:focus{outline:none;border-color:var(--red)}.select{display:flex;align-items:center;justify-content:space-between;text-align:left}.muted{color:#aaa49b}.menu{display:none;position:absolute;z-index:5;top:calc(100% + 6px);left:0;width:100%;padding:7px;background:#fff;border:1px solid #dcd6cc;border-radius:10px;box-shadow:0 10px 28px rgba(63,57,44,.14)}.menu.open{display:block}.option{display:flex;gap:9px;align-items:center;padding:10px;border-radius:7px;cursor:pointer;font-size:13px;color:var(--ink);min-width:0}.option>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.option:hover{background:#f7f3ed}.option input{accent-color:var(--red);width:16px;height:16px}.input{display:flex;align-items:center;gap:8px;padding:0 12px}.input input{min-width:0;flex:1;border:0;outline:0;color:#555}.range{display:flex;align-items:center;gap:8px}.range .control{min-width:0;padding:0 9px}.range span{flex:none;color:#80796f}.buttons{display:flex;gap:10px}.btn{height:42px;padding:0 18px;border-radius:var(--radius-sm);border:1px solid transparent;font-weight:600;font-size:14px}.btn.primary{background:var(--red);color:#fff}.btn.primary:hover{background:#c23f2f}.btn.primary:disabled{opacity:.6;cursor:default}.btn.secondary{background:#fff;border-color:var(--field-border);color:var(--ink)}.btn.secondary:hover{background:#f7f3ed}.heading{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--line)}.heading h2{margin:0;font-size:17px}.heading p{margin:5px 0 0;color:var(--muted);font-size:13px}table{width:100%;border-collapse:collapse;font-size:14px}thead th{text-align:left;padding:12px 18px;color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.04em;border-bottom:1px solid var(--line);white-space:nowrap}tbody td{padding:14px 18px;border-bottom:1px solid #f1ece4;vertical-align:middle}tbody tr:last-child td{border-bottom:none}tbody tr:hover{background:#faf7f1}.agent{display:flex;align-items:center;gap:10px}.agent strong{font-weight:600}.person{display:flex;align-items:center;gap:9px}.avatar{width:28px;height:28px;border-radius:50%;background:var(--redsoft);color:var(--red);display:grid;place-items:center;font-weight:700;font-size:13px;flex:none}.time{white-space:nowrap}.time small{display:block;color:var(--muted);font-size:12px;margin-top:2px}.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}.badge.single{background:#eef6f4;color:var(--teal)}.badge.group{background:#fdf0e8;color:#c47932}.source{color:var(--muted);font-size:13px}.title-cell{max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.name-cell{max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.agent-cell{max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.detail{background:none;border:none;color:var(--red);font-weight:600;font-size:13px;padding:6px 0;cursor:pointer}.detail:hover{text-decoration:underline}.empty{display:none;text-align:center;padding:60px 20px;color:var(--muted)}.empty b{display:block;margin:8px 0 4px;color:var(--ink);font-size:15px}.empty small{color:var(--muted)}.error-banner{display:none;margin:0 20px 16px;padding:12px 14px;background:var(--redsoft);border:1px solid #f3c9bf;border-radius:10px;color:var(--red);font-size:13px}.page-size{height:34px;padding:4px 28px 4px 10px;border:1px solid var(--field-border);border-radius:var(--radius-sm);background:var(--field);color:var(--ink);font-size:13px;cursor:pointer;outline:none;margin-left:auto}.page-size:focus{border-color:var(--red)}.pager{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}.pg-controls{display:flex;align-items:center;gap:8px}.pager button{height:32px;min-width:32px;padding:0 12px;border:1px solid var(--field-border);background:#fff;border-radius:8px;color:var(--ink);font-weight:600;cursor:pointer}.pager button:disabled{opacity:.45;cursor:default}.pager button.active{background:var(--red);color:#fff;border-color:var(--red)}.layer{display:none}.layer.open{display:block;position:fixed;inset:0;z-index:1000}.backdrop{position:absolute;inset:0;background:rgba(40,36,30,.4)}.drawer{position:absolute;top:0;right:0;height:100%;width:min(880px,96vw);background:var(--paper);box-shadow:-12px 0 40px rgba(40,36,30,.18);display:flex;flex-direction:column;animation:slidein .22s ease}@keyframes slidein{from{transform:translateX(20px);opacity:.6}to{transform:none;opacity:1}}.drawer-head{display:flex;align-items:center;gap:12px;padding:10px 14px 10px 18px;border-bottom:1px solid var(--line)}.drawer-head h2{margin:0;font-size:17px}.drawer-head p{margin:5px 0 0;color:var(--muted);font-size:13px}.close{width:34px;height:34px;border:1px solid var(--field-border);background:#fff;border-radius:8px;font-size:20px;line-height:1;color:var(--muted);cursor:pointer}.close:hover{background:#f7f3ed}.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:10px 20px;background:#faf7f1;border-bottom:1px solid var(--line)}.meta>div{display:flex;flex-direction:column;gap:2px;min-width:0}.meta span{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}.meta strong{font-size:13px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.divider{padding:6px 20px;color:var(--muted);font-size:12px;border-bottom:1px solid var(--line)}.messages{flex:1;overflow-y:auto;padding:12px 20px 64px;background:var(--canvas)}.fab{position:absolute;right:16px;bottom:16px;z-index:6;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:999px;border:1px solid var(--teal);background:rgba(255,255,255,.92);color:var(--teal);font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(40,36,30,.22);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:transform .15s ease,background .15s ease,color .15s ease}.fab:hover{background:var(--teal);color:#fff;transform:translateY(-2px)}.fab:active{transform:translateY(0)}.fab:disabled{opacity:.55;cursor:default;transform:none}.fab:focus-visible{outline:2px solid var(--teal);outline-offset:2px}.message{display:flex;gap:12px;margin-bottom:18px}.message.user{flex-direction:row}.message.bot{flex-direction:row-reverse}.mbody{display:flex;flex-direction:column;gap:6px;max-width:80%}.message.user .mbody{align-items:flex-start}.message.user .bubble{background:#f8f7f4;border-color:#e8e3da;box-shadow:0 1px 3px rgba(37,36,33,.04)}.message.user .bubble pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}.message.bot .mbody{align-items:flex-end}.mavatar{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-weight:700;flex:none;font-size:14px}.message.user .mavatar{background:#e7f4f2;color:var(--teal)}.message.bot .mavatar{background:var(--redsoft);color:var(--red)}.mmeta{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}.message.bot .mmeta{flex-direction:row-reverse}.mmeta strong{color:var(--ink);font-weight:600}.bubble{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;line-height:1.65;white-space:normal;word-break:break-word;font-size:14px;color:var(--ink)}.message.bot .bubble{background:#fff;color:var(--ink);border-color:#e8e3da;box-shadow:0 1px 3px rgba(37,36,33,.04)}.message.bot .bubble pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}.message.bot .bubble code{background:rgba(0,0,0,.05)}.channel{font-size:11px;color:var(--muted)}.toolcard{background:#faf9f6;border-left:3px solid var(--teal);border-radius:10px;padding:10px 12px;margin:6px 0;font-size:13px;overflow-x:auto;max-width:100%}.toolcard.err{border-left-color:var(--red);background:var(--redsoft)}.toolcard .tname{font-weight:700;color:var(--teal);margin-bottom:4px}.toolcard.err .tname{color:var(--red)}.toolcard pre{margin:6px 0 0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--ink)}.thinking{background:#fdfbf7;border:1px dashed #ddd6c8;border-radius:10px;padding:10px 14px;margin:6px 0;font-size:12px;color:var(--muted);font-style:italic}.msg-collapse{border-radius:10px;margin:6px 0;overflow:hidden;background:#fff}.msg-collapse summary{cursor:pointer;padding:8px 12px;font-size:12px;color:var(--muted);background:var(--canvas);list-style:none;display:flex;align-items:center;gap:6px;user-select:none}.msg-collapse summary::-webkit-details-marker{display:none}.msg-collapse summary::before{content:'▸';font-size:10px;transition:transform .2s}.msg-collapse[open] > summary::before{transform:rotate(90deg)}.msg-collapse[open] > summary{color:var(--ink);background:#f9f6f0;border-bottom:1px solid var(--line)}.loading{padding:40px;text-align:center;color:var(--muted)}.spinner{display:inline-block;width:22px;height:22px;border:2px solid var(--line);border-top-color:var(--red);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:10px}@keyframes spin{to{transform:rotate(360deg)}}\n.date-divider{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:10px 0;margin:4px 0 14px;pointer-events:none}\n.date-divider::before,.date-divider::after{content:\"\";flex:1;height:1px;background:var(--line);margin:0 12px}\n.date-divider span{background:var(--paper);color:var(--muted);font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;border:1px solid var(--line);box-shadow:0 1px 3px rgba(37,36,33,.06)}\n.jump-nav{position:fixed;right:16px;bottom:68px;z-index:20;display:flex;pointer-events:none}\n.jump-btn{pointer-events:auto;display:inline-flex;align-items:center;gap:4px;height:40px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.95);color:var(--ink);font-size:13px;font-weight:600;line-height:1;white-space:nowrap;cursor:pointer;box-shadow:0 4px 14px rgba(40,36,30,.14);transition:background .15s,color .15s,transform .1s}\n.jump-btn:hover{background:var(--teal);color:#fff;border-color:var(--teal);transform:translateY(-1px)}\n.jump-btn:active{transform:translateY(0)}\n#msgTop,#msgBottom{height:0}\n@media(max-width:900px){#filters{grid-template-columns:1fr 1fr}.meta{grid-template-columns:repeat(2,1fr)}.drawer-head{flex-wrap:wrap}}mark{background:#fde68a;color:var(--ink);padding:1px 2px;border-radius:3px}.msg-search{flex:1;display:flex;align-items:center;gap:8px;padding:0;background:transparent}.msg-search input{flex:1;height:34px;padding:0 12px;border:1px solid var(--line);border-radius:9px;font-size:13px;background:var(--paper);color:var(--ink);outline:none}.msg-search input:focus{border-color:var(--teal)}.search-count{font-size:12px;color:var(--muted);white-space:nowrap}.search-clear{background:none;border:none;font-size:16px;cursor:pointer;color:var(--muted);padding:0 4px}.head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;width:100%}.head-main{flex:1 1 auto;min-width:0}.head-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0}@media(max-width:640px){.head-row{gap:12px}.head-main p{font-size:12px}.head-right{width:100%;align-items:flex-start;padding-top:10px;border-top:1px dashed var(--line)}}.head-left>p{font-size:12px}.head-right{width:100%;align-items:flex-start;padding-top:10px;border-top:1px dashed var(--line)}}";
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
  js.push("var msgMode = 'desc';"); // 'desc' = 最新在底（默认向上滚加载更早）；'asc' = 最早在顶（向下滚加载更新）
  js.push("var newestSeq = null;");
  js.push("var msgHighlight = null;");
  js.push("var currentMatchIdx = -1;");
  js.push("");
  js.push("function $(id){ return document.getElementById(id); }");
  js.push("function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\\"/g, '&quot;'); }");
  js.push("function pad(n){ return (n < 10 ? '0' : '') + n; }");
  js.push("function fmt(ts){ if (!ts) return '-'; var d = new Date(ts); if (isNaN(d.getTime())) return '-'; return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }");
  js.push("function fmtTime(ts){ var f = fmt(ts); var p = f.split(' '); return p[1] || ''; }");
  js.push("function agentLabel(id){ return id || '未知 Agent'; }");
  js.push("function sourceLabel(ch){ if (ch === 'feishu') return '飞书'; if (ch === 'weixin') return '微信'; if (ch === 'webchat') return 'Web'; return ch || '-'; }");
  js.push("function catLabel(s){ return s && (s.is_group === 1 || s.is_group === true) ? '群聊' : '单聊'; }");
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
  js.push("  return '<div class=\"toolcard\"><div class=\"tname\">🔧 ' + esc(name) + '</div>' + (a && a !== '{}' ? '<pre>' + esc(a) + '</pre>' : '') + (b.id ? '<div style=\"color:var(--muted);font-size:11px;margin-top:4px\">id: ' + esc(b.id) + '</div>' : '') + '</div>';");
  js.push("}");
  js.push("function toolResultCard(msg, c){");
  js.push("  var text = '';");
  js.push("  if (typeof c === 'string') text = c;");
  js.push("  else if (Array.isArray(c)) { c.forEach(function(b){ if (typeof b === 'string') text += b + '\\n'; else if (b && b.type === 'text') text += b.text + '\\n'; }); }");
  js.push("  else { text = JSON.stringify(c, null, 2); }");
  js.push("  var isErr = msg.is_error === true || msg.is_error === 1;");
  js.push("  return '<div class=\"toolcard' + (isErr ? ' err' : '') + '\"><div class=\"tname\">' + (isErr ? '⚠ ' : '') + esc(msg.tool_name || 'tool result') + '</div>' + (text ? '<pre>' + esc(text.substring(0, 8000)) + '</pre>' : '') + '</div>';");
  js.push("}");
  js.push("function renderContent(msg){");
  js.push("  var c = msg.content_json;");
  js.push("  if (c == null || c === '') return '';");
  js.push("  try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch (e) { return '<div class=\"bubble\">' + esc(String(c)) + '</div>'; }");
  js.push("  if (typeof c === 'string') return '<div class=\"bubble\">' + md(c) + '</div>';");
  js.push("  if (Array.isArray(c)) {");
  js.push("    var out = '';");
  js.push("    c.forEach(function(b){");
  js.push("      if (typeof b === \'string\') { out += \'<div class=\"bubble\">\' + md(b) + \'</div>\'; return; }");
  js.push("      if (typeof b === 'string') { out += '<div class=\"bubble\">' + md(b) + '</div>'; return; }");
  js.push("      if (b.type === 'text') { out += '<div class=\"bubble\">' + md(b.text || '') + '</div>'; return; }");
  js.push("      if (b.type === 'thinking') { out += '<details class=\"msg-collapse\"><summary>💭 思考过程</summary><div class=\"thinking\">' + esc(b.thinking || '') + '</div></details>'; return; }");
  js.push("      if (b.type === 'toolCall' || b.type === 'tool_use') { out += '<details class=\"msg-collapse\"><summary>🔧 调用工具：' + esc(b.name || 'tool') + '</summary>' + toolCallCard(b) + '</details>'; return; }");
  js.push("      if (b.type === 'image' || b.type === 'image_url') { var src = b.image_url && b.image_url.url ? b.image_url.url : (b.image_url || b.source || ''); if (src) out += '<img src=\"' + esc(src) + '\" style=\"max-width:100%;border-radius:10px;margin:4px 0\" />'; return; }");
  js.push("      out += '<div class=\"toolcard\"><pre>' + esc(JSON.stringify(b, null, 2)) + '</pre></div>';");
  js.push("    });");
  js.push("    return out;");
  js.push("  }");
  js.push("  if (msg.role === 'tool' || msg.role === 'toolResult') { return toolResultCard(msg, c); }");
  js.push("  return '<div class=\"toolcard\"><pre>' + esc(JSON.stringify(c, null, 2)) + '</pre></div>';");
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
  js.push("      else if (b.type === 'toolCall' || b.type === 'tool_use') out += '[调用工具 ' + (b.name || '') + ']\\n';");
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
  js.push("  if (isUser) { name = (currentSession && (currentSession.sender_name || currentSession.label)) || '用户'; avatar = name.slice(-1); }");
  js.push("  else if (role === 'assistant') { name = agentLabel(currentSession && currentSession.agent_id); avatar = '🦞'; }");
  js.push("  else { name = 'Tool'; avatar = '🔧'; }");
  js.push("  var body = renderContent(msg);");
  js.push("  if (isTool) { body = '<details class=\\\"msg-collapse\\\"><summary>\uD83D\uDD27 ' + esc(msg.tool_name || '\u5DE5\u5177\u8C03\u7528\u7ED3\u679C') + ' \u00B7 ' + fmtTime(msg.timestamp) + '</summary>' + body + '</details>'; }");
  js.push("  var html = '<article class=\\\"message ' + cls + '\\\">' + '<div class=\\\"mavatar\\\">' + esc(avatar) + '</div>' + '<div class=\\\"mbody\\\">' + '<div class=\\\"mmeta\\\"><strong>' + esc(name) + '</strong><span>' + fmtTime(msg.timestamp) + '</span></div>' + body + '</div>' + '</article>';");
  js.push("  return html;");
  js.push("}");
  js.push("function renderMessages(msgs){");
  js.push("  var html = '<div id=\"msgTop\"></div>';");
  js.push("  var lastDate = null;");
  js.push("  msgs.forEach(function(m){");
  js.push("    var d = fmt(m.timestamp).split(' ')[0];");
  js.push("    if (d !== lastDate) { html += '<div class=\"date-divider\"><span>' + esc(d) + '</span></div>'; lastDate = d; }");
  js.push("    html += renderMessage(m);");
  js.push("  });");
  js.push("  html += '<div id=\"msgBottom\"></div>';");
  js.push("  return html;");
  js.push("}");
  js.push("async function jumpToTop(){ var box = $('messages'); if (!box) return; if (msgMode === 'asc') { box.scrollTop = 0; return; } msgMode = 'asc'; msgAllLoaded = false; newestSeq = null; currentMessages = []; msgOffset = 0; box.innerHTML = '<div class=\"loading\"><div class=\"spinner\"></div><br>加载最早消息…</div>'; await loadMoreMessages(); box.scrollTop = 0; }");
  js.push("function renderTable(rows){");
  js.push("  var tbody = $('rows');");
  js.push("  if (!rows.length) { tbody.innerHTML = ''; $('empty').style.display = 'block'; $('rows').closest('table').style.display = 'none'; return; }");
  js.push("  $('empty').style.display = 'none';");
  js.push("  $('rows').closest('table').style.display = 'table';");
  js.push("  var html = '';");
  js.push("  rows.forEach(function(s){");
  js.push("    html += '<tr>';");
  js.push("    html += '<td class=\"agent-cell\" title=\"' + esc(s.agent_id || '-') + '\">' + esc(s.agent_id || '-') + '</td>';");
  js.push("    html += '<td class=\"name-cell\" title=\"' + esc(s.sender_name || s.label || '-') + '\">' + esc(s.sender_name || s.label || '-') + '</td>';");
  js.push("    html += '<td class=\"title-cell\" title=\"' + esc(s.display_name || '-') + '\">' + esc(s.display_name || '-') + '</td>';");
  js.push("    html += '<td class=\"time\">' + fmt(s.updated_at).split(' ')[0] + '<small>' + fmt(s.updated_at).split(' ')[1] + '</small></td>';");
  js.push("    html += '<td><span class=\"badge ' + (catLabel(s) === '群聊' ? 'group' : 'single') + '\">' + catLabel(s) + '</span></td>';");
  js.push("    html += '<td><span class=\"source\">' + esc(sourceLabel(s.channel)) + '</span></td>';");
  js.push("    html += '<td><button class=\"detail\" data-key=\"' + esc(s.session_key) + '\">对话详情 ›</button></td>';");
  js.push("    html += '</tr>';");
  js.push("  });");
  js.push("  tbody.innerHTML = html;");
  js.push("  tbody.querySelectorAll('.detail').forEach(function(btn){");
  js.push("    btn.addEventListener('click', function(){ var key = btn.getAttribute('data-key'); if (key) openDrawer(key); });");
  js.push("  });");
  js.push("}");
  js.push("function updateAgentText(){");
  js.push("  var el = $('agentText');");
  js.push("  if (agentSel.length) { el.textContent = agentSel.map(agentLabel).join('、'); el.classList.remove('muted'); }");
  js.push("  else { el.textContent = '请选择 Agent'; el.classList.add('muted'); }");
  js.push("}");
  js.push("function updateSourceText(){");
  js.push("  var el = $('sourceText');");
  js.push("  if (sourceSel.length) { el.textContent = sourceSel.map(sourceLabel).join('、'); el.classList.remove('muted'); }");
  js.push("  else { el.textContent = '请选择数据来源'; el.classList.add('muted'); }");
  js.push("}");
  js.push("function buildAgentMenu(){");
  js.push("  var menu = $('agentMenu');");
  js.push("  if (!allAgents.length) { menu.innerHTML = '<label class=\"option\"><input type=\"checkbox\" value=\"main\">main</label>'; }");
  js.push("  else { menu.innerHTML = allAgents.map(function(a){ return '<label class=\"option\"><input type=\"checkbox\" value=\"' + esc(a) + '\"' + (agentSel.indexOf(a) >= 0 ? ' checked' : '') + '><span>' + esc(agentLabel(a)) + '</span></label>'; }).join(''); }");
  js.push("  menu.onchange = function(){ agentSel = checkedValues(menu); updateAgentText(); };");
  js.push("}");
  js.push("async function loadAgents(){");
  js.push("  try { var res = await fetch(API + '/agents'); var data = await res.json(); allAgents = data.agents || []; buildAgentMenu(); }");
  js.push("  catch (e) { allAgents = ['main']; buildAgentMenu(); }");
  js.push("}");
  js.push("function buildSourceMenu(){");
  js.push("  var menu = $('sourceMenu');");
  js.push("  if (!allSources.length) { menu.innerHTML = ''; return; }");
  js.push("  menu.innerHTML = allSources.map(function(c){ return '<label class=\"option\"><input type=\"checkbox\" value=\"' + esc(c) + '\"' + (sourceSel.indexOf(c) >= 0 ? ' checked' : '') + '>' + esc(sourceLabel(c)) + '</label>'; }).join('');");
  js.push("  menu.onchange = function(){ sourceSel = checkedValues(menu); updateSourceText(); };");
  js.push("}");
  js.push("async function loadSources(){");
  js.push("  try { var res = await fetch(API + '/sources'); var data = await res.json(); allSources = data.channels || []; buildSourceMenu(); }");
  js.push("  catch (e) { allSources = []; buildSourceMenu(); }");
  js.push("}");
  js.push("async function loadSessions(){");
  js.push("  var myToken = ++reqToken;");
  js.push("  var btn = $('searchBtn');");
  js.push("  btn.disabled = true; btn.textContent = '搜索中…';");
  js.push("  $('errorBox').style.display = 'none';");
  js.push("  var params = new URLSearchParams();");
  js.push("  var name = $('name').value.trim();");
  js.push("  if (name) params.set('search', name);");
  js.push("  if (agentSel.length) params.set('agentId', agentSel.join(','));");
  js.push("  if (sourceSel.length) params.set('channel', sourceSel.join(','));");
  js.push("  var start = $('startDate').value;");
  js.push("  var end = $('endDate').value;");
  js.push("  if (start && end && start > end) { alert('开始日期不能晚于结束日期'); btn.disabled = false; btn.textContent = '搜索'; return; }");
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
  js.push("    if (myToken === reqToken) { $('errorBox').textContent = '查询失败，请稍后重试'; $('errorBox').style.display = 'block'; }");
  js.push("  } finally {");
  js.push("    if (myToken === reqToken) { btn.disabled = false; btn.textContent = '搜索'; }");
  js.push("  }");
  js.push("}");
  js.push("function updatePager(){");
  js.push("  var totalPages = Math.max(1, Math.ceil(totalCount / pageSize));");
  js.push("  $('count').textContent = totalCount;");
  js.push("  $('pageInfo').textContent = '共 ' + totalCount + ' 条 · 第 ' + currentPage + '/' + totalPages + ' 页';");
  js.push("  $('prevBtn').disabled = currentPage <= 1;");
  js.push("  $('nextBtn').disabled = currentPage >= totalPages;");
  js.push("}");
  js.push("async function openDrawer(key){");
  js.push("  selectedKey = key;");
  js.push("  currentSession = allSessions.find(function(s){ return s.session_key === key; }) || null;");
  js.push("  $('layer').classList.add('open');");
  js.push("  document.body.style.overflow = 'hidden';");
  js.push("  if (currentSession) {");
  js.push("    $('meta').innerHTML = '<div><span>Agent</span><strong>' + esc(agentLabel(currentSession.agent_id)) + '</strong></div>' + '<div><span>用户</span><strong>' + esc(currentSession.sender_name || currentSession.label || '-') + '</strong></div>' + '<div><span>来源</span><strong>' + esc(sourceLabel(currentSession.channel)) + '</strong></div>' + '<div><span>分类</span><strong>' + esc(catLabel(currentSession)) + '</strong></div>';");
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
  js.push("  if (msgOffset === 0) { box.innerHTML = '<div class=\"loading\"><div class=\"spinner\"></div><br>加载对话中…</div>'; }");
  js.push("  else { var foot = document.createElement('div'); foot.className = 'loading'; foot.id = 'msgMore'; foot.innerHTML = '加载更多…'; box.appendChild(foot); }");
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
  js.push("  if (msgs.length === 0 && msgOffset === 0) { box.innerHTML = '<div class=\"loading\">该会话暂无消息</div>'; msgAllLoaded = true; msgLoading = false; return; }");
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
  js.push("    if (msgOffset === 0) { box.innerHTML = '<div class=\"loading\" id=\"msgErr\">加载失败：' + esc(e.message) + '<br><button class=\"detail\" id=\"retryBtn\">重试</button></div>'; var rb = $('retryBtn'); if (rb) rb.addEventListener('click', function(){ openDrawer(selectedKey); }); }");
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
  js.push("    var who = m.role === 'user' ? (currentSession ? (currentSession.sender_name || currentSession.label || '用户') : '用户') : (m.role === 'assistant' ? agentLabel(currentSession && currentSession.agent_id) : (m.tool_name || '工具'));");
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
  js.push("  var b = $('fabCopy'); b.disabled = true; var old = b.textContent; b.textContent = '导出中…';");
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
  js.push("    b.textContent = '已复制 ' + bytes + ' 字';");
  js.push("    setTimeout(function(){ b.textContent = old; b.disabled = false; }, 1800);");
  js.push("  } catch (e) {");
  js.push("    b.textContent = '导出失败';");
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
  js.push("  count.textContent = '搜索中…';");
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
  js.push("    if (msgsArr.length === 0) { box.innerHTML = '<div class=\\\"loading\\\">未找到匹配的消息</div>'; }");
  js.push("    else { box.innerHTML = renderMessages(msgsArr); highlightMatches(box, q); }");
  js.push("    box.scrollTop = 0;");
  js.push("    count.textContent = msgsArr.length + ' 条匹配';");
  js.push("  } catch (e) { box.innerHTML = '<div class=\\\"loading\\\">搜索失败：' + esc(e.message) + '</div>'; count.textContent = ''; }");
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
  const rowsHtml = (state && state.sessions ? state.sessions : []).map(function (s) { return rowHtml(s, state); }).join("");
  const lines = [];
  lines.push("<!DOCTYPE html>");
  lines.push("<html lang=\"zh-CN\">");
  lines.push("<head>");
  lines.push("<meta charset=\"UTF-8\">");
  lines.push("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">");
  lines.push("<title>会话记录管理</title>");
  lines.push("<style>");
  lines.push(CSS);
  lines.push(SSR_CSS);
  lines.push("</style>");
  lines.push("<style>" + MARKDOWN_CSS + "</style>");
  const mdSrc = mdClientSrc().replace(/<\/script>/gi, "<\\/script>");
  if (mdSrc) lines.push("<script>" + mdSrc + "</script>");
  lines.push("</head>");
  lines.push("<body class=\"page-list\">");
  lines.push("<main class=\"app\">");
  lines.push("  <header class=\"top\">");
  lines.push("    <h1>会话记录</h1>");
  lines.push("    <p>查找并回溯 Agent 与用户的历史对话</p>");
  lines.push("  </header>");
  lines.push("  <section class=\"card filters\">");
  lines.push("    <div id=\"filters\">");
  lines.push("      <div class=\"field\">");
  lines.push("        <label>Agent</label>");
  lines.push("        <button type=\"button\" class=\"control select\" id=\"agentSelect\"><span id=\"agentText\" class=\"muted\">请选择 Agent</span><span>⌄</span></button>");
  lines.push("        <div class=\"menu\" id=\"agentMenu\"></div>");
  lines.push("      </div>");
  lines.push("      <div class=\"field\">");
  lines.push("        <label for=\"name\">姓名</label>");
  lines.push("        <div class=\"control input\"><span>⌕</span><input id=\"name\" placeholder=\"请输入姓名\"></div>");
  lines.push("      </div>");
  lines.push("      <div class=\"field\">");
  lines.push("        <label>数据来源</label>");
  lines.push("        <button type=\"button\" class=\"control select\" id=\"sourceSelect\"><span id=\"sourceText\" class=\"muted\">请选择数据来源</span><span>⌄</span></button>");
  lines.push("        <div class=\"menu\" id=\"sourceMenu\"></div>");
  lines.push("      </div>");
  lines.push("      <div class=\"field date-field\">");
  lines.push("        <label>日期范围</label>");
  lines.push("        <div class=\"range\"><input id=\"startDate\" class=\"control\" type=\"date\" aria-label=\"开始日期\"><span>至</span><input id=\"endDate\" class=\"control\" type=\"date\" aria-label=\"结束日期\"></div>");
  lines.push("      </div>");
  lines.push("      <div class=\"buttons\">");
  lines.push("        <button class=\"btn primary\" type=\"button\" id=\"searchBtn\">⌕ 搜索</button>");
  lines.push("        <button class=\"btn secondary\" type=\"button\" id=\"resetBtn\">重置</button>");
  lines.push("      </div>");
  lines.push("    </div>");
  lines.push("  </section>");
  lines.push(ssrControlsHtml(state));
  lines.push("  <section class=\"card list-card\">");
  lines.push("    <div class=\"heading\">");
  lines.push("      <div><h2>查询列表</h2><p>共 <strong id=\"count\">0</strong> 条会话记录</p></div>");
  lines.push("    </div>");
  lines.push("    <div class=\"tablebox\">");
  lines.push("      <table>");
  lines.push("        <thead><tr><th>Agent 名称</th><th>姓名</th><th>会话标题</th><th>对话时间</th><th>对话分类</th><th>数据来源</th><th>操作</th></tr></thead>");
  lines.push("        <tbody id=\"rows\">" + rowsHtml + "</tbody>");
  lines.push("      </table>");
  lines.push("      <div class=\"empty\" id=\"empty\">⌕<br><b>暂无匹配记录</b><br><small>请调整筛选条件后重新搜索</small></div>");
  lines.push("    </div>");
  lines.push("    <div class=\"error-banner\" id=\"errorBox\" style=\"display:none\"></div>");
  lines.push("    <footer class=\"pager\">");
  lines.push("      <span id=\"pageInfo\">共 0 条 · 第 1/1 页</span>");
      lines.push("      <select id=\"pageSizeSel\" class=\"page-size\">");
      lines.push("        <option value=\"10\" selected>10 per page</option>");
      lines.push("        <option value=\"25\">25 per page</option>");
      lines.push("        <option value=\"50\">50 per page</option>");
      lines.push("        <option value=\"100\">100 per page</option>");
      lines.push("      </select>");
  lines.push("      <div class=\"pg-controls\">");
  lines.push("        <button id=\"prevBtn\" disabled>‹</button>");
  lines.push("        <button id=\"nextBtn\" disabled>›</button>");
  lines.push("      </div>");
  lines.push("    </footer>");
  lines.push("  </section>");
  lines.push("</main>");
  lines.push("<div class=\"layer\" id=\"layer\">");
  lines.push("  <div class=\"backdrop\" id=\"backdrop\"></div>");
  lines.push("  <aside class=\"drawer\">");
  lines.push("    <header class=\"drawer-head\">");
  lines.push("      <div class=\"msg-search\"><input type=\"search\" id=\"msgSearch\" placeholder=\"搜索消息关键字…\"><span class=\"search-count\" id=\"searchCount\"></span><button class=\"search-clear\" id=\"searchClear\" style=\"display:none\">✕</button></div>");
  lines.push("      <button class=\"close\" id=\"closeBtn\" aria-label=\"关闭\">×</button>");
  lines.push("    </header>");
  lines.push("    <div class=\"meta\" id=\"meta\"></div>");
  lines.push("    <div class=\"jump-nav\" aria-label=\"消息跳转\">");
  lines.push("      <button class=\"jump-btn\" id=\"jumpTop\" aria-label=\"到最早的消息\">▲ 顶部</button>");
  lines.push("    </div>");
  lines.push("    <div class=\"messages\" id=\"messages\"></div>");
  lines.push("    <button class=\"fab\" id=\"fabCopy\" aria-label=\"复制全文到剪贴板\">↗ 复制全文</button>");
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

// ── Server-side rendering (works without client JavaScript) ──────────

const SSR_CSS = ".ssr-controls{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);padding:14px 18px;margin-bottom:16px;display:flex;flex-direction:column;gap:10px;flex-shrink:0}.ssr-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ssr-label{color:var(--muted);font-size:13px;font-weight:700;min-width:54px}.ssr-chip{display:inline-block;padding:5px 12px;border:1px solid var(--field-border);border-radius:999px;color:#555;text-decoration:none;font-size:13px;background:var(--field)}.ssr-chip:hover{border-color:var(--teal);color:var(--teal)}.ssr-chip.active{background:var(--teal);color:#fff;border-color:var(--teal)}.ssr-page{display:inline-block;padding:6px 12px;border:1px solid var(--field-border);border-radius:8px;color:#555;text-decoration:none;font-size:13px}.ssr-page:hover{border-color:var(--teal);color:var(--teal)}.ssr-page.disabled{opacity:.4;pointer-events:none}.ssr-pginfo{color:var(--muted);font-size:13px;margin:0 6px}.ssr-note{color:var(--muted);font-size:12px;line-height:1.6}.detail{color:var(--teal);text-decoration:none;font-size:13px}.detail:hover{text-decoration:underline}";

function escHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pad2(n) { return (n < 10 ? "0" : "") + n; }
function fmtTs(ts) {
  if (!ts) return "-";
  const d = new Date(typeof ts === "number" ? ts : Number(ts));
  if (isNaN(d.getTime())) return "-";
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
}
function fmtTimeShort(ts) { const f = fmtTs(ts); const p = f.split(" "); return p[1] || ""; }
function agentLabelTs(id) { return id || "未知 Agent"; }
function sourceLabelTs(ch) {
  if (ch === "feishu") return "飞书";
  if (ch === "weixin") return "微信";
  if (ch === "webchat") return "Web";
  return ch || "-";
}
function catLabelTs(s) { return s && (s.is_group === 1 || s.is_group === true) ? "群聊" : "单聊"; }
function mdText(t: string) {
  if (!t) return "";
  // markdown-it escapes raw HTML by default (html:false) -> safe.
  return mdServer.render(t);
}
function toolCallCardTs(b) {
  const name = b.name || "tool";
  const args = b.arguments || b.input || {};
  const a = typeof args === "string" ? args : JSON.stringify(args, null, 2);
  return '<div class="toolcard"><div class="tname">🔧 ' + escHtml(name) + "</div>" + (a && a !== "{}" ? "<pre>" + escHtml(a) + "</pre>" : "") + (b.id ? '<div style="color:var(--muted);font-size:11px;margin-top:4px">id: ' + escHtml(b.id) + "</div>" : "") + "</div>";
}
function toolResultCardTs(msg, c) {
  let text = "";
  if (typeof c === "string") text = c;
  else if (Array.isArray(c)) { c.forEach(function (b) { if (typeof b === "string") text += b + "\n"; else if (b && b.type === "text") text += b.text + "\n"; }); }
  else { text = JSON.stringify(c, null, 2); }
  const isErr = msg.is_error === true || msg.is_error === 1;
  return '<div class="toolcard' + (isErr ? " err" : "") + '"><div class="tname">' + (isErr ? "⚠ " : "") + escHtml(msg.tool_name || "tool result") + "</div>" + (text ? "<pre>" + escHtml(text.substring(0, 8000)) + "</pre>" : "") + "</div>";
}
function renderContentHtml(cj, msg) {
  if (cj == null || cj === "") return "";
  let c;
  try { c = JSON.parse(cj); if (typeof c === "string") c = JSON.parse(c); } catch { return '<div class="bubble">' + escHtml(String(cj)) + "</div>"; }
  if (typeof c === "string") return '<div class="bubble">' + mdText(c) + "</div>";
  if (Array.isArray(c)) {
    return c.map(function (b) {
      if (typeof b === "string") return '<div class="bubble">' + mdText(b) + "</div>";
      if (b.type === "text") return '<div class="bubble">' + mdText(b.text || "") + "</div>";
      if (b.type === "thinking") return '<details class="msg-collapse"><summary>💭 思考过程</summary><div class="thinking">' + escHtml(b.thinking || "") + "</div></details>";
      if (b.type === "toolCall" || b.type === "tool_use") return '<details class="msg-collapse"><summary>🔧 调用工具：' + escHtml(b.name || "tool") + "</summary>" + toolCallCardTs(b) + "</details>";
      if (b.type === "image" || b.type === "image_url") { const src = (b.image_url && b.image_url.url) ? b.image_url.url : (b.image_url || b.source || ""); return src ? '<img src="' + escHtml(src) + '" style="max-width:100%;border-radius:10px;margin:4px 0">' : ""; }
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
  if (isUser) { name = m.sender_name || m.label || "用户"; avatar = String(name).slice(-1); }
  else if (role === "assistant") { name = agentLabelTs(m.agent_id); avatar = "🦞"; }
  else { name = "Tool"; avatar = "🔧"; }
  let body = renderContentHtml(m.content_json, m);
  if (isTool) body = '<details class="msg-collapse"><summary>🔧 ' + escHtml(m.tool_name || "工具调用结果") + " · " + fmtTimeShort(m.timestamp) + "</summary>" + body + "</details>";
  return '<article class="message ' + cls + '"><div class="mavatar">' + escHtml(avatar) + '</div><div class="mbody"><div class="mmeta"><strong>' + escHtml(name) + "</strong><span>" + fmtTimeShort(m.timestamp) + "</span></div>" + body + "</div></article>";
}
function renderMessagesHtml(msgs) {
  let html = '<div id="msgTop"></div>';
  let lastDate = "";
  msgs.forEach(function (m) {
    const d = fmtTs(m.timestamp).split(" ")[0];
    if (d && d !== lastDate) { html += '<div class="date-divider"><span>' + escHtml(d) + "</span></div>"; lastDate = d; }
    html += renderMessageHtml(m);
  });
  html += '<div id="msgBottom"></div>';
  return html;
}
function rowHtml(s, _state) {
  const key = encodeURIComponent(s.session_key);
  return "<tr>" +
    '<td class="agent-cell" title="' + escHtml(s.agent_id || "-") + '">' + escHtml(s.agent_id || "-") + "</td>" +
    '<td class="name-cell" title="' + escHtml(s.sender_name || s.label || "-") + '">' + escHtml(s.sender_name || s.label || "-") + "</td>" +
    '<td class="title-cell" title="' + escHtml(s.display_name || "-") + '">' + escHtml(s.display_name || "-") + "</td>" +
    '<td class="time">' + fmtTs(s.updated_at).split(" ")[0] + "<small>" + fmtTs(s.updated_at).split(" ")[1] + "</small></td>" +
    '<td><span class="badge ' + (catLabelTs(s) === "群聊" ? "group" : "single") + '">' + catLabelTs(s) + "</span></td>" +
    '<td><span class="source">' + escHtml(sourceLabelTs(s.channel)) + "</span></td>" +
    '<td><a class="detail" href="?session=' + key + '">对话详情 ›</a></td>' +
    "</tr>";
}
function ssrControlsHtml(state) {
  const f = state.filters || {};
  const buildHref = function (over) {
    const p = new URLSearchParams();
    if (f.search) p.set("search", f.search);
    if (over.agent) p.set("agent", over.agent); else if (f.agentId) p.set("agent", f.agentId);
    if (over.channel) p.set("channel", over.channel); else if (f.channel) p.set("channel", f.channel);
    if (f.dateFrom) p.set("dateFrom", f.dateFrom);
    if (f.dateTo) p.set("dateTo", f.dateTo);
    if (over.page) p.set("page", String(over.page));
    else if (state.page && state.page > 1) p.set("page", String(state.page));
    return "?" + p.toString();
  };
  const agentChips = (state.agents || []).map(function (a) {
    const active = f.agentId === a ? " active" : "";
    return '<a class="ssr-chip' + active + '" href="' + escHtml(buildHref({ agent: a })) + '">' + escHtml(agentLabelTs(a)) + "</a>";
  }).join("");
  const chanChips = (state.channels || []).map(function (c) {
    const active = f.channel === c ? " active" : "";
    return '<a class="ssr-chip' + active + '" href="' + escHtml(buildHref({ channel: c })) + '">' + escHtml(sourceLabelTs(c)) + "</a>";
  }).join("");
  const total = state.total || 0;
  const page = state.page || 1;
  const pageSize = state.pageSize || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pager = '<a class="ssr-page' + (page <= 1 ? " disabled" : "") + '" href="' + escHtml(buildHref({ page: page - 1 })) + '">‹ 上一页</a>' +
    '<span class="ssr-pginfo">第 ' + page + "/" + totalPages + " 页 · 共 " + total + " 条</span>" +
    '<a class="ssr-page' + (page >= totalPages ? " disabled" : "") + '" href="' + escHtml(buildHref({ page: page + 1 })) + '">下一页 ›</a>';
  return '<div id="ssrControls" class="ssr-controls">' +
    '<div class="ssr-row"><span class="ssr-label">Agent：</span><a class="ssr-chip' + (f.agentId ? "" : " active") + '" href="' + escHtml(buildHref({ agent: "" })) + '">全部</a>' + agentChips + "</div>" +
    '<div class="ssr-row"><span class="ssr-label">来源：</span><a class="ssr-chip' + (f.channel ? "" : " active") + '" href="' + escHtml(buildHref({ channel: "" })) + '">全部</a>' + chanChips + "</div>" +
    '<div class="ssr-row"><span class="ssr-label">分页：</span>' + pager + "</div>" +
    '<div class="ssr-note">精简浏览模式：当前为沙盒禁用脚本状态，列表 / 翻页 / 筛选 / 进入详情 / 导出均可正常使用；切换菜单后重载即可启用搜索与消息内查找。</div>' +
    "</div>";
}
function buildDetailHtml(state) {
  const s = state.session;
  const msgs = state.messages || [];
  const msearch = state.msearch;
  const key = encodeURIComponent(s.session_key);
  const L = [];
  L.push("<!DOCTYPE html>");
  L.push("<html lang=\"zh-CN\">");
  L.push("<head>");
  L.push("<meta charset=\"UTF-8\">");
  L.push("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">");
  L.push("<title>对话详情 · " + escHtml(s.display_name || s.sender_name || s.session_id || "会话") + "</title>");
  L.push("<style>");
  L.push(CSS);
  L.push(SSR_CSS);
  L.push("</style>");
  L.push("<style>" + MARKDOWN_CSS + "</style>");
  L.push("</head>");
  L.push("<body class=\"page-detail\">");
  L.push("<main class=\"app\">");
  L.push("  <header class=\"top\"><div class=\"head-row\"><div class=\"head-left\"><h1>对话详情</h1><p>" + escHtml(s.display_name || "-") + "</p></div><div class=\"head-right\"><a class=\"btn secondary\" href=\"?\">← 返回列表</a><a class=\"btn primary\" href=\"?session=" + key + "&dl=1\">↧ 导出</a></div></div></header>");
  L.push("  <section class=\"card\" style=\"padding:18px 20px;margin-bottom:16px\"><div style=\"display:flex;gap:28px;flex-wrap:wrap\">");
  L.push("    <div style=\"display:flex;flex-direction:column;gap:2px\"><span style=\"color:var(--muted);font-size:12px\">Agent</span><strong>" + escHtml(s.agent_id || "未知") + "</strong></div>");
  L.push("    <div style=\"display:flex;flex-direction:column;gap:2px\"><span style=\"color:var(--muted);font-size:12px\">用户</span><strong>" + escHtml(s.sender_name || s.label || "-") + "</strong></div>");
  L.push("    <div style=\"display:flex;flex-direction:column;gap:2px\"><span style=\"color:var(--muted);font-size:12px\">来源</span><strong>" + escHtml(sourceLabelTs(s.channel)) + "</strong></div>");
  L.push("    <div style=\"display:flex;flex-direction:column;gap:2px\"><span style=\"color:var(--muted);font-size:12px\">分类</span><strong>" + escHtml(catLabelTs(s)) + "</strong></div>");
  L.push("  </div></section>");
  L.push("  <form class=\"card\" style=\"display:flex;gap:10px;align-items:center;padding:12px 16px;margin-bottom:16px\" method=\"get\" action=\"\">");
  L.push("    <input type=\"hidden\" name=\"session\" value=\"" + key + "\">");
  L.push("    <input type=\"search\" name=\"msearch\" placeholder=\"搜索消息关键字…\" value=\"" + escHtml(msearch || "") + "\" style=\"flex:1;height:38px;border:1px solid var(--field-border);border-radius:9px;padding:0 12px\">");
  L.push("    <button class=\"btn primary\" type=\"submit\">搜索</button>");
  L.push("    <a class=\"btn secondary\" href=\"?session=" + key + "\">清除</a>");
  L.push("  </form>");
  L.push("  <section class=\"card\"><div class=\"tablebox\"><div class=\"messages\" style=\"max-height:none;padding:18px 20px\">");
  if (!msgs.length) L.push("<div class=\"loading\">该会话暂无消息</div>");
  else L.push(renderMessagesHtml(msgs));
  L.push("  </div></div></section>");
  L.push("  <div class=\"jump-nav\" aria-label=\"消息跳转\">");
  L.push("    <a class=\"jump-btn\" href=\"#msgTop\" aria-label=\"到最早的消息\">▲ 顶部</a>");
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
  try { c = JSON.parse(cj); } catch { return String(cj); }
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    let out = "";
    c.forEach(function (b) {
      if (typeof b === "string") out += b + "\n";
      else if (b && b.type === "text") out += (b.text || "") + "\n";
      else if (b.type === "toolCall" || b.type === "tool_use") out += "[调用工具 " + (b.name || "") + "]\n";
    });
    return out;
  }
  if (m.role === "tool" || m.role === "toolResult") {
    if (typeof c === "string") return c;
    if (Array.isArray(c)) { let t = ""; c.forEach(function (b) { t += (typeof b === "string" ? b : (b && b.text ? b.text : "")) + "\n"; }); return t; }
    return JSON.stringify(c, null, 2);
  }
  return JSON.stringify(c, null, 2);
}
export function buildExportText(session, messages) {
  const lines = [];
  lines.push("会话：" + (session.display_name || session.sender_name || session.session_id || ""));
  lines.push("Agent：" + (session.agent_id || ""));
  lines.push("来源：" + sourceLabelTs(session.channel) + "  分类：" + catLabelTs(session));
  lines.push("");
  messages.forEach(function (m) {
    const who = m.role === "user" ? (session.sender_name || session.label || "用户") : (m.role === "assistant" ? (session.agent_id || "Assistant") : (m.tool_name || "工具"));
    lines.push(who + " " + fmtTimeShort(m.timestamp));
    lines.push(plainTextTs(m));
    lines.push("");
  });
  return lines.join("\n");
}

export function renderListPage(state) { return buildListHtml(state); }
export function renderDetailPage(state) { return buildDetailHtml(state); }
