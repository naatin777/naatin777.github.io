import type { Handle } from "@sveltejs/kit";
import { themeColors } from "$lib/config/theme";
import { initScript } from "$lib/server/init-script";

// Delivers the theme-color meta and the pre-paint theme/lang init script,
// generated from shared constants. transformPageChunk only applies to page
// renders — feed.xml/sitemap.xml endpoints are untouched.
export const handle: Handle = ({ event, resolve }) =>
  resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace("</head>", `<meta name="theme-color" content="${themeColors.light}" />${initScript()}</head>`),
  });
