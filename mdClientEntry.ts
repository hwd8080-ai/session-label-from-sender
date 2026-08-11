// Browser IIFE entry: bundle markdown-it and expose a configured instance on
// globalThis.MD so the client-side message renderer (buildJs's md()) can call
// window.MD.render(). Built by build.mjs into dist/md-client.js + md-client.js.
import markdownit from "markdown-it";

const md = markdownit({
  html: false, // escape raw HTML in source -> safe against XSS from chat content
  linkify: true, // auto-link bare URLs
  breaks: true, // single newlines -> <br>, matches chat expectations
  typographer: false,
});

(globalThis as unknown as { MD: typeof md }).MD = md;
