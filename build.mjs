// Build: bundle the plugin into a single self-contained index.mjs via esbuild.
//
// Why bundling instead of the old per-file TS-stripper:
//  - The previous regex-based stripper was fragile (e.g. it turned `a?: T`
//    into invalid `a?` and emitted `.js` import extensions while the emitted
//    files were `.mjs`, producing a broken artifact).
//  - A single bundled ESM file is what the plugin loader actually loads
//    (package.json -> openclaw.extensions: ["./dist/index.mjs"]); sibling
//    files are not required once bundled.
//
// Requires esbuild. Install it once in your workspace, e.g.:
//   npm install esbuild
// then run:
//   node build.mjs

import fs from "node:fs";
import path from "node:path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Resolve esbuild: prefer a normal resolution, fall back to the managed
// WorkBuddy node workspace so this works out of the box in this environment.
let build;
try {
  ({ build } = await import("esbuild"));
} catch {
  const ws = path.resolve(
    process.env.HOME,
    ".workbuddy/binaries/node/workspace/node_modules/esbuild",
  );
  ({ build } = await import(ws + "/lib/main.js"));
}

const shared = {
  entryPoints: [path.join(__dirname, "index.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  // Keep host/runtime imports external; only our own .ts modules are inlined.
  external: ["node:*", "openclaw", "openclaw/*"],
  // Resolve npm deps (e.g. markdown-it) from the managed node workspace.
  nodePaths: [path.resolve(process.env.HOME, ".workbuddy/binaries/node/workspace/node_modules")],
  logLevel: "warning",
};

// 1) Self-contained entry actually loaded by openclaw (openclaw.extensions).
await build({
  ...shared,
  outfile: path.join(__dirname, "index.mjs"),
});

// 2) Remove now-orphaned sibling build outputs (db.mjs/sync.mjs/ui.mjs) that
//    the old multi-file build left behind; they are no longer imported.
for (const orphan of ["db.mjs", "sync.mjs", "ui.mjs"]) {
  const p = path.join(__dirname, orphan);
  if (fs.existsSync(p)) fs.rmSync(p);
}

// 3) Regenerate dist/ as a self-contained bundle for parity with the repo
//    build layout (so `dist/index.mjs` is never a stale broken artifact).
const distDir = path.join(__dirname, "dist");
fs.mkdirSync(distDir, { recursive: true });
await build({
  ...shared,
  outfile: path.join(distDir, "index.mjs"),
});
// Drop stale multi-file leftovers in dist/.
for (const orphan of ["db.mjs", "sync.mjs", "ui.mjs", "index.mjs"]) {
  const p = path.join(distDir, orphan);
  if (orphan === "index.mjs") continue; // keep the fresh dist/index.mjs
  if (fs.existsSync(p)) fs.rmSync(p);
}

// 4) Browser IIFE bundle of markdown-it, exposed as globalThis.MD, used by the
//    client-side drawer renderer (buildJs's md()). Inlined into the page by
//    ui.ts so the browser has a real markdown engine without a separate request.
const mdClient = path.join(distDir, "md-client.js");
await build({
  entryPoints: [path.join(__dirname, "mdClientEntry.ts")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  nodePaths: shared.nodePaths,
  logLevel: "warning",
  outfile: mdClient,
});
fs.copyFileSync(mdClient, path.join(__dirname, "md-client.js"));

console.log("Built self-contained index.mjs (root + dist/index.mjs) + md-client.js");
