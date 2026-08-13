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
  // Activity card styles live in the main CSS block (the big CSS string),
  // NOT here. MARKDOWN_CSS is injected AFTER the main CSS and was silently
  // overriding the transparent variant, so the outer bubble kept rendering
  // as an opaque white card. Removed to avoid the override; main CSS is the
  // single source of truth for .activity* rules.
  // Sandbox fallback: hide the real UI by default; only reveal it after the
  // client script runs (i.e. the document is NOT in a strict sandbox without
  // allow-scripts). In a strict sandbox the <noscript> guide shows instead,
  // telling the user to re-enter via a side menu so the page reloads with
  // scripts enabled.
  ".app{display:none}",
  ".noscript-guide{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;z-index:1}",
  ".noscript-guide-inner{max-width:440px;width:100%;background:var(--paper);border:1px solid var(--line);border-left:4px solid var(--teal);border-radius:var(--radius);padding:28px 32px;box-shadow:var(--shadow)}",
  ".noscript-guide h2{margin:0 0 12px;font-size:16px;font-weight:700;color:#0f7a74;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}",
  ".noscript-guide h2 .dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--teal);box-shadow:0 0 0 4px rgba(22,143,137,.18);animation:pulse 1.6s ease-in-out infinite}",
  ".noscript-guide p{margin:0;font-size:13.5px;line-height:1.75;color:#3a3833}",
  ".noscript-guide .lang-switch{display:flex;gap:8px;margin:0 0 14px}",
  ".noscript-guide .lang-tab{display:inline-block;cursor:pointer;padding:4px 16px;border:1px solid var(--line);border-radius:999px;font-size:12.5px;color:var(--muted);user-select:none;background:var(--paper)}",
  ".noscript-guide input[name=sa-lang]{position:absolute;opacity:0;width:0;height:0;pointer-events:none}",
  ".noscript-guide #sa-zh:checked~.lang-tab[for=sa-zh],.noscript-guide #sa-en:checked~.lang-tab[for=sa-en]{color:#fff;background:var(--teal);border-color:var(--teal)}",
  ".noscript-guide .lang-block{display:none}",
  ".noscript-guide #sa-zh:checked~.lang-zh{display:block}",
  ".noscript-guide #sa-en:checked~.lang-en{display:block}",
  ".noscript-guide .lang-zh p,.noscript-guide .lang-en p{margin:0;font-size:13.5px;line-height:1.85;color:#3a3833}",
  "@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.85)}}",
].join("");

const CSS = ":root{--ink:#252421;--muted:#78746d;--line:#e8e3da;--paper:#fffefa;--canvas:#f5f2ec;--red:#d84a38;--redsoft:#fff1ed;--teal:#168f89;--radius:14px;--radius-sm:9px;--shadow:0 2px 10px rgba(86,75,56,.06);--field:#fff;--field-border:#ded8ce}*{box-sizing:border-box}html,body{height:100%}body.page-list{overflow:hidden}body.page-detail{overflow-y:auto}body{margin:0;background:var(--canvas);color:var(--ink);font:14px Arial,\\\"PingFang SC\\\",\\\"Microsoft YaHei\\\",sans-serif}button,input{font:inherit}button{cursor:pointer}input[type=date]::-webkit-clear-button{display:none}input[type=date]::-webkit-inner-spin-button{display:none}input[type=search]::-webkit-search-cancel-button{display:none}.app{position:relative;width:min(1500px,calc(100% - 40px));margin:auto;padding:4px 0 0;height:100vh;display:flex;flex-direction:column}.top{display:flex;flex-direction:column;align-items:flex-start;gap:0;margin-bottom:20px;flex-shrink:0}.top h1{margin:0;font-size:22px;font-weight:650;color:#bd4531;letter-spacing:-.03em;line-height:1.2}.top p{margin:4px 0 0;color:#252421;font-size:13px;opacity:.85}.card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.filters{padding:20px;margin-bottom:16px;flex-shrink:0}.list-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;margin-bottom:0}.list-card .tablebox{flex:1;overflow:auto;min-height:0}#filters{display:grid;grid-template-columns:1fr 1.2fr 1fr 2.2fr auto;gap:14px;align-items:end}.field{position:relative}.field>label{display:block;margin-bottom:8px;color:#5e5a53;font-size:13px;font-weight:700}.control{width:100%;height:42px;border:1px solid var(--field-border);border-radius:var(--radius-sm);background:var(--field);padding:0 12px;color:#555}.control:focus{outline:none;border-color:var(--red)}.select{display:flex;align-items:center;justify-content:space-between;text-align:left}.muted{color:#aaa49b}.menu{display:none;position:absolute;z-index:20;top:calc(100% + 6px);left:0;width:100%;padding:7px;background:#fff;border:1px solid #dcd6cc;border-radius:10px;box-shadow:0 10px 28px rgba(63,57,44,.14)}.menu.open{display:block}.option{display:flex;gap:9px;align-items:center;padding:10px;border-radius:7px;cursor:pointer;font-size:13px;color:var(--ink);min-width:0}.option>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.option:hover{background:#f7f3ed}.option input{accent-color:var(--red);width:16px;height:16px}.input{display:flex;align-items:center;gap:8px;padding:0 12px}.input input{min-width:0;flex:1;border:0;outline:0;color:#555}.range{display:flex;align-items:center;gap:8px}.range .control{min-width:0;padding:0 9px}.range span{flex:none;color:#80796f}.range input[type=date]{position:relative;cursor:pointer;background-image:url('data:image/svg+xml,%3Csvg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"16\\\" height=\\\"16\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"%2378746d\\\" stroke-width=\\\"2\\\" stroke-linecap=\\\"round\\\" stroke-linejoin=\\\"round\\\"%3E%3Crect x=\\\"3\\\" y=\\\"4\\\" width=\\\"18\\\" height=\\\"18\\\" rx=\\\"2\\\"/%3E%3Cline x1=\\\"16\\\" y1=\\\"2\\\" x2=\\\"16\\\" y2=\\\"6\\\"/%3E%3Cline x1=\\\"8\\\" y1=\\\"2\\\" x2=\\\"8\\\" y2=\\\"6\\\"/%3E%3Cline x1=\\\"3\\\" y1=\\\"10\\\" x2=\\\"21\\\" y2=\\\"10\\\"/%3E%3C/svg%3E');background-repeat:no-repeat;background-position:right 12px center;background-size:16px;padding-right:34px}.range input[type=date]::-webkit-calendar-picker-indicator{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;opacity:0;cursor:pointer}.buttons{display:flex;gap:10px}.btn{height:42px;padding:0 18px;border-radius:var(--radius-sm);border:1px solid transparent;font-weight:600;font-size:14px}.btn.primary{background:var(--red);color:#fff}.btn.primary:hover{background:#c23f2f}.btn.primary:disabled{opacity:.6;cursor:default}.btn.secondary{background:#fff;border-color:var(--field-border);color:var(--ink)}.btn.secondary:hover{background:#f7f3ed}.heading{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--line)}.heading h2{margin:0;font-size:17px}.heading p{margin:5px 0 0;color:var(--muted);font-size:13px}table{width:100%;border-collapse:collapse;font-size:13px}.list-card thead th{position:sticky;top:0;z-index:5;background:var(--paper);text-align:left;padding:12px 18px;color:var(--muted);font-size:14px;font-weight:700;letter-spacing:.04em;box-shadow:inset 0 -1px 0 0 var(--line);white-space:nowrap}tbody td{padding:14px 18px;border-bottom:1px solid #f1ece4;vertical-align:middle}tbody tr:last-child td{border-bottom:none}tbody tr:hover{background:#faf7f1}.agent{display:flex;align-items:center;gap:10px}.agent strong{font-weight:600}.person{display:flex;align-items:center;gap:9px}.avatar{width:28px;height:28px;border-radius:50%;background:var(--redsoft);color:var(--red);display:grid;place-items:center;font-weight:700;font-size:13px;flex:none}.time{white-space:nowrap}.time small{display:block;color:var(--muted);font-size:12px;margin-top:2px}.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600}.badge.single{background:#eef6f4;color:var(--teal)}.badge.group{background:#fdf0e8;color:#c47932}.source{color:var(--muted);font-size:13px}.title-cell{max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.name-cell{max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.agent-cell{max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.detail{background:none;border:none;color:var(--red);font-weight:600;font-size:13px;padding:6px 0;cursor:pointer}.detail:hover{text-decoration:underline}.empty{display:none;text-align:center;padding:60px 20px;color:var(--muted)}.empty b{display:block;margin:8px 0 4px;color:var(--ink);font-size:15px}.empty small{color:var(--muted)}.page-size{height:34px;padding:4px 28px 4px 10px;border:1px solid var(--field-border);border-radius:var(--radius-sm);background:var(--field);color:var(--ink);font-size:13px;cursor:pointer;outline:none;margin-left:auto}.page-size:focus{border-color:var(--red)}.pager{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}.pg-controls{display:flex;align-items:center;gap:8px}.pager button{height:32px;min-width:32px;padding:0 12px;border:1px solid var(--field-border);background:#fff;border-radius:8px;color:var(--ink);font-weight:600;cursor:pointer}.pager button:disabled{opacity:.45;cursor:default}.pager button.active{background:var(--red);color:#fff;border-color:var(--red)}.layer{display:none}.layer.open{display:block;position:fixed;inset:0;z-index:1000}.backdrop{position:absolute;inset:0;background:rgba(40,36,30,.4)}.drawer{position:absolute;top:0;right:0;height:100%;width:min(880px,96vw);background:var(--paper);box-shadow:-12px 0 40px rgba(40,36,30,.18);display:flex;flex-direction:column;animation:slidein .22s ease}@keyframes slidein{from{transform:translateX(20px);opacity:.6}to{transform:none;opacity:1}}.drawer-controls{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#faf7f1;border-bottom:1px solid var(--line);flex-wrap:wrap}.drawer-head h2{margin:0;font-size:17px}.drawer-head p{margin:5px 0 0;color:var(--muted);font-size:13px}.close{width:34px;height:34px;border:1px solid var(--field-border);background:#fff;border-radius:8px;font-size:20px;line-height:1;color:var(--muted);cursor:pointer}.close:hover{background:#f7f3ed}.activity{margin:0;background:transparent;border:none;border-radius:0;box-shadow:none;overflow:visible}.activity>.ahead{list-style:none;display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;user-select:none;background:transparent;font-size:13px;color:var(--ink)}.activity>.ahead::-webkit-details-marker{display:none}.activity>.ahead:hover{background:var(--canvas)}.activity .achev{transition:transform .15s;font-size:11px;color:var(--muted)}.activity[open]>.ahead .achev{transform:rotate(90deg)}.activity .msg-collapse{background:transparent;border:none;border-radius:0;margin:0}.activity .msg-collapse summary{background:transparent;padding:4px 0}.activity .msg-collapse[open]>summary{background:transparent;border:none}.activity .thinking{background:transparent;border:none;padding:4px 0;margin:0;font-style:normal;color:var(--muted)}.activity .aico{font-size:14px}.activity .atitle{font-weight:700}.activity .acount{color:var(--teal);font-weight:700;background:rgba(22,143,137,.1);padding:1px 8px;border-radius:999px;font-size:12px}.activity .atime{margin-left:auto;color:var(--muted);font-size:12px}.activity>.abody{padding:6px 0 12px;display:flex;flex-direction:column;gap:8px}.activity .actool,.activity .actres{background:var(--canvas);border:1px solid var(--line);border-radius:9px;padding:6px 10px}.activity .actres.err{background:var(--redsoft);border-color:#f0c4bc}.activity .actres summary,.activity .actool summary{cursor:pointer;font-size:13px;color:var(--ink);outline:none}.activity .actres pre,.activity .actool pre{margin:6px 0 0;max-height:240px;overflow:auto;background:#f6f5f2;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:12px;white-space:pre-wrap;word-break:break-word}.message.activity{margin-bottom:14px}.message.activity .activity{margin:0}.message.activity .mbody{gap:0}.message.activity .mavatar{font-size:16px;background:#f3efe7;color:var(--ink)}.messages.hide-thinking .message[data-type=thinking],.messages.hide-thinking .msg-collapse[data-type=thinking],.messages.hide-thinking .thinking{display:none}.message.filtered-empty{display:none}.messages.hide-tools .message[data-type=tool],.messages.hide-tools .msg-collapse[data-type=tool],.messages.hide-tools .toolcard{display:none}.meta{display:grid;grid-template-columns:repeat(4,1fr) auto;gap:14px;padding:10px 20px;background:#faf7f1;border-bottom:1px solid var(--line);align-items:center}.meta>div{display:flex;flex-direction:column;gap:2px;min-width:0}.meta span{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}.meta strong{font-size:13px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.divider{padding:6px 20px;color:var(--muted);font-size:12px;border-bottom:1px solid var(--line)}.messages{flex:1;overflow-y:auto;padding:12px 20px 64px;background:var(--canvas)}.message{display:flex;gap:12px;margin-bottom:18px}.message.user{flex-direction:row}.message.bot{flex-direction:row-reverse}.mbody{display:flex;flex-direction:column;gap:6px;max-width:80%}.message.user .mbody{align-items:flex-start}.message.user .bubble{background:#f8f7f4;border-color:#e8e3da;box-shadow:0 1px 3px rgba(37,36,33,.04)}.message.user .bubble pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}.message.bot .mbody{align-items:flex-end}.mavatar{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-weight:700;flex:none;font-size:14px}.message.user .mavatar{background:#e7f4f2;color:var(--teal)}.message.bot .mavatar{background:var(--redsoft);color:var(--red)}.mmeta{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}.message.bot .mmeta{flex-direction:row-reverse}.mmeta strong{color:var(--ink);font-weight:600}.bubble{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;line-height:1.65;white-space:normal;word-break:break-word;font-size:14px;color:var(--ink)}.message.bot .bubble{background:#fff;color:var(--ink);border-color:#e8e3da;box-shadow:0 1px 3px rgba(37,36,33,.04)}.message.bot .bubble pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}.message.bot .bubble code{background:rgba(0,0,0,.05)}.channel{font-size:11px;color:var(--muted)}.toolcard{background:#faf9f6;border-left:3px solid var(--teal);border-radius:10px;padding:10px 12px;margin:6px 0;font-size:13px;overflow-x:auto;max-width:100%}.toolcard.err{border-left-color:var(--red);background:var(--redsoft)}.toolcard .tname{font-weight:700;color:var(--teal);margin-bottom:4px}.toolcard.err .tname{color:var(--red)}.toolcard pre{margin:6px 0 0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--ink)}.thinking{background:#fdfbf7;border:1px dashed #ddd6c8;border-radius:10px;padding:10px 14px;margin:6px 0;font-size:12px;color:var(--muted);font-style:italic}.msg-collapse{border-radius:10px;margin:6px 0;overflow:hidden;background:#fff}.msg-collapse summary{cursor:pointer;padding:8px 12px;font-size:12px;color:var(--muted);background:var(--canvas);list-style:none;display:flex;align-items:center;gap:6px;user-select:none}.msg-collapse summary::-webkit-details-marker{display:none}.msg-collapse summary::before{content:'▸';font-size:10px;transition:transform .2s}.msg-collapse[open] > summary::before{transform:rotate(90deg)}.msg-collapse[open] > summary{color:var(--ink);background:#f9f6f0;border-bottom:1px solid var(--line)}.loading{padding:40px;text-align:center;color:var(--muted)}.spinner{display:inline-block;width:22px;height:22px;border:2px solid var(--line);border-top-color:var(--red);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:10px}@keyframes spin{to{transform:rotate(360deg)}}.drawer-dates{display:flex;align-items:center;gap:8px;padding:0;border:none;background:transparent;flex:0 1 auto;min-width:0}.drawer-dates .range{gap:6px}.drawer-dates input[type=date]{width:100%;height:34px;padding:0 8px;padding-right:30px;background-position:right 9px center;font-size:12px}.drawer-dates .date-wrap.has-value input[type=date]{background-image:none}.date-wrap,.search-wrap{position:relative;display:flex;align-items:center;flex:1;min-width:0}.date-inside-clear,.search-inside-clear{position:absolute;right:5px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;border:none;background:#e8e3da;color:#78746d;font-size:13px;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;z-index:2}.date-inside-clear:hover,.search-inside-clear:hover{background:#d8d2c7;color:#524e49}.search-wrap{flex:1;min-width:0}.drawer-dates .range span{font-size:12px}#msgTop,#msgBottom{height:0}.fab-group{position:absolute;right:10px;top:50%;transform:translateY(-50%);z-index:30;display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center;pointer-events:none}.fab-item{pointer-events:auto;position:relative;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.95);color:var(--ink);font-size:15px;font-weight:600;line-height:1;cursor:pointer;box-shadow:0 4px 14px rgba(40,36,30,.14);transition:background .15s,color .15s,transform .2s,opacity .2s}.fab-item:hover{background:var(--teal);color:#fff;border-color:var(--teal);transform:translateX(-2px)}.fab-item:active{transform:translateX(0)}.fab-item:disabled{opacity:.55;cursor:default;transform:none}.fab-toggle{width:44px;height:44px;font-size:20px;background:#fff;color:var(--teal);border-color:var(--teal)}.fab-toggle:hover{background:var(--teal);color:#fff}.fab-group .fab-item:not(.fab-toggle){transition:opacity .2s ease,transform .2s ease}.fab-group:not(.open) .fab-item.above{opacity:0;transform:translateY(24px) scale(.4);pointer-events:none}.fab-group:not(.open) .fab-item.below{opacity:0;transform:translateY(-24px) scale(.4);pointer-events:none}.fab-group.open .fab-item.above,.fab-group.open .fab-item.below{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}.fab-item[data-tip]::after{content:attr(data-tip);position:absolute;right:48px;top:50%;transform:translateY(-50%) translateX(6px);padding:4px 10px;border-radius:6px;background:rgba(37,36,33,.85);color:#fff;font-size:12px;font-weight:600;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s}.fab-item[data-tip]:hover::after{opacity:1;transform:translateY(-50%) translateX(0)}.fab-item.active{background:var(--teal);color:#fff;border-color:var(--teal)}.fab-item.active:hover{background:#0f6b66;border-color:#0f6b66}@media(max-width:900px){#filters{grid-template-columns:1fr 1fr}.meta{display:grid;grid-template-columns:repeat(4,1fr) auto;gap:14px;padding:10px 20px;background:#faf7f1;border-bottom:1px solid var(--line);align-items:center}.drawer-controls{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#faf7f1;border-bottom:1px solid var(--line);flex-wrap:wrap}}mark{background:#fde68a;color:var(--ink);padding:1px 2px;border-radius:3px}.msg-search{flex:1;display:flex;align-items:center;gap:8px;padding:0;background:transparent;min-width:160px;max-width:100%}.msg-search{display:flex;align-items:center;gap:8px;flex:1;min-width:0}.msg-search input{flex:1;height:34px;padding:0 12px;padding-right:28px;border:1px solid var(--line);border-radius:9px;font-size:13px;background:var(--paper);color:var(--ink);outline:none;min-width:0}.msg-search input:focus{border-color:var(--teal)}.search-count{font-size:12px;color:var(--muted);white-space:nowrap}.head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;width:100%}.head-main{flex:1 1 auto;min-width:0}.head-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0}@media(max-width:640px){.head-row{gap:12px}.head-main p{font-size:12px}.head-right{width:100%;align-items:flex-start;padding-top:10px;border-top:1px dashed var(--line)}}.head-left>p{font-size:12px}.head-right{width:100%;align-items:flex-start;padding-top:10px;border-top:1px dashed var(--line)}.toast{position:fixed;top:18px;left:50%;transform:translateX(-50%) translateY(-10px);z-index:10000;padding:10px 18px;background:#333;color:#fff;font-size:13px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.18);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;white-space:nowrap}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}.meta-close{justify-self:end}";
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
  js.push("var topDate = null;");
  js.push("var bottomDate = null;");
  js.push("var currentMatchIdx = -1;");
  js.push("var showThinking = false;");
  js.push("var showTools = false;");
  js.push("var isSearchActive = false;");
  js.push("var toastTimer = null;");
  js.push("");
  js.push("function showToast(text, duration){");
  js.push("  var el = $('toast'); if (!el) return;");
  js.push("  el.textContent = text;");
  js.push("  el.classList.add('show');");
  js.push("  if (toastTimer) clearTimeout(toastTimer);");
  js.push("  toastTimer = setTimeout(function(){ el.classList.remove('show'); }, duration || 2200);");
  js.push("}");
  js.push("function $(id){ return document.getElementById(id); }");
  js.push("function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\\"/g, '&quot;'); }");
  js.push("function pad(n){ return (n < 10 ? '0' : '') + n; }");
  js.push("function fmt(ts){ if (!ts) return '-'; var d = new Date(ts); if (isNaN(d.getTime())) return '-'; return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }");
  js.push("function fmtTime(ts){ return fmt(ts); }");
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
  js.push("function msgDataType(role, content_json){");
  js.push("  if (role === 'tool' || role === 'toolResult') return 'tool';");
  js.push("  if (role !== 'assistant') return '';");
  js.push("  var c = content_json;");
  js.push("  if (c == null || c === '') return '';");
  js.push("  try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch (e) { return ''; }");
  js.push("  if (!Array.isArray(c)) return '';");
  js.push("  var visible = [];");
  js.push("  c.forEach(function(b){");
  js.push("    if (typeof b === 'string' && b.trim()) visible.push(b);");
  js.push("    else if (b && b.type === 'text' && (b.text || '').trim()) visible.push(b);");
  js.push("    else if (b && (b.type === 'toolCall' || b.type === 'tool_use' || b.type === 'thinking')) visible.push(b);");
  js.push("  });");
  js.push("  if (visible.length === 0) return '';");
  js.push("  var allTool = visible.every(function(b){ return b.type === 'toolCall' || b.type === 'tool_use'; });");
  js.push("  if (allTool) return 'tool';");
  js.push("  var allThink = visible.every(function(b){ return b.type === 'thinking'; });");
  js.push("  if (allThink) return 'thinking';");
  js.push("  return '';");
  js.push("}");
  js.push("function isEmptyWhenHidden(role, content_json){");
  js.push("  if (role === 'tool' || role === 'toolResult') return true;");
  js.push("  if (role !== 'assistant') return false;");
  js.push("  var c = content_json;");
  js.push("  if (c == null || c === '') return false;");
  js.push("  try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch (e) { return false; }");
  js.push("  if (typeof c === 'string') return false;");
  js.push("  if (!Array.isArray(c)) return false;");
  js.push("  return !c.some(function(b){");
  js.push("    if (typeof b === 'string' && b.trim()) return true;");
  js.push("    if (b && b.type === 'text' && (b.text || '').trim()) return true;");
  js.push("    if (b && (b.type === 'image' || b.type === 'image_url')) return true;");
  js.push("    return false;");
  js.push("  });");
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
  js.push("      if (b.type === 'thinking') { out += '<details class=\"msg-collapse\" data-type=\"thinking\"><summary>💭 思考过程</summary><div class=\"thinking\">' + esc(b.thinking || '') + '</div></details>'; return; }");
  js.push("      if (b.type === 'toolCall' || b.type === 'tool_use') { out += '<details class=\"msg-collapse\" data-type=\"tool\"><summary>🔧 调用工具：' + esc(b.name || 'tool') + '</summary>' + toolCallCard(b) + '</details>'; return; }");
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
  js.push("function hideEmptyMessages(){");
  js.push("  var box = $('messages'); if (!box) return;");
  js.push("  box.querySelectorAll('.message').forEach(function(el){");
  js.push("    if (el.offsetHeight === 0) { el.classList.remove('filtered-empty'); return; }");
  js.push("    var body = el.querySelector('.mbody');");
  js.push("    if (!body) { el.classList.add('filtered-empty'); return; }");
  js.push("    var hasVisible = false;");
  js.push("    body.childNodes.forEach(function(child){");
  js.push("      if (child.nodeType !== 1) return;");
  js.push("      if (child.classList && child.classList.contains('mmeta')) return;");
  js.push("      if (child.offsetHeight > 0) hasVisible = true;");
  js.push("    });");
  js.push("    el.classList.toggle('filtered-empty', !hasVisible);");
  js.push("  });");
  js.push("}");
  js.push("function updateVisibility(){");
  js.push("  var box = $('messages'); if (!box) return;");
  js.push("  if (isSearchActive) { box.classList.remove('hide-thinking', 'hide-tools'); }");
  js.push("  else { box.classList.toggle('hide-thinking', !showThinking); box.classList.toggle('hide-tools', !showTools); }");
  js.push("  var bt = $('btnThinking'); if (bt) { bt.classList.toggle('active', showThinking); bt.setAttribute('aria-pressed', String(showThinking)); }");
  js.push("  var btf = $('btnThinkingFab'); if (btf) { btf.classList.toggle('active', showThinking); btf.setAttribute('aria-pressed', String(showThinking)); }");
  js.push("  var bf = $('btnTools'); if (bf) { bf.classList.toggle('active', showTools); bf.setAttribute('aria-pressed', String(showTools)); }");
  js.push("  var bff = $('btnToolsFab'); if (bff) { bff.classList.toggle('active', showTools); bff.setAttribute('aria-pressed', String(showTools)); }");
  js.push("  hideEmptyMessages();");
  js.push("}");
  js.push("function isActivityMsg(m){");
  js.push("  var role = m.role;");
  js.push("  if (role === 'tool' || role === 'toolResult') return true;");
  js.push("  if (role === 'assistant'){");
  js.push("    var c = m.content_json;");
  js.push("    if (c == null || c === '') return false;");
  js.push("    try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch(e){ return false; }");
  js.push("    if (!Array.isArray(c)) return false;");
  js.push("    var hasText = c.some(function(b){ return (b && b.type === 'text' && (b.text||'').trim()) || (typeof b === 'string' && b.trim()); });");
  js.push("    if (hasText) return false;");
  js.push("    var hasTool = c.some(function(b){ return b && (b.type === 'toolCall' || b.type === 'tool_use'); });");
  js.push("    return hasTool;");
  js.push("  }");
  js.push("  return false;");
  js.push("}");
  js.push("function countTools(msgs){");
  js.push("  var calls = 0; var res = 0;");
  js.push("  msgs.forEach(function(m){");
  js.push("    if (m.role === 'tool' || m.role === 'toolResult'){ res++; return; }");
  js.push("    if (m.role === 'assistant'){ var c = m.content_json; try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch(e){} if (Array.isArray(c)) c.forEach(function(b){ if (b && (b.type === 'toolCall' || b.type === 'tool_use')) calls++; }); }");
  js.push("  });");
  js.push("  return calls || res;");
  js.push("}");
  js.push("function isToolCallOnly(m){");
  js.push("  if (m.role !== 'assistant') return false;");
  js.push("  var c = m.content_json; try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch(e){ return false; }");
  js.push("  if (!Array.isArray(c)) return false;");
  js.push("  var hasText = c.some(function(b){ return (b && b.type === 'text' && (b.text||'').trim()) || (typeof b === 'string' && b.trim()); });");
  js.push("  if (hasText) return false;");
  js.push("  return c.some(function(b){ return b && (b.type === 'toolCall' || b.type === 'tool_use'); });");
  js.push("}");
  js.push("function firstToolName(m){");
  js.push("  var c = m.content_json; try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch(e){ return ''; }");
  js.push("  if (!Array.isArray(c)) return '';");
  js.push("  for (var i = 0; i < c.length; i++){ if (c[i] && (c[i].type === 'toolCall' || c[i].type === 'tool_use')) return c[i].name || ''; }");
  js.push("  return '';");
  js.push("}");
  js.push("function coalesceToolActivity(msgs){");
  js.push("  var out = []; var arr = msgs || [];");
  js.push("  for (var i = 0; i < arr.length; i++){");
  js.push("    var m = arr[i];");
  js.push("    if (isToolCallOnly(m) && i + 1 < arr.length && (arr[i+1].role === 'tool' || arr[i+1].role === 'toolResult')){");
  js.push("      var res = arr[i+1]; var callName = firstToolName(m); var callBlock = null;");
  js.push("      var c = m.content_json; try { c = JSON.parse(c); if (typeof c === 'string') c = JSON.parse(c); } catch(e){} ");
  js.push("      var thinkingBlock = null;");
  js.push("      if (Array.isArray(c)) c.forEach(function(b){ if (b && (b.type === 'toolCall' || b.type === 'tool_use')) callBlock = b; else if (b && b.type === 'thinking') thinkingBlock = b; });");
  js.push("      var resultText = ''; var rc = res.content_json; try { rc = JSON.parse(rc); if (typeof rc === 'string') rc = JSON.parse(rc); } catch(e){} ");
  js.push("      if (typeof rc === 'string') resultText = rc;");
  js.push("      else if (Array.isArray(rc)) rc.forEach(function(b){ if (typeof b === 'string') resultText += b + '\\n'; else if (b && b.type === 'text') resultText += (b.text || '') + '\\n'; });");
  js.push("      else if (rc) resultText = JSON.stringify(rc, null, 2);");
  js.push("      var blocks = []; if (thinkingBlock) blocks.push(thinkingBlock); if (callBlock) blocks.push(callBlock); if (resultText) blocks.push({ type:'text', text: resultText });");
  js.push("      out.push({ role:'tool', tool_name: res.tool_name || callName || 'tool', is_error: res.is_error, content_json: JSON.stringify(blocks), timestamp: m.timestamp, seq: m.seq });");
  js.push("      i++;");
  js.push("    } else { out.push(m); }");
  js.push("  }");
  js.push("  return out;");
  js.push("}");
  js.push("function groupActivity(msgs){");
  js.push("  var items = []; var cur = null;");
  js.push("  (msgs || []).forEach(function(m){");
  js.push("    if (isActivityMsg(m)){ if (!cur) cur = { type:'activity', msgs:[], startTs:m.timestamp }; cur.msgs.push(m); cur.endTs = m.timestamp; }");
  js.push("    else { if (cur){ items.push(cur); cur = null; } items.push({ type:'msg', m:m }); }");
  js.push("  });");
  js.push("  if (cur) items.push(cur);");
  js.push("  return items.map(function(it){ if (it.type === 'activity' && it.msgs.length === 1) return { type:'msg', m:it.msgs[0] }; return it; });");
  js.push("}");
  js.push("function renderActivityMsg(m){");
  js.push("  var role = m.role;");
  js.push("  if (role === 'tool' || role === 'toolResult'){");
  js.push("    var isErr = m.is_error === true || m.is_error === 1;");
  js.push("    var c = m.content_json; try { c = JSON.parse(c); } catch(e){}");
  js.push("    if (Array.isArray(c)){");
  js.push("      var out = '';");
  js.push("      c.forEach(function(b){");
  js.push("        if (b && b.type === 'thinking') out += '<details class=\"msg-collapse\" data-type=\"thinking\"><summary>💭 思考过程</summary><div class=\"thinking\">' + esc(b.thinking || '') + '</div></details>';");
  js.push("        else if (b && (b.type === 'toolCall' || b.type === 'tool_use')) out += '<div class=\"actool\"><details><summary>🔧 ' + esc(b.name || 'tool') + '</summary>' + toolCallCard(b) + '</details></div>';");
  js.push("        else if (typeof b === 'string') out += '<div class=\"actres\"><details><summary>📦 ' + (isErr ? '⚠ ' : '') + esc(m.tool_name || '工具结果') + '</summary><pre>' + esc(b.substring(0,4000)) + '</pre></details></div>';");
  js.push("        else if (b && b.type === 'text') out += '<div class=\"actres\"><details><summary>📦 ' + (isErr ? '⚠ ' : '') + esc(m.tool_name || '工具结果') + '</summary><pre>' + esc((b.text||'').substring(0,4000)) + '</pre></details></div>';");
  js.push("      });");
  js.push("      return out;");
  js.push("    }");
  js.push("    var text = (typeof c === 'string') ? c : (c ? JSON.stringify(c, null, 2) : '');");
  js.push("    return '<div class=\"actres' + (isErr ? ' err' : '') + '\"><details><summary>📦 ' + (isErr ? '⚠ ' : '') + esc(m.tool_name || '工具结果') + '</summary>' + (text ? '<pre>' + esc(text.substring(0, 4000)) + '</pre>' : '') + '</details></div>';");
  js.push("  }");
  js.push("  var c2 = m.content_json; try { c2 = JSON.parse(c2); if (typeof c2 === 'string') c2 = JSON.parse(c2); } catch(e){}");
  js.push("  if (!Array.isArray(c2)) return '';");
  js.push("  var out = '';");
  js.push("  c2.forEach(function(b){");
  js.push("    if (b && b.type === 'thinking'){ out += '<details class=\"msg-collapse\" data-type=\"thinking\"><summary>💭 思考过程</summary><div class=\"thinking\">' + esc(b.thinking || '') + '</div></details>'; }");
  js.push("    else if (b && (b.type === 'toolCall' || b.type === 'tool_use')){ out += '<div class=\"actool\"><details><summary>🔧 ' + esc(b.name || 'tool') + '</summary>' + toolCallCard(b) + '</details></div>'; }");
  js.push("  });");
  js.push("  return out;");
  js.push("}");
  js.push("function renderItem(item){");
  js.push("  if (item.type === 'msg') return renderMessage(item.m);");
  js.push("  var n = countTools(item.msgs);");
  js.push("  var head = '<summary class=\"ahead\"><span class=\"achev\">▸</span><span class=\"aico\">🔧</span><span class=\"atitle\">Activity</span><span class=\"acount\">' + n + ' 个工具</span></summary>';");
  js.push("  var body = '<div class=\"abody\">';");
  js.push("  item.msgs.forEach(function(m){ body += renderActivityMsg(m); });");
  js.push("  body += '</div>';");
  js.push("  var card = '<details class=\"activity\" data-type=\"tool\" data-act=\"' + esc(String(item.msgs[0].seq)) + '\">' + head + body + '</details>';");
  js.push("  var start = item.msgs[0].timestamp;");
  js.push("  var end = item.msgs[item.msgs.length-1].timestamp;");
  js.push("  var timeStr = fmtTime(start) + (start !== end ? ' – ' + fmtTime(end) : '');");
  js.push("  return '<article class=\"message user activity\" data-type=\"tool\" data-act=\"' + esc(String(item.msgs[0].seq)) + '\"><div class=\"mavatar\">⚙️</div><div class=\"mbody\"><div class=\"mmeta\"><strong>Activity</strong><span>' + timeStr + '</span></div>' + card + '</div></article>';");
  js.push("}");
  js.push("function renderMessage(msg){");
  js.push("  var role = msg.role || 'unknown';");
  js.push("  var isUser = (role === 'user'); var isTool = (role === 'toolResult' || role === 'tool');");
  js.push("  var cls = isUser ? 'bot' : 'user';");
  js.push("  var name, avatar;");
  js.push("  if (isUser) { name = (msg.sender) || (currentSession && (currentSession.sender_name || currentSession.label)) || '用户'; avatar = name.slice(-1); }");
  js.push("  else if (role === 'assistant') { name = agentLabel(currentSession && currentSession.agent_id); avatar = '🦞'; }");
  js.push("  else { name = 'Tool'; avatar = '🔧'; }");
  js.push("  var body = renderContent(msg);");
  js.push("  var dt = msgDataType(role, msg.content_json);");
  js.push("  var dataTypeAttr = dt ? ' data-type=\\\"' + dt + '\\\"' : '';");
  js.push("  if (isTool) { body = '<details class=\\\"msg-collapse\\\" data-type=\\\"tool\\\"><summary>\uD83D\uDD27 ' + esc(msg.tool_name || '\u5DE5\u5177\u8C03\u7528\u7ED3\u679C') + ' \u00B7 ' + fmtTime(msg.timestamp) + '</summary>' + body + '</details>'; }");
  js.push("  var html = '<article class=\\\"message ' + cls + '\\\"' + dataTypeAttr + '>' + '<div class=\\\"mavatar\\\">' + esc(avatar) + '</div>' + '<div class=\\\"mbody\\\">' + '<div class=\\\"mmeta\\\"><strong>' + esc(name) + '</strong><span>' + fmtTime(msg.timestamp) + '</span></div>' + body + '</div>' + '</article>';");
  js.push("  return html;");
  js.push("}");
  js.push("function renderMessages(msgs){");
  js.push("  var items = groupActivity(coalesceToolActivity(msgs || []));");
  js.push("  var html = '<div id=\"msgTop\"></div>';");
  js.push("  items.forEach(function(it){ html += renderItem(it); });");
  js.push("  html += '<div id=\"msgBottom\"></div>';");
  js.push("  return html;");
  js.push("}");
  js.push("async function jumpToTop(){ var box = $('messages'); if (!box) return; if (msgMode === 'asc') { box.scrollTop = 0; return; } msgMode = 'asc'; msgAllLoaded = false; newestSeq = null; currentMessages = []; topDate = null; bottomDate = null; msgOffset = 0; box.innerHTML = '<div class=\"loading\"><div class=\"spinner\"></div><br>加载最早消息…</div>'; await loadMoreMessages(); box.scrollTop = 0; }");
  js.push("function renderTable(rows){");
  js.push("  var tbody = $('rows');");
  js.push("  if (!rows.length) { tbody.innerHTML = ''; $('empty').style.display = 'block'; $('rows').closest('table').style.display = 'none'; return; }");
  js.push("  $('empty').style.display = 'none';");
  js.push("  $('rows').closest('table').style.display = 'table';");
  js.push("  var html = '';");
  js.push("  rows.forEach(function(s){");
  js.push("    html += '<tr>';");
  js.push("    html += '<td class=\"agent-cell\" title=\"' + esc(s.agent_id || '-') + '\">' + esc(s.agent_id || '-') + '</td>';");
  js.push("    var who = s.sender_name || s.label || '-'; var whoShort = (who && who.length > 16) ? who.slice(0, 16) + '…' : who;");
  js.push("    html += '<td class=\"name-cell\" title=\"' + esc(who) + '\">' + esc(whoShort) + '</td>';");
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
  js.push("  var params = new URLSearchParams();");
  js.push("  var name = $('name').value.trim();");
  js.push("  if (name) params.set('search', name);");
  js.push("  if (agentSel.length) params.set('agentId', agentSel.join(','));");
  js.push("  if (sourceSel.length) params.set('channel', sourceSel.join(','));");
  js.push("  var start = $('startDate').value;");
  js.push("  var end = $('endDate').value;");
  js.push("  if (start && end && start > end) { showToast('开始日期不能晚于结束日期'); btn.disabled = false; btn.textContent = '搜索'; return; }");
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
  js.push("    if (myToken === reqToken) { showToast('查询失败，请稍后重试'); }");
  js.push("  } finally {");
  js.push("    if (myToken === reqToken) { btn.disabled = false; btn.textContent = '搜索'; }");
  js.push("  }");
  js.push("}");
  js.push("function updatePager(){");
  js.push("  var totalPages = Math.max(1, Math.ceil(totalCount / pageSize));");
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
  js.push("    $('meta').innerHTML = '<div><span>Agent</span><strong>' + esc(agentLabel(currentSession.agent_id)) + '</strong></div>' + '<div><span>用户</span><strong>' + esc(currentSession.sender_name || currentSession.label || '-') + '</strong></div>' + '<div><span>来源</span><strong>' + esc(sourceLabel(currentSession.channel)) + '</strong></div>' + '<div><span>分类</span><strong>' + esc(catLabel(currentSession)) + '</strong></div><button type=\"button\" class=\"close meta-close\" id=\"closeBtn\" aria-label=\"关闭\">×</button>';");
  js.push("  }");
  js.push("  msgOffset = 0; msgAllLoaded = false; oldestSeq = null; newestSeq = null; msgMode = 'desc'; msgHighlight = null; currentMessages = []; topDate = null; bottomDate = null;");
  js.push("  var ds = $('dStart'), de = $('dEnd'); if (ds) ds.value = ''; if (de) de.value = ''; updateDateClearButtons(); updateSearchClearButton();");
  js.push("  $('messages').innerHTML = '';");
  js.push("  await loadMoreMessages();");
  js.push("  updateVisibility();");
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
  js.push("  if (msgs.length === 0 && msgOffset === 0) { box.innerHTML = '<div class=\"loading\">该会话暂无消息</div>'; msgAllLoaded = true; msgLoading = false; return; }");
  js.push("    if (msgs.length < 30) { msgAllLoaded = true; }");
  js.push("    var more = $('msgMore'); if (more) more.remove();");
  js.push("    var prevH = box.scrollHeight;");
  js.push("    var prevTop = box.scrollTop;");
  js.push("    var atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 2;");
  js.push("    var openActs = [];");
  js.push("    box.querySelectorAll('.activity[open]').forEach(function(el){ var a = el.getAttribute('data-act'); if (a) openActs.push(a); });");
  js.push("    if (msgMode === 'asc') {");
  js.push("      if (msgOffset === 0) currentMessages = msgs; else currentMessages = currentMessages.concat(msgs);");
  js.push("      if (msgs.length && (newestSeq == null || msgs[msgs.length-1].seq > newestSeq)) newestSeq = msgs[msgs.length-1].seq;");
  js.push("    } else {");
  js.push("      if (msgOffset === 0) currentMessages = msgs; else currentMessages = msgs.concat(currentMessages);");
  js.push("      if (msgs.length && (oldestSeq == null || msgs[0].seq < oldestSeq)) oldestSeq = msgs[0].seq;");
  js.push("    }");
  js.push("    box.innerHTML = '<div id=\"msgTop\"></div>' + renderMessages(currentMessages) + '<div id=\"msgBottom\"></div>';");
  js.push("    openActs.forEach(function(a){ var el = box.querySelector('.activity[data-act=\"' + a + '\"]'); if (el) el.setAttribute('open',''); });");
  js.push("    if (msgMode === 'asc') { if (msgOffset === 0 || atBottom) box.scrollTop = box.scrollHeight; else box.scrollTop = prevTop; }");
  js.push("    else { if (msgOffset === 0) box.scrollTop = box.scrollHeight - box.clientHeight; else box.scrollTop = prevTop + (box.scrollHeight - prevH); }");
  js.push("    msgOffset += msgs.length;");
  js.push("  } catch (e) {");
  js.push("    var more = $('msgMore'); if (more) more.remove();");
  js.push("    if (msgOffset === 0) { box.innerHTML = '<div class=\"loading\" id=\"msgErr\">加载失败：' + esc(e.message) + '<br><button class=\"detail\" id=\"retryBtn\">重试</button></div>'; var rb = $('retryBtn'); if (rb) rb.addEventListener('click', function(){ openDrawer(selectedKey); }); }");
  js.push("  } finally {");
  js.push("    msgLoading = false;");
  js.push("  }");
  js.push("  updateVisibility();");
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
  js.push("    var body = plainText(m);");
  js.push("    if (!body || !body.trim()) return;");
  js.push("    var who = m.role === 'user' ? (m.sender || (currentSession ? (currentSession.sender_name || currentSession.label || '用户') : '用户')) : (m.role === 'assistant' ? agentLabel(currentSession && currentSession.agent_id) : (m.tool_name || '工具'));");
  js.push("    lines.push(who + ' ' + fmtTime(m.timestamp) + '\\n' + body);");
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
  js.push("  var b = $('fabCopyFab'); if (b) b.disabled = true;");
  js.push("  var qs = '?key=' + encodeURIComponent(selectedKey) + '&tools=' + (showTools ? '1' : '0') + '&thinking=' + (showThinking ? '1' : '0');");
  js.push("  try {");
  js.push("    var res = await fetch(API + '/export' + qs);");
  js.push("    if (!res.ok) throw new Error('HTTP ' + res.status);");
  js.push("    var text = (await res.text()).replace(/^\\uFEFF/, '');");
  js.push("    var bytes = text.length;");
  js.push("    var copied = false;");
  js.push("    if (navigator.clipboard && navigator.clipboard.writeText) {");
  js.push("      try { await Promise.race([navigator.clipboard.writeText(text), new Promise(function(_, rej){ setTimeout(function(){ rej(new Error('clipboard timeout')); }, 800); })]); copied = true; } catch (_) {}");
  js.push("    }");
  js.push("    if (!copied) { fallbackCopy(text); copied = true; }");
  js.push("    var note = '';");
  js.push("    if (!showTools && !showThinking) note = '（已隐藏工具与思考）';");
  js.push("    else if (!showTools) note = '（已隐藏工具）';");
  js.push("    else if (!showThinking) note = '（已隐藏思考）';");
  js.push("    showToast('已复制 ' + bytes + ' 字' + note, 1800);");
  js.push("  } catch (e) {");
  js.push("    showToast('导出失败：' + e.message, 2000);");
  js.push("  } finally {");
  js.push("    if (b) b.disabled = false;");
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
  js.push("  var count = $('searchCount');");
  js.push("  var box = $('messages');");
  js.push("  if (!q) {");
  js.push("    isSearchActive = false; msgHighlight = null; count.textContent = ''; currentMatchIdx = -1;");
  js.push("    msgOffset = 0; msgAllLoaded = false; oldestSeq = null;");
  js.push("    updateSearchClearButton();");
  js.push("    loadMoreMessages().then(function(){ box.scrollTop = box.scrollHeight - box.clientHeight; updateVisibility(); });");
  js.push("    return;");
  js.push("  }");
  js.push("  msgHighlight = q; msgAllLoaded = true; isSearchActive = true;");
  js.push("  count.textContent = '搜索中…';");
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
  js.push("    if (msgsArr.length === 0) { box.innerHTML = '<div class=\\\"loading\\\">未找到匹配的消息</div>'; }");
  js.push("    else { box.innerHTML = renderMessages(msgsArr); highlightMatches(box, q); box.querySelectorAll('details').forEach(function(d){ d.setAttribute('open',''); }); }");
  js.push("    box.scrollTop = 0;");
  js.push("    count.textContent = msgsArr.length + ' 条匹配';");
  js.push("    updateSearchClearButton();");
  js.push("  } catch (e) { box.innerHTML = '<div class=\\\"loading\\\">搜索失败：' + esc(e.message) + '</div>'; count.textContent = ''; }");
  js.push("  updateVisibility();");
  js.push("}");
  js.push("function updateDateClearButtons(){");
  js.push("  var ds = document.getElementById('dStart'), de = document.getElementById('dEnd');");
  js.push("  var dsc = document.getElementById('dStartClear'), dec = document.getElementById('dEndClear');");
  js.push("  if (dsc) { dsc.style.display = (ds && ds.value) ? 'inline-flex' : 'none'; var w1 = dsc.parentElement; if (w1) w1.classList.toggle('has-value', !!(ds && ds.value)); }");
  js.push("  if (dec) { dec.style.display = (de && de.value) ? 'inline-flex' : 'none'; var w2 = dec.parentElement; if (w2) w2.classList.toggle('has-value', !!(de && de.value)); }");
  js.push("}");
  js.push("function updateSearchClearButton(){");
  js.push("  var el = document.getElementById('msgSearch');");
  js.push("  var b = document.getElementById('searchInputClear');");
  js.push("  if (b) b.style.display = (el && el.value) ? 'inline-flex' : 'none';");
  js.push("}");
  js.push("function applyDateFilter(){")
  js.push("  var sd = $('dStart').value, ed = $('dEnd').value;");
  js.push("  if (sd && ed && sd > ed) { showToast('开始日期不能晚于结束日期'); return; }");
  js.push("  updateDateClearButtons();");
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
  js.push("  $('layer').addEventListener('click', function(e){ if (e.target.closest('#closeBtn')) closeDrawer(); });");
  js.push("  $('backdrop').addEventListener('click', closeDrawer);");
  js.push("  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeDrawer(); });");

  js.push("  var fabCopyFab = document.getElementById('fabCopyFab'); if (fabCopyFab) fabCopyFab.addEventListener('click', exportConv);");
  js.push("  var jt = document.getElementById('jumpTopFab'); if (jt) jt.addEventListener('click', jumpToTop);");
  js.push("  var ft = document.getElementById('fabToggle'); if (ft) ft.addEventListener('click', function(){ var g = $('fabGroup'); var open = g.classList.toggle('open'); this.setAttribute('aria-expanded', String(open)); this.setAttribute('aria-label', open ? '收起快捷操作' : '展开快捷操作'); });");
  js.push("  var ds = document.getElementById('dStart'); if (ds) ds.addEventListener('change', applyDateFilter);");
  js.push("  var de = document.getElementById('dEnd'); if (de) de.addEventListener('change', applyDateFilter);");
  js.push("  var dsc = document.getElementById('dStartClear'); if (dsc) dsc.addEventListener('click', function(){ var a = document.getElementById('dStart'); if (a) a.value = ''; applyDateFilter(); });");
  js.push("  var dec = document.getElementById('dEndClear'); if (dec) dec.addEventListener('click', function(){ var b = document.getElementById('dEnd'); if (b) b.value = ''; applyDateFilter(); });");
  js.push("  var sinclr = document.getElementById('searchInputClear'); if (sinclr) sinclr.addEventListener('click', function(){ $('msgSearch').value = ''; doMsgSearch(); });")
  js.push("  var bt = document.getElementById('btnThinking'); if (bt) bt.addEventListener('click', function(){ showThinking = !showThinking; updateVisibility(); });");
  js.push("  var btf = document.getElementById('btnThinkingFab'); if (btf) btf.addEventListener('click', function(){ showThinking = !showThinking; updateVisibility(); });");
  js.push("  var bf = document.getElementById('btnTools'); if (bf) bf.addEventListener('click', function(){ showTools = !showTools; updateVisibility(); });");
  js.push("  var bff = document.getElementById('btnToolsFab'); if (bff) bff.addEventListener('click', function(){ showTools = !showTools; updateVisibility(); });");
  js.push("  updateAgentText();");
  js.push("  updateSourceText();");
  js.push("  loadAgents();");
  js.push("  loadSources();");
  js.push("  loadSessions();");
  js.push("  $('msgSearch').addEventListener('input', function(){ clearTimeout(this._timer); this._timer = setTimeout(doMsgSearch, 300); updateSearchClearButton(); });");
  js.push("  $('msgSearch').addEventListener('keydown', function(e){ if (e.key === 'Enter') { clearTimeout(this._timer); doMsgSearch(); } });");
  js.push("});");
  // Reveal the real UI only after the script has run (i.e. the document is
  // not in a strict sandbox without allow-scripts). In a strict sandbox this
  // line never executes and the <noscript> guide stays visible instead.
  js.push("var _app=document.getElementById('app'); if(_app){_app.style.display='flex';}");
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
  lines.push("<noscript><div class='noscript-guide'><div class='noscript-guide-inner'><h2><span class='dot'></span>温馨提示</h2><input type='radio' name='sa-lang' id='sa-zh' checked><label class='lang-tab' for='sa-zh'>中文</label><input type='radio' name='sa-lang' id='sa-en'><label class='lang-tab' for='sa-en'>English</label><div class='lang-block lang-zh'><p>本插件受 openclaw 沙箱安全策略限制，每次刷新时页面脚本可能未能正常执行，导致功能暂时不可用。请点击左侧任意菜单（如「概览」「活动」），再回到本页即可恢复正常。</p></div><div class='lang-block lang-en'><p>This plugin is restricted by openclaw's sandbox security policy. Each refresh may fail to run the page scripts, leaving the page temporarily unusable. Please click any left-side menu (e.g. \"Overview\" / \"Activity\"), then return to this page to restore normal function.</p></div></div></div></noscript>");
  lines.push("<main class=\"app\" id=\"app\">");
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
  lines.push("  <section class=\"card list-card\">");
  lines.push("    <div class=\"tablebox\">");
  lines.push("      <table>");
  lines.push("        <thead><tr><th>Agent 名称</th><th>姓名</th><th>会话标题</th><th>对话时间</th><th>对话分类</th><th>数据来源</th><th>操作</th></tr></thead>");
  lines.push("        <tbody id=\"rows\">" + rowsHtml + "</tbody>");
  lines.push("      </table>");
  lines.push("      <div class=\"empty\" id=\"empty\">⌕<br><b>暂无匹配记录</b><br><small>请调整筛选条件后重新搜索</small></div>");
    lines.push("    </div>");
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
  lines.push("<div class=\"toast\" id=\"toast\"></div>");
  lines.push("<div class=\"layer\" id=\"layer\">");
  lines.push("  <div class=\"backdrop\" id=\"backdrop\"></div>");
  lines.push("  <aside class=\"drawer\">");
  lines.push("    <div class=\"meta\" id=\"meta\"></div>");
  lines.push("    <div class=\"drawer-controls\">");
  lines.push("      <div class=\"drawer-dates\"><div class=\"range\"><div class=\"date-wrap\"><input id=\"dStart\" class=\"control\" type=\"date\" aria-label=\"开始日期\"><button type=\"button\" class=\"date-inside-clear\" id=\"dStartClear\" aria-label=\"清除开始日期\" style=\"display:none\">×</button></div><span>至</span><div class=\"date-wrap\"><input id=\"dEnd\" class=\"control\" type=\"date\" aria-label=\"结束日期\"><button type=\"button\" class=\"date-inside-clear\" id=\"dEndClear\" aria-label=\"清除结束日期\" style=\"display:none\">×</button></div></div></div>");
  lines.push("      <div class=\"msg-search\"><div class=\"search-wrap\"><input type=\"search\" id=\"msgSearch\" placeholder=\"搜索消息关键字…\"><button type=\"button\" class=\"search-inside-clear\" id=\"searchInputClear\" aria-label=\"清除搜索\" style=\"display:none\">×</button></div><span class=\"search-count\" id=\"searchCount\"></span></div>");
  lines.push("    </div>");
  lines.push("    <div class=\"fab-group\" id=\"fabGroup\" aria-label=\"快捷操作\">");
  lines.push("      <button type=\"button\" class=\"fab-item fab-tool below\" id=\"btnThinkingFab\" aria-pressed=\"false\" data-tip=\"思考\" style=\"order:4\">🧠</button>");
  lines.push("      <button type=\"button\" class=\"fab-item fab-tool above\" id=\"btnToolsFab\" aria-pressed=\"false\" data-tip=\"工具\" style=\"order:2\">🔧</button>");
  lines.push("      <button type=\"button\" class=\"fab-item above\" id=\"jumpTopFab\" aria-label=\"到最早的消息\" data-tip=\"顶部\" style=\"order:1\">▲</button>");
  lines.push("      <button type=\"button\" class=\"fab-item below\" id=\"fabCopyFab\" aria-label=\"复制全文到剪贴板\" data-tip=\"复制全文\" style=\"order:5\">↗</button>");
  lines.push("      <button type=\"button\" class=\"fab-item fab-toggle\" id=\"fabToggle\" aria-label=\"展开快捷操作\" aria-expanded=\"false\" style=\"order:3\">⋮</button>");
  lines.push("    </div>");
  lines.push("    <div class=\"messages\" id=\"messages\"></div>");
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
function fmtTimeShort(ts) { return fmtTs(ts); }
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
function messageDataTypeTs(role: string, content_json: any) {
  if (role === "tool" || role === "toolResult") return "tool";
  if (role !== "assistant") return "";
  if (content_json == null || content_json === "") return "";
  let c;
  try { c = JSON.parse(content_json); if (typeof c === "string") c = JSON.parse(c); } catch { return ""; }
  if (!Array.isArray(c)) return "";
  const visible = c.filter(function (b: any) {
    if (typeof b === "string" && b.trim()) return true;
    if (b && b.type === "text" && (b.text || "").trim()) return true;
    if (b && (b.type === "toolCall" || b.type === "tool_use" || b.type === "thinking")) return true;
    return false;
  });
  if (visible.length === 0) return "";
  if (visible.every((b: any) => b.type === "toolCall" || b.type === "tool_use")) return "tool";
  if (visible.every((b: any) => b.type === "thinking")) return "thinking";
  return "";
}
function isEmptyWhenHiddenTs(role: string, content_json: any) {
  if (role === "tool" || role === "toolResult") return true;
  if (role !== "assistant") return false;
  if (content_json == null || content_json === "") return false;
  let c;
  try { c = JSON.parse(content_json); if (typeof c === "string") c = JSON.parse(c); } catch { return false; }
  if (typeof c === "string") return false;
  if (!Array.isArray(c)) return false;
  return !c.some(function (b: any) {
    if (typeof b === "string" && b.trim()) return true;
    if (b && b.type === "text" && (b.text || "").trim()) return true;
    if (b && (b.type === "image" || b.type === "image_url")) return true;
    return false;
  });
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
      if (b.type === "thinking") return '<details class="msg-collapse" data-type="thinking"><summary>💭 思考过程</summary><div class="thinking">' + escHtml(b.thinking || "") + "</div></details>";
      if (b.type === "toolCall" || b.type === "tool_use") return '<details class="msg-collapse" data-type="tool"><summary>🔧 调用工具：' + escHtml(b.name || "tool") + "</summary>" + toolCallCardTs(b) + "</details>";
      if (b.type === "image" || b.type === "image_url") { const src = (b.image_url && b.image_url.url) ? b.image_url.url : (b.image_url || b.source || ""); return src ? '<img src="' + escHtml(src) + '" style="max-width:100%;border-radius:10px;margin:4px 0">' : ""; }
      return '<div class="toolcard"><pre>' + escHtml(JSON.stringify(b, null, 2)) + "</pre></div>";
    }).join("");
  }
  if (msg.role === "tool" || msg.role === "toolResult") return toolResultCardTs(msg, c);
  return '<div class="toolcard"><pre>' + escHtml(JSON.stringify(c, null, 2)) + "</pre></div>";
}
function parseCjTs(cj) {
  if (cj == null || cj === "") return null;
  try { let c = JSON.parse(cj); if (typeof c === "string") c = JSON.parse(c); return c; } catch (e) { return null; }
}
function isActivityMsgTs(m) {
  const role = m.role;
  if (role === "tool" || role === "toolResult") return true;
  if (role === "assistant") {
    const c = parseCjTs(m.content_json);
    if (!Array.isArray(c)) return false;
    const hasText = c.some(function (b) { return (b && b.type === "text" && (b.text || "").trim()) || (typeof b === "string" && b.trim()); });
    if (hasText) return false;
    return c.some(function (b) { return b && (b.type === "toolCall" || b.type === "tool_use"); });
  }
  return false;
}
function countToolsTs(msgs) {
  let calls = 0, res = 0;
  (msgs || []).forEach(function (m) {
    if (m.role === "tool" || m.role === "toolResult") { res++; return; }
    if (m.role === "assistant") { const c = parseCjTs(m.content_json); if (Array.isArray(c)) c.forEach(function (b) { if (b && (b.type === "toolCall" || b.type === "tool_use")) calls++; }); }
  });
  return calls || res;
}
function isToolCallOnlyTs(m: any) {
  if (m.role !== "assistant") return false;
  const c = parseCjTs(m.content_json);
  if (!Array.isArray(c)) return false;
  const hasText = c.some(function (b) { return (b && b.type === "text" && (b.text || "").trim()) || (typeof b === "string" && b.trim()); });
  if (hasText) return false;
  return c.some(function (b) { return b && (b.type === "toolCall" || b.type === "tool_use"); });
}
function firstToolNameTs(m: any) {
  const c = parseCjTs(m.content_json);
  if (!Array.isArray(c)) return "";
  for (let i = 0; i < c.length; i++) { if (c[i] && (c[i].type === "toolCall" || c[i].type === "tool_use")) return c[i].name || ""; }
  return "";
}
function coalesceToolActivityTs(msgs: any[]) {
  const out: any[] = [];
  const arr = msgs || [];
  for (let i = 0; i < arr.length; i++) {
    const m = arr[i];
    if (isToolCallOnlyTs(m) && i + 1 < arr.length && (arr[i + 1].role === "tool" || arr[i + 1].role === "toolResult")) {
      const res = arr[i + 1];
      const callName = firstToolNameTs(m);
      let callBlock: any = null;
      let thinkingBlock: any = null;
      const c = parseCjTs(m.content_json);
      if (Array.isArray(c)) c.forEach(function (b) { if (b && (b.type === "toolCall" || b.type === "tool_use")) callBlock = b; else if (b && b.type === "thinking") thinkingBlock = b; });
      let resultText = "";
      let rc: any = res.content_json;
      try { rc = JSON.parse(rc); if (typeof rc === "string") rc = JSON.parse(rc); } catch (e) {}
      if (typeof rc === "string") resultText = rc;
      else if (Array.isArray(rc)) rc.forEach(function (b) { if (typeof b === "string") resultText += b + "\n"; else if (b && b.type === "text") resultText += (b.text || "") + "\n"; });
      else if (rc) resultText = JSON.stringify(rc, null, 2);
      const blocks: any[] = [];
      if (thinkingBlock) blocks.push(thinkingBlock);
      if (callBlock) blocks.push(callBlock);
      if (resultText) blocks.push({ type: "text", text: resultText });
      out.push({ role: "tool", tool_name: res.tool_name || callName || "tool", is_error: res.is_error, content_json: JSON.stringify(blocks), timestamp: m.timestamp, seq: m.seq });
      i++;
    } else {
      out.push(m);
    }
  }
  return out;
}
function groupActivityTs(msgs) {
  const items = [];
  let cur = null;
  (msgs || []).forEach(function (m) {
    if (isActivityMsgTs(m)) { if (!cur) cur = { type: "activity", msgs: [], startTs: m.timestamp }; cur.msgs.push(m); cur.endTs = m.timestamp; }
    else { if (cur) { items.push(cur); cur = null; } items.push({ type: "msg", m: m }); }
  });
  if (cur) items.push(cur);
  return items.map(function (it) { if (it.type === "activity" && it.msgs.length === 1) return { type: "msg", m: it.msgs[0] }; return it; });
}
function renderActivityMsgTs(m) {
  const role = m.role;
  if (role === "tool" || role === "toolResult") {
    const isErr = m.is_error === true || m.is_error === 1;
    const c = parseCjTs(m.content_json);
    if (Array.isArray(c)) {
      let out = "";
      c.forEach(function (b) {
        if (b && b.type === "thinking") out += '<details class="msg-collapse" data-type="thinking"><summary>💭 思考过程</summary><div class="thinking">' + escHtml(b.thinking || "") + '</div></details>';
        else if (b && (b.type === "toolCall" || b.type === "tool_use")) out += '<div class="actool"><details><summary>🔧 ' + escHtml(b.name || "tool") + '</summary>' + toolCallCardTs(b) + '</details></div>';
        else if (typeof b === "string") out += '<div class="actres"><details><summary>📦 ' + (isErr ? "⚠ " : "") + escHtml(m.tool_name || "工具结果") + '</summary><pre>' + escHtml(b.substring(0, 4000)) + '</pre></details></div>';
        else if (b && b.type === "text") out += '<div class="actres"><details><summary>📦 ' + (isErr ? "⚠ " : "") + escHtml(m.tool_name || "工具结果") + '</summary><pre>' + escHtml((b.text || "").substring(0, 4000)) + '</pre></details></div>';
      });
      return out;
    }
    let text = (typeof c === "string") ? c : (c ? JSON.stringify(c, null, 2) : "");
    return '<div class="actres' + (isErr ? " err" : "") + '"><details><summary>📦 ' + (isErr ? "⚠ " : "") + escHtml(m.tool_name || "工具结果") + '</summary>' + (text ? '<pre>' + escHtml(text.substring(0, 4000)) + '</pre>' : "") + '</details></div>';
  }
  const c2 = parseCjTs(m.content_json);
  if (!Array.isArray(c2)) return "";
  let out = "";
  c2.forEach(function (b) {
    if (b && b.type === "thinking") out += '<details class="msg-collapse" data-type="thinking"><summary>💭 思考过程</summary><div class="thinking">' + escHtml(b.thinking || "") + '</div></details>';
    else if (b && (b.type === "toolCall" || b.type === "tool_use")) out += '<div class="actool"><details><summary>🔧 ' + escHtml(b.name || "tool") + '</summary>' + toolCallCardTs(b) + '</details></div>';
  });
  return out;
}
function renderItemTs(item) {
  if (item.type === "msg") return renderMessageHtml(item.m);
  const n = countToolsTs(item.msgs);
  const head = '<summary class="ahead"><span class="achev">▸</span><span class="aico">🔧</span><span class="atitle">Activity</span><span class="acount">' + n + ' 个工具</span></summary>';
  let body = '<div class="abody">';
  item.msgs.forEach(function (m) { body += renderActivityMsgTs(m); });
  body += '</div>';
  const card = '<details class="activity" data-type="tool" data-act="' + escHtml(String(item.msgs[0].seq)) + '">' + head + body + '</details>';
  const start = item.msgs[0].timestamp;
  const end = item.msgs[item.msgs.length - 1].timestamp;
  const timeStr = fmtTimeShort(start) + (start !== end ? " – " + fmtTimeShort(end) : "");
  return '<article class="message user activity" data-type="tool" data-act="' + escHtml(String(item.msgs[0].seq)) + '"><div class="mavatar">⚙️</div><div class="mbody"><div class="mmeta"><strong>Activity</strong><span>' + timeStr + '</span></div>' + card + '</div></article>';
}
function renderMessageHtml(m) {
  const role = m.role || "unknown";
  const isUser = role === "user";
  const isTool = role === "tool" || role === "toolResult";
  const cls = isUser ? "user" : (isTool ? "user" : "bot");
  let name = "", avatar = "";
  if (isUser) { name = m.sender || m.sender_name || m.label || "用户"; avatar = String(name).slice(-1); }
  else if (role === "assistant") { name = agentLabelTs(m.agent_id); avatar = "🦞"; }
  else { name = "Tool"; avatar = "🔧"; }
  const dt = messageDataTypeTs(role, m.content_json);
  const dataTypeAttr = dt ? ' data-type="' + dt + '"' : '';
  const emptyCls = isEmptyWhenHiddenTs(role, m.content_json) ? ' filtered-empty' : '';
  let body = renderContentHtml(m.content_json, m);
  if (isTool) body = '<details class="msg-collapse" data-type="tool"><summary>🔧 ' + escHtml(m.tool_name || "工具调用结果") + " · " + fmtTimeShort(m.timestamp) + "</summary>" + body + "</details>";
  return '<article class="message ' + cls + emptyCls + '"' + dataTypeAttr + '><div class="mavatar">' + escHtml(avatar) + '</div><div class="mbody"><div class="mmeta"><strong>' + escHtml(name) + "</strong><span>" + fmtTimeShort(m.timestamp) + "</span></div>" + body + "</div></article>";
}
function renderMessagesHtml(msgs) {
  const items = groupActivityTs(coalesceToolActivityTs(msgs));
  let html = '<div id="msgTop"></div>';
  items.forEach(function (it) { html += renderItemTs(it); });
  html += '<div id="msgBottom"></div>';
  return html;
}
function rowHtml(s, _state) {
  const key = encodeURIComponent(s.session_key);
  const who = s.sender_name || s.label || "-";
  const whoShort = (who && who.length > 16) ? who.slice(0, 16) + "…" : who;
  return "<tr>" +
    '<td class="agent-cell" title="' + escHtml(s.agent_id || "-") + '">' + escHtml(s.agent_id || "-") + "</td>" +
    '<td class="name-cell" title="' + escHtml(who) + '">' + escHtml(whoShort) + "</td>" +
    '<td class="title-cell" title="' + escHtml(s.display_name || "-") + '">' + escHtml(s.display_name || "-") + "</td>" +
    '<td class="time">' + fmtTs(s.updated_at).split(" ")[0] + "<small>" + fmtTs(s.updated_at).split(" ")[1] + "</small></td>" +
    '<td><span class="badge ' + (catLabelTs(s) === "群聊" ? "group" : "single") + '">' + catLabelTs(s) + "</span></td>" +
    '<td><span class="source">' + escHtml(sourceLabelTs(s.channel)) + "</span></td>" +
    '<td><a class="detail" href="?session=' + key + '">对话详情 ›</a></td>' +
    "</tr>";
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
  L.push("<noscript><div class='noscript-guide'><div class='noscript-guide-inner'><h2><span class='dot'></span>温馨提示</h2><input type='radio' name='sa-lang' id='sa-zh' checked><label class='lang-tab' for='sa-zh'>中文</label><input type='radio' name='sa-lang' id='sa-en'><label class='lang-tab' for='sa-en'>English</label><div class='lang-block lang-zh'><p>本插件受 openclaw 沙箱安全策略限制，每次刷新时页面脚本可能未能正常执行，导致功能暂时不可用。请点击左侧任意菜单（如「概览」「活动」），再回到本页即可恢复正常。</p></div><div class='lang-block lang-en'><p>This plugin is restricted by openclaw's sandbox security policy. Each refresh may fail to run the page scripts, leaving the page temporarily unusable. Please click any left-side menu (e.g. \"Overview\" / \"Activity\"), then return to this page to restore normal function.</p></div></div></div></noscript>");
  L.push("<main class=\"app\" id=\"app\">");
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
  L.push("  <section class=\"card\"><div class=\"tablebox\"><div class=\"messages hide-tools\" style=\"max-height:none;padding:18px 20px\">");
  if (!msgs.length) L.push("<div class=\"loading\">该会话暂无消息</div>");
  else L.push(renderMessagesHtml(msgs));
  L.push("  </div></div></section>");
  L.push("  <div class=\"jump-nav\" aria-label=\"消息跳转\">");
  L.push("    <a class=\"jump-btn\" href=\"#msgTop\" aria-label=\"到最早的消息\">▲ 顶部</a>");
  L.push("  </div>");
  L.push("</main>");
  L.push("<script>var _app=document.getElementById('app'); if(_app){_app.style.display='flex';}</script>");
  L.push("</body>");
  L.push("</html>");
  return L.join("\n");
}
function plainTextTs(m, opts) {
  const includeTools = !opts || opts.tools !== false;
  const includeThinking = !opts || opts.thinking !== false;
  const cj = m.content_json;
  if (cj == null || cj === "") return "";
  let c;
  try { c = JSON.parse(cj); } catch { return String(cj); }
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    let out = "";
    c.forEach(function (b) {
      if (typeof b === "string") out += b + "\n";
      else if (b && b.type === "thinking") { if (includeThinking) out += "[思考] " + (b.thinking || "") + "\n"; }
      else if (b.type === "text") out += (b.text || "") + "\n";
      else if (b.type === "toolCall" || b.type === "tool_use") { if (includeTools) out += "[调用工具 " + (b.name || "") + "]\n"; }
    });
    return out;
  }
  if (m.role === "tool" || m.role === "toolResult") {
    if (typeof c === "string") return c;
    if (Array.isArray(c)) { let t = ""; c.forEach(function (b) { if (includeTools) t += (typeof b === "string" ? b : (b && b.text ? b.text : "")) + "\n"; }); return t; }
    return JSON.stringify(c, null, 2);
  }
  return JSON.stringify(c, null, 2);
}
export function buildExportText(session, messages, byteBudget, opts) {
  const includeTools = !opts || opts.tools !== false;
  const includeThinking = !opts || opts.thinking !== false;
  const lines = [];
  lines.push("会话：" + (session.display_name || session.sender_name || session.session_id || ""));
  lines.push("Agent：" + (session.agent_id || ""));
  lines.push("来源：" + sourceLabelTs(session.channel) + "  分类：" + catLabelTs(session));
  lines.push("");
  messages.forEach(function (m) {
    if (!includeTools && (m.role === "tool" || m.role === "toolResult")) return;
    const body = plainTextTs(m, { tools: includeTools, thinking: includeThinking });
    if (!body || !body.trim()) return; // 跳过无可见内容的消息（如隐藏工具后仅含工具调用的助手消息），避免输出“有头无内容”的空行
    const who = m.role === "user" ? (m.sender || session.sender_name || session.label || "用户") : (m.role === "assistant" ? (session.agent_id || "Assistant") : (m.tool_name || "工具"));
    lines.push(who + " " + fmtTimeShort(m.timestamp));
    lines.push(body);
    lines.push("");
  });
  let text = lines.join("\n");
  let truncated = false;
  if (byteBudget && byteBudget > 0) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    if (bytes.length > byteBudget) {
      let cut = byteBudget;
      while (cut > 0 && bytes[cut] >> 6 === 2) cut--;
      text = new TextDecoder().decode(bytes.slice(0, cut)) + "\n\n[导出内容过长，已截断]";
      truncated = true;
    }
  }
  return { text, truncated };
}

export function renderListPage(state) { return buildListHtml(state); }
export function renderDetailPage(state) { return buildDetailHtml(state); }
