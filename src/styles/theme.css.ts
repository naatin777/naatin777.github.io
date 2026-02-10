import { createThemeContract, createTheme } from "@vanilla-extract/css";

export const themeVars = createThemeContract({
  color: {
    background: "",
    text: "",
  },
  fontFamily: "",
});

export const theme = createTheme(themeVars, {
  color: {
    background: "#0e0e0eff",
    text: "#f8fafc",
  },
  fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
});
