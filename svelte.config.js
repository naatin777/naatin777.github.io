import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ fallback: "404.html" }),
    prerender: {
      // Entries-driven routes whose entry list can legitimately be empty —
      // e.g. every post is a draft, so /posts/[slug] and /og/[slug] produce
      // no pages. Those get a warning; any other unseen route still fails.
      handleUnseenRoutes: ({ routes }) => {
        const emptyable = new Set(["/posts/[slug]", "/og/[slug]"]);
        const unexpected = routes.filter((route) => !emptyable.has(route));
        if (unexpected.length > 0) {
          throw new Error(`Unseen prerenderable routes: ${unexpected.join(", ")}`);
        }
        console.warn(`[prerender] ${routes.join(", ")} generated no pages (no published posts)`);
      },
    },
  },
};

export default config;
