import { browser } from "$app/environment";

export type ThemePreference = "light" | "dark" | "system";

// keep in sync with the inline script in src/app.html and tokens in src/app.css
const THEME_COLOR = { light: "#fafafa", dark: "#0a0a0a" } as const;

const readDomPreference = (): ThemePreference => {
  const value = document.documentElement.dataset.themePreference;
  return value === "light" || value === "dark" ? value : "system";
};

let preference = $state<ThemePreference>(browser ? readDomPreference() : "system");
let resolved = $state<"light" | "dark">("light");

function apply(pref: ThemePreference): void {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  resolved = dark ? "dark" : "light";
  const root = document.documentElement;
  root.dataset.themePreference = pref;
  root.dataset.theme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta instanceof HTMLMetaElement) {
    meta.content = THEME_COLOR[resolved];
  }
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
      if (next === "system") {
        localStorage.removeItem("theme");
      } else {
        localStorage.setItem("theme", next);
      }
      apply(next);
    },
    reapply() {
      apply(preference);
    },
  };
}
