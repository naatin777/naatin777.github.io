import { globalStyle } from "@vanilla-extract/css";
import { themeVars } from "./theme.css";

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle('*', {
  margin: 0,
  padding: 0,
});

globalStyle("body", {
  fontFamily: themeVars.fontFamily,
  color: themeVars.color.text,
  backgroundColor: themeVars.color.background,
  lineHeight: 1.5,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  WebkitTapHighlightColor: 'transparent',
  overflowY: "scroll",
});

globalStyle('img, picture, video, canvas, svg', {
  display: 'block',
  maxWidth: '100%',
});

globalStyle('::-webkit-scrollbar', {
  width: '8px',
});

globalStyle('::-webkit-scrollbar-track', {
  background: themeVars.color.background,
  borderRadius: '6px',
});

globalStyle('::-webkit-scrollbar-thumb', {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '6px',
});

globalStyle('::-webkit-scrollbar-thumb:hover', {
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
});

