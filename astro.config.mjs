import { defineConfig, fontProviders } from "astro/config";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://naatin777.dev",
  trailingSlash: "always",
  prefetch: true,

  build: {
    format: "directory",
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-inter",
      styles: ["normal"],
      weights: ["400 700"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Sans JP",
      cssVariable: "--font-noto-sans-jp",
      styles: ["normal"],
      weights: ["400 700"],
      fallbacks: ["sans-serif"],
    },
  ],

  vite: {
    plugins: [vanillaExtractPlugin()],
    build: {
      cssCodeSplit: false,
    },
  },

  devToolbar: {
    enabled: false,
  },

  server: {
    host: true,
  },

  integrations: [react(), mdx()],
});
