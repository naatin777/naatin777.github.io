// Serves the final build/ output the way GitHub Pages does: directories
// resolve to index.html and misses serve 404.html with a 404 status.
//
// `vite preview` serves .svelte-kit/output instead of build/, so assets
// generated post-build (pagefind index, OG images) 404 there — making
// e.g. Search untestable locally. This script previews what actually ships.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = "build";
const PORT = Number(process.env.PORT ?? 4321);

const contentTypes: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".json": "application/json",
  ".pagefind": "application/wasm",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

if (!existsSync(ROOT)) {
  console.error("[preview] build/ not found — run `pnpm build` first");
  process.exit(1);
}

createServer((req, res) => {
  let pathname = "/";
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    // malformed escapes — let it fall through to the 404 path
  }
  // normalize() on a root-anchored path collapses any .. segments, and the
  // startsWith guard keeps the file inside build/ regardless.
  let file = join(ROOT, normalize(pathname));
  let status = 200;
  if (!file.startsWith(ROOT)) status = 404;
  else if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (status === 404 || !existsSync(file)) {
    file = join(ROOT, "404.html");
    status = 404;
  }
  res.writeHead(status, { "content-type": contentTypes[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`[preview] serving build/ at http://localhost:${PORT}`));
