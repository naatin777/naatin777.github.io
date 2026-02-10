import { globalStyle, style } from "@vanilla-extract/css";

export const header = style({
  position: "sticky",
  top: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "5rem",
  zIndex: 100,
});

export const navList = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "stretch",
  listStyle: "none",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  borderRadius: "24px",
});

export const navLink = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "inherit",
  padding: "0.4rem 0.9rem",
  borderRadius: "24px",
  selectors: {
    "&:hover": {
      opacity: 0.5,
    },
  },
});

const transitionName = "nav-active";

export const activeNavLink = style({
  background: "rgba(255, 255, 255, 0.2)",
  position: "absolute",
  inset: 0,
  borderRadius: "24px",
  viewTransitionName: transitionName,
});

globalStyle(`::view-transition-group(${transitionName})`, {
  animationDuration: "0.2s",
  animationTimingFunction: "cubic-bezier(0.5, 0, 0, 1)",
});

globalStyle(
  `::view-transition-old(${transitionName}), ::view-transition-new(${transitionName})`,
  {
    objectFit: "none",
    height: "100%",
    width: "100%",
    mixBlendMode: "normal",
  },
);
