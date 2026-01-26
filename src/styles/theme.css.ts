import { createThemeContract, createTheme } from "@vanilla-extract/css";

export const themeVars = createThemeContract({
  color: {
    background: "",
    text: "",
    primary: "",
    secondary: "",
  },
});

export const lightTheme = createTheme(themeVars, {
  color: {
    background: "#F8FAFC",
    text: "#1E293B",
    primary: "#0891B2",
    secondary: "#64748B",
  },
});

export const darkTheme = createTheme(themeVars, {
  color: {
    background: "#0F172A",
    text: "#F1F5F9",
    primary: "#22D3EE",
    secondary: "#94A3B8",
  },
});
