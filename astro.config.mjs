import { defineConfig } from "astro/config";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  site: "https://naatin777.dev",
  trailingSlash: "always",
  prefetch: true,
  build: {
    format: "directory",
  },
  vite: {
    plugins: [vanillaExtractPlugin()],
  },
  devToolbar: {
    enabled: false,
  },
  server: {
    host: true,
  },
});
