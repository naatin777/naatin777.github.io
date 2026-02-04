// @ts-check
import { defineConfig } from "astro/config";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [vanillaExtractPlugin()],
  },
  site: "https://naatin777.github.io",
});
