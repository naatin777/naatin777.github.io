import adapter from "@sveltejs/adapter-static";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

// Content files are glob-imported into the SSR module graph only — client
// HMR never sees them, so md edits invalidate the server render but the
// browser stays on the old page. Force a real reload instead.
const reloadOnContentChange: Plugin = {
  name: "reload-on-content-change",
  configureServer(server) {
    const reload = (file: string) => {
      if (/[/\\]content[/\\]/.test(file)) server.ws.send({ type: "full-reload" });
    };
    server.watcher.on("add", reload).on("change", reload).on("unlink", reload);
  },
};

const katexDist = dirname(createRequire(import.meta.url).resolve("katex/dist/katex.min.css"));

// Post pages link /vendor/katex/katex.min.css only when the rendered HTML
// contains math — a real URL (not a bundled import) so the stylesheet's
// relative font urls resolve. Copying into static/ (gitignored) makes it a
// plain public asset: vite serves it in dev and the adapter ships it in
// build/, so the prerender crawler resolves it like any other static file.
const katexVendor: Plugin = {
  name: "katex-vendor",
  buildStart() {
    const out = resolve("static/vendor/katex");
    rmSync(out, { recursive: true, force: true });
    mkdirSync(join(out, "fonts"), { recursive: true });
    cpSync(join(katexDist, "katex.min.css"), join(out, "katex.min.css"));
    cpSync(join(katexDist, "fonts"), join(out, "fonts"), { recursive: true });
  },
};

// kit.csp hash mode signs only the scripts SvelteKit generates — inline
// <script> blocks in app.html (the theme/lang init) are not covered.
// Hash them at config time so script-src needs no 'unsafe-inline' and an
// edit to the script can't silently fall out of sync with a fixed hash.
// kit wraps sha256-* sources in quotes at emit time, so keep them bare.
const appHtmlScriptHashes = [...readFileSync("src/app.html", "utf8").matchAll(/<script>[\s\S]*?<\/script>/g)].map(
  (m): `sha256-${string}` =>
    `sha256-${createHash("sha256").update(m[0].slice("<script>".length, -"</script>".length)).digest("base64")}`,
);

export default defineConfig(({ command }) => ({
  plugins: [
    enhancedImages(),
    tailwindcss(),
    sveltekit({
      adapter: adapter({ fallback: "404.html" }),
      // No UI consumes `updated` — skip the hourly version.json poll.
      version: { pollInterval: 0 },
      // resolve() emits relative ./-/../-style paths during prerender by
      // default; this site deploys at the domain root and uses absolute
      // links everywhere, so keep resolve() output absolute too.
      paths: { relative: false },
      // GitHub Pages can't send response headers, so SvelteKit emits this as
      // a <meta> policy on prerendered pages. Hash mode signs the scripts it
      // generates (hydration payload, JSON-LD); app.html's inline scripts are
      // signed via appHtmlScriptHashes above — script-src needs no
      // 'unsafe-inline'. style-src keeps it: hashes don't cover style
      // attributes (app.html shell, mermaid SVG).
      csp: {
        mode: "hash",
        directives: {
          "default-src": ["self"],
          "script-src": ["self", ...appHtmlScriptHashes],
          "style-src": ["self", "unsafe-inline"],
          "img-src": ["self", "data:", "https:"],
          "font-src": ["self"],
          // HMR websockets only exist while a dev server runs — keep the
          // prerendered production meta free of localhost entries.
          "connect-src": ["self", ...(command === "serve" ? (["ws://localhost:*", "ws://127.0.0.1:*"] as const) : [])],
          "object-src": ["none"],
          "base-uri": ["self"],
          "form-action": ["none"],
        },
      },
      prerender: {
        // Entries-driven routes whose entry list can legitimately be empty —
        // e.g. every post is a draft, so /posts/[slug], /og/[slug] and
        // /series/[slug] produce no pages. Those get a warning; any other
        // unseen route still fails.
        handleUnseenRoutes: ({ routes }) => {
          const emptyable = new Set(["/posts/[slug]", "/og/[slug]", "/series/[slug]"]);
          const unexpected = routes.filter((route) => !emptyable.has(route));

          if (unexpected.length > 0) {
            throw new Error(`Unseen prerenderable routes: ${unexpected.join(", ")}`);
          }

          console.warn(`[prerender] ${routes.join(", ")} generated no pages (no published posts)`);
        },
      },
    }),
    reloadOnContentChange,
    katexVendor,
  ],
  build: {
    // Post assets must stay real URLs: inlining small files as data: URIs
    // makes the sanitizer strip img src (data: is not an allowed protocol).
    assetsInlineLimit: (filePath) => (filePath.includes("/content/") ? false : undefined),
  },
  server: {
    host: true,
    // SvelteKit narrows fs.allow to src/kit dirs only — co-located post assets
    // are ?url-imported from /content/ in dev, so it must be allowed too.
    fs: { allow: ["content"] },
  },
  ssr: {
    external: ["playwright", "mermaid-isomorphic"],
  },
}));
