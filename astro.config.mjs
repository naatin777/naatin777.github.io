import { defineConfig } from "astro/config";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  vite: {
    plugins: [vanillaExtractPlugin()],
  },
  site: "https://naatin777.dev",
  trailingSlash: "always",
  build: {
    inlineStylesheets: "always",
  },
});
