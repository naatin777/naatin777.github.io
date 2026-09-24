import { browser } from "$app/environment";
import { themeColors } from "$lib/config/theme";

type ThemePreference = "light" | "dark" | "system";

const readDomPreference = (): ThemePreference => {
  const value = document.documentElement.dataset.themePreference;
  return value === "light" || value === "dark" ? value : "system";
};

// The init script (in app.html) resolves data-theme
// before hydration; `preference` mirrors it, and `resolved` stays derived —
// including live system changes — so the two can never disagree.
// matchMedia is used directly (not svelte's MediaQuery) because its initial
// value must be correct at hydration, not one tick later.
let systemDark = $state(false);
if (browser) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  systemDark = media.matches;
  media.addEventListener("change", (event) => {
    systemDark = event.matches;
  });
}
let preference = $state<ThemePreference>(browser ? readDomPreference() : "system");
const resolved = $derived<"light" | "dark">(preference === "system" ? (systemDark ? "dark" : "light") : preference);

if (browser) {
  $effect.root(() => {
    $effect(() => {
      const root = document.documentElement;
      root.dataset.themePreference = preference;
      root.dataset.theme = resolved;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta instanceof HTMLMetaElement) {
        meta.content = themeColors[resolved];
      }
    });
  });
}

export function themeState() {
  return {
    get preference() {
      return preference;
    },
    get resolved() {
      return resolved;
    },
    set(next: ThemePreference) {
      preference = next;
      try {
        if (next === "system") localStorage.removeItem("theme");
        else localStorage.setItem("theme", next);
      } catch {
        // storage disabled — preference still applies for this session
      }
    },
  };
}
