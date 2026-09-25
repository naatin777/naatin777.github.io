// Serves the final build/ output the way GitHub Pages does: directories
// resolve to index.html and misses serve 404.html with a 404 status.
//
// `vite preview` serves only the output vite knows about — files copied
// into build/ after the build (OG images) 404 there. This script serves
// the final build/ directory itself, the way GitHub Pages does.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = "build";
const PORT = Number(process.env.PORT ?? 4321);

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".css": "text/css",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

if (!existsSync(ROOT)) {
  console.error("[preview] build/ not found — run `pnpm build` first");
  process.exit(1);
}

createServer((req, res) => {
  let pathname: string | null = null;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    // malformed escapes — pathname stays null and falls through to the 404 path
  }
  // normalize() on a root-anchored path collapses any .. segments, and the
  // startsWith guard keeps the file inside build/ regardless.
  let file = pathname === null ? "" : join(ROOT, normalize(pathname));
  let status = 200;
  if (file !== ROOT && !file.startsWith(`${ROOT}/`)) status = 404;
  else if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (status === 404 || !existsSync(file)) {
    file = join(ROOT, "404.html");
    status = 404;
  }
  res.writeHead(status, { "content-type": contentTypes[extname(file)] ?? "application/octet-stream" });
  // A stream failure (EMFILE, race between existsSync and open) must not
  // take the server down — headers are already sent, so just close.
  createReadStream(file)
    .on("error", () => res.end())
    .pipe(res);
}).listen(PORT, () => console.log(`[preview] serving build/ at http://localhost:${PORT}`));
