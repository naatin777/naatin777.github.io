import { style } from "@vanilla-extract/css";
import { themeVars } from "./theme.css";

export const socialLink = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  color: themeVars.color.secondary,
  margin: "0 0.5rem",
});

export const socialIcon = style({
  width: 24,
  height: 24,
  display: "block",
  fill: "currentColor",
});
