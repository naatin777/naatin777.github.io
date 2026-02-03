import { style } from "@vanilla-extract/css";
import { themeVars } from "./theme.css";

export const center = style({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
});

export const headerContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  marginBottom: "1rem",
});

export const iconImage = style({
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  objectFit: "cover",
  border: `4px solid ${themeVars.color.background}`,
  boxShadow: themeVars.color.glow,
});

export const socialContainer = style({
  display: "flex",
  gap: "1rem",
  marginTop: "1rem",
});

export const footer = style({
  textAlign: "center",
  padding: "2rem",
  color: "#94a3b8",
  fontSize: "0.875rem",
});
