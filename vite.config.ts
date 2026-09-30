import { enhancedImages } from "@sveltejs/enhanced-img";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
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

export default defineConfig({
  plugins: [enhancedImages(), tailwindcss(), sveltekit(), reloadOnContentChange],
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
});
