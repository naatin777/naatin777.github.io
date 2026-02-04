import { createThemeContract, createTheme } from "@vanilla-extract/css";

export const themeVars = createThemeContract({
  color: {
    background: "",
    text: "",
    primary: "",
    secondary: "",
    accent: "",
  },
});

export const theme = createTheme(themeVars, {
  color: {
    background: "#020617",
    text: "#f8fafc",
    primary: "#38bdf8",
    secondary: "#94a3b8",
    accent: "#0ea5e9",
  },
});
