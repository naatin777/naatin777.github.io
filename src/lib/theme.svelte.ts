import { browser } from "$app/environment";
import { MediaQuery } from "svelte/reactivity";

export type ThemePreference = "light" | "dark" | "system";

// keep in sync with the inline script in src/app.html and tokens in src/app.css
const THEME_COLOR = { light: "#fafafa", dark: "#0a0a0a" } as const;

const readDomPreference = (): ThemePreference => {
  const value = document.documentElement.dataset.themePreference;
  return value === "light" || value === "dark" ? value : "system";
};

// The inline script in app.html resolves data-theme before hydration;
// `preference` mirrors it, and `resolved` stays derived — including
// live system changes — so the two can never disagree.
const systemDark = new MediaQuery("(prefers-color-scheme: dark)");
let preference = $state<ThemePreference>(browser ? readDomPreference() : "system");
const resolved = $derived<"light" | "dark">(
  preference === "system" ? (systemDark.current ? "dark" : "light") : preference,
);

if (browser) {
  $effect.root(() => {
    $effect(() => {
      const root = document.documentElement;
      root.dataset.themePreference = preference;
      root.dataset.theme = resolved;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta instanceof HTMLMetaElement) {
        meta.content = THEME_COLOR[resolved];
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
