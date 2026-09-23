import { enhancedImages } from "@sveltejs/enhanced-img";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [enhancedImages(), tailwindcss(), sveltekit()],
  build: {
    // Post assets must stay real URLs: inlining small files as data: URIs
    // makes the sanitizer strip img src (data: is not an allowed protocol).
    assetsInlineLimit: (filePath) => (filePath.includes("/content/") ? false : undefined),
  },
  server: {
    host: true,
  },
  ssr: {
    external: ["playwright", "mermaid-isomorphic"],
  },
});
