import { style } from "@vanilla-extract/css";

export const footer = style({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  padding: "1rem",
  background: "rgba(255, 255, 255, 0.1)",
});

export const socialLinkGroup = style({
  display: "flex",
  gap: "1rem",
});
