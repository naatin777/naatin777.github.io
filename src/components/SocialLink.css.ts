import { style } from "@vanilla-extract/css";

export const socialLink = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "999px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  transition: "background-color 0.2s ease-in-out",
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.16)",
    },
    "&:focus-visible": {
      outline: "2px solid rgba(255, 255, 255, 0.5)",
      outlineOffset: "2px",
    },
  },
});

export const socialIcon = style({
  width: 24,
  height: 24,
  display: "block",
  fill: "currentColor",
  opacity: 0.72,
  transition: "opacity 0.2s ease-in-out",
  selectors: {
    [`${socialLink}:hover &`]: {
      opacity: 1,
    },
    [`${socialLink}:focus-visible &`]: {
      opacity: 1,
    },
  },
});
