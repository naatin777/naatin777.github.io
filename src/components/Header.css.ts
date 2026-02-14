import { createViewTransition, globalStyle, style } from "@vanilla-extract/css";

export const header = style({
  position: "sticky",
  top: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "5rem",
  zIndex: 100,
  userSelect: "none",
  WebkitUserSelect: "none",
});

export const navList = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  listStyle: "none",
  gap: "0.25rem",
  padding: "0.35rem 0.5rem",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: "999px",
});

export const navLink = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "inherit",
  padding: "0.4rem 0.9rem",
  borderRadius: "999px",
  transition: "background-color 160ms ease",
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.07)",
    },
    "&:focus-visible": {
      outline: "2px solid rgba(255, 255, 255, 0.5)",
      outlineOffset: "2px",
    },
  },
});

const navActiveTransition = createViewTransition("nav-active");

export const activeNavLink = style({
  background: "rgba(255, 255, 255, 0.18)",
  position: "absolute",
  inset: 0,
  borderRadius: "999px",
  pointerEvents: "none",
  viewTransitionName: navActiveTransition,
});

globalStyle(`::view-transition-group(${navActiveTransition})`, {
  animationDuration: "0.12s",
  animationTimingFunction: "cubic-bezier(0.5, 0, 0, 1)",
});

globalStyle(
  `::view-transition-old(${navActiveTransition}), ::view-transition-new(${navActiveTransition})`,
  {
    objectFit: "none",
    height: "100%",
    width: "100%",
    mixBlendMode: "normal",
  },
);
