import { defaultLang, langs } from "$lib/config/i18n";
import { themeColors } from "$lib/config/theme";

// Builds the inline <head> script that hooks.server.ts injects into every
// page. It resolves theme and lang before first paint so neither flashes
// wrong, and is generated from shared constants so the color values and the
// lang whitelist can't drift from theme.svelte.ts / config/i18n.ts.
//
// ?lang= applies to this view only — it must NOT be persisted, or a shared
// link would silently rewrite the recipient's preference. Storage failures
// (disabled storage etc.) fall through to the defaults.
export const initScript = (): string => `<script>(() => {
  try {
    const themeColors = ${JSON.stringify(themeColors)};
    const langs = ${JSON.stringify(langs)};
    const stored = localStorage.getItem("theme");
    const preference = stored === "light" || stored === "dark" ? stored : "system";
    const dark = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    const root = document.documentElement;
    root.dataset.themePreference = preference;
    root.dataset.theme = dark ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? themeColors.dark : themeColors.light;
    const pick = (value) => (langs.includes(value) ? value : null);
    root.lang =
      pick(new URLSearchParams(location.search).get("lang")) ??
      pick(localStorage.getItem("lang")) ??
      ${JSON.stringify(defaultLang)};
  } catch {
    // fall through to markup defaults
  }
})();</script>`;
