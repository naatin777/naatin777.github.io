import { createVar, style } from "@vanilla-extract/css";
import { sprinkles } from "../styles/sprinkles.css";
import { themeVars } from "../styles/vars.css";

const toggleSizeVar = createVar();
const toggleGapVar = createVar();
const togglePaddingVar = createVar();
const toggleIndicatorTransformTransition = `transform ${themeVars.motion.duration.slow} ${themeVars.motion.easing.emphasized}`;
const toggleIndicatorColorTransition = `background-color ${themeVars.motion.duration.slow} ${themeVars.motion.easing.standard}`;
const toggleIndicatorOpacityTransition = `opacity ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}`;
const toggleButtonFocusRing = `inset 0 0 0 2px ${themeVars.color.focusRing}`;

export const themeToggleRoot = style([
  sprinkles({
    display: "inline-grid",
    alignItems: "center",
    borderRadius: "pill",
    background: "surfaceSoft",
  }),
  {
    position: "relative",
    gridAutoFlow: "column",
    vars: {
      [toggleSizeVar]: "32px",
      [toggleGapVar]: "0px",
      [togglePaddingVar]: "0px",
    },
    gap: toggleGapVar,
    padding: togglePaddingVar,
    boxShadow: `inset 0 0 0 1px ${themeVars.color.border}`,
    backdropFilter: `blur(${themeVars.effect.blur})`,
    WebkitBackdropFilter: `blur(${themeVars.effect.blur})`,
    overflow: "hidden",
    userSelect: "none",
    WebkitUserSelect: "none",
    selectors: {
      '&[data-theme-toggle-ready="false"]': {
        visibility: "hidden",
        pointerEvents: "none",
      },
      '&[data-theme-toggle-ready="true"]': {
        visibility: "visible",
      },
    },
  },
]);

export const themeToggleActiveIndicator = style([
  sprinkles({
    borderRadius: "pill",
    background: "surfaceActive",
  }),
  {
    position: "absolute",
    top: togglePaddingVar,
    left: togglePaddingVar,
    width: toggleSizeVar,
    height: toggleSizeVar,
    transform: `translateX(calc(${toggleSizeVar} + ${toggleGapVar}))`,
    pointerEvents: "none",
    boxShadow: `inset 0 0 0 1px ${themeVars.color.border}`,
    opacity: 0,
    transition: "none",
    selectors: {
      [`${themeToggleRoot}[data-theme-active="dark"] &`]: {
        transform: `translateX(calc((${toggleSizeVar} + ${toggleGapVar}) * 2))`,
      },
      [`${themeToggleRoot}[data-theme-active="system"] &`]: {
        transform: `translateX(calc(${toggleSizeVar} + ${toggleGapVar}))`,
      },
      [`${themeToggleRoot}[data-theme-active="light"] &`]: {
        transform: "translateX(0)",
      },
      [`${themeToggleRoot}[data-theme-toggle-ready="true"] &`]: {
        opacity: 1,
      },
      [`${themeToggleRoot}[data-theme-toggle-ready="true"][data-theme-toggle-animate="true"] &`]: {
        transition: `${toggleIndicatorTransformTransition}, ${toggleIndicatorColorTransition}, ${toggleIndicatorOpacityTransition}`,
      },
    },
  },
]);

export const themeToggleButton = style([
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "pill",
  }),
  {
    position: "relative",
    zIndex: 1,
    width: toggleSizeVar,
    height: toggleSizeVar,
    border: 0,
    appearance: "none",
    WebkitAppearance: "none",
    backgroundColor: "transparent",
    color: themeVars.color.textMuted,
    cursor: "pointer",
    transform: "none",
    transition: `color ${themeVars.motion.duration.normal} ease`,
    selectors: {
      "&:hover": {
        color: themeVars.color.textStrong,
      },
      "&:active": {
        transform: "none",
      },
      "&:focus-visible": {
        outline: "none",
        boxShadow: toggleButtonFocusRing,
      },
      [`${themeToggleRoot}[data-theme-active="light"] &[data-theme-toggle-option="light"]`]: {
        color: themeVars.color.textStrong,
      },
      [`${themeToggleRoot}[data-theme-active="system"] &[data-theme-toggle-option="system"]`]: {
        color: themeVars.color.textStrong,
      },
      [`${themeToggleRoot}[data-theme-active="dark"] &[data-theme-toggle-option="dark"]`]: {
        color: themeVars.color.textStrong,
      },
    },
  },
]);

export const themeToggleIcon = style([
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  {
    width: "18px",
    height: "18px",
    opacity: 0.8,
    transition: "none",
    selectors: {
      [`${themeToggleRoot}[data-theme-active="light"] ${themeToggleButton}[data-theme-toggle-option="light"] &`]: {
        opacity: 1,
      },
      [`${themeToggleRoot}[data-theme-active="system"] ${themeToggleButton}[data-theme-toggle-option="system"] &`]: {
        opacity: 1,
      },
      [`${themeToggleRoot}[data-theme-active="dark"] ${themeToggleButton}[data-theme-toggle-option="dark"] &`]: {
        opacity: 1,
      },
    },
  },
]);
