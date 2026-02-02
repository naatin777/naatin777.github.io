import { globalStyle } from "@vanilla-extract/css";
import { themeVars } from "./theme.css";

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle("body", {
  backgroundColor: themeVars.color.background,
  backgroundImage: `radial-gradient(circle at 50% 0%, ${themeVars.color.glow}, transparent 40%)`,
  color: themeVars.color.text,
  fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
  WebkitFontSmoothing: "antialiased",
  lineHeight: 1.6,
  minHeight: "100vh",
  margin: 0,
  padding: 0,
});

globalStyle("img", {
  maxWidth: "100%",
  height: "auto",
});
