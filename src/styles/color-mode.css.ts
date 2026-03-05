import type { StyleRule } from "@vanilla-extract/css";

type ThemeModeWrappedRule = {
  selectors: Record<string, StyleRule>;
  "@media": Record<string, { selectors: Record<string, StyleRule> }>;
};

const withThemeMode = (
  explicitSelector: string,
  mediaQuery: string,
  rule: StyleRule,
): ThemeModeWrappedRule => ({
  selectors: {
    [explicitSelector]: rule,
  },
  "@media": {
    [mediaQuery]: {
      selectors: {
        [":root:not([data-theme]) &"]: rule,
        [':root[data-theme="system"] &']: rule,
      },
    },
  },
});

export const withDarkMode = (rule: StyleRule): ThemeModeWrappedRule =>
  withThemeMode(':root[data-theme="dark"] &', "(prefers-color-scheme: dark)", rule);

export const withLightMode = (rule: StyleRule): ThemeModeWrappedRule =>
  withThemeMode(':root[data-theme="light"] &', "(prefers-color-scheme: light)", rule);
