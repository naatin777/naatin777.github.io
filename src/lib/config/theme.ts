// Single source of truth for the JS-facing theme colors: meta theme-color
// (init script) and theme.svelte.ts both read these. The --background etc.
// tokens in app.css hold the same values — CSS can't import TS, so that
// duplication is manual but deliberate.
export const themeColors = { light: "#fafafa", dark: "#0a0a0a" } as const;
