import { createThemeContract, createTheme } from "@vanilla-extract/css";

export const themeVars = createThemeContract({
  color: {
    background: "",
    text: "",
    primary: "",
    secondary: "",
    accent: "",
    glow: "",
  },
});

export const theme = createTheme(themeVars, {
  color: {
    background: "#020617", // Slate 950
    text: "#f8fafc",      // Slate 50
    primary: "#38bdf8",   // Sky 400
    secondary: "#94a3b8", // Slate 400
    accent: "#0ea5e9",    // Sky 500
    glow: "0 0 25px rgba(56, 189, 248, 0.2)",
  },
});
