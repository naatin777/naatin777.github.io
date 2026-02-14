import { style } from "@vanilla-extract/css";

export const footer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.625rem",
  marginTop: "auto",
  padding: "1rem 1rem 1.25rem",
});

export const socialIsland = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.35rem 0.5rem",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: "999px",
});

export const socialLinkGroup = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
});

export const copyright = style({
  fontSize: "0.75rem",
  lineHeight: 1.2,
  color: "rgba(255, 255, 255, 0.5)",
  textAlign: "center",
});
