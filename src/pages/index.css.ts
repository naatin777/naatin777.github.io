import { style } from "@vanilla-extract/css";

export const center = style({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
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
});
