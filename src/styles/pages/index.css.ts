import { style } from "@vanilla-extract/css";
import { themeVars } from "../vars.css";

export const homeProfileImage = style({
  width: "120px",
  height: "120px",
  borderRadius: themeVars.radius.pill,
  objectFit: "cover",
  filter: "drop-shadow(0 10px 24px rgba(2, 6, 23, 0.28))",
});

export const homeIntroText = style({
  maxWidth: "42rem",
  color: themeVars.color.textMuted,
  lineHeight: themeVars.lineHeight.relaxed,
  textWrap: "balance",
});
