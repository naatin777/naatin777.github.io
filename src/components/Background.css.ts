import { style } from "@vanilla-extract/css";

export const ambientBackground = style({
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  overflow: "hidden",
});
