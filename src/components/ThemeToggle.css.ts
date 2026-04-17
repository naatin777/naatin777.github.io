import { createVar } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { sprinkles } from "../styles/sprinkles.css";
import { themeVars } from "../styles/vars.css";

const toggleSizeVar = createVar();
const toggleGapVar = createVar();
const togglePaddingVar = createVar();
const toggleIndicatorTransformTransition = `transform ${themeVars.motion.duration.slow} ${themeVars.motion.easing.emphasized}`;
const toggleIndicatorColorTransition = `background-color ${themeVars.motion.duration.slow} ${themeVars.motion.easing.standard}`;
const toggleIndicatorOpacityTransition = `opacity ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}`;
const toggleButtonFocusRing = `inset 0 0 0 2px ${themeVars.color.focusRing}`;
const themePreferenceSelector = {
  light: 'html[data-theme-preference="light"]',
  system: 'html[data-theme-preference="system"]',
  dark: 'html[data-theme-preference="dark"]',
} as const;

export const themeToggleRoot = recipe({
  base: [
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
    },
  ],
  variants: {
    ready: {
      false: {},
      true: {},
    },
  },
  defaultVariants: {
    ready: false,
  },
});

export const themeToggleActiveIndicator = recipe({
  base: [
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
        [`${themePreferenceSelector.light} &[data-theme-indicator="true"]`]: {
          transform: "translateX(0)",
        },
        [`${themePreferenceSelector.system} &[data-theme-indicator="true"]`]: {
          transform: `translateX(calc(${toggleSizeVar} + ${toggleGapVar}))`,
        },
        [`${themePreferenceSelector.dark} &[data-theme-indicator="true"]`]: {
          transform: `translateX(calc((${toggleSizeVar} + ${toggleGapVar}) * 2))`,
        },
      },
    },
  ],
  variants: {
    activeTheme: {
      light: {
        transform: "translateX(0)",
      },
      system: {
        transform: `translateX(calc(${toggleSizeVar} + ${toggleGapVar}))`,
      },
      dark: {
        transform: `translateX(calc((${toggleSizeVar} + ${toggleGapVar}) * 2))`,
      },
    },
    ready: {
      false: {
        opacity: 1,
      },
      true: {
        opacity: 1,
      },
    },
    animate: {
      false: {
        transition: "none",
      },
      true: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        ready: true,
        animate: true,
      },
      style: {
        transition: `${toggleIndicatorTransformTransition}, ${toggleIndicatorColorTransition}, ${toggleIndicatorOpacityTransition}`,
      },
    },
  ],
  defaultVariants: {
    activeTheme: "system",
    ready: false,
    animate: false,
  },
});

export const themeToggleButton = recipe({
  base: [
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
        [`${themePreferenceSelector.light} &[data-theme-value="light"]`]: {
          color: themeVars.color.textStrong,
        },
        [`${themePreferenceSelector.system} &[data-theme-value="system"]`]: {
          color: themeVars.color.textStrong,
        },
        [`${themePreferenceSelector.dark} &[data-theme-value="dark"]`]: {
          color: themeVars.color.textStrong,
        },
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
      },
    },
  ],
  variants: {
    selected: {
      false: {},
      true: {
        color: themeVars.color.textStrong,
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const themeToggleIcon = recipe({
  base: [
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
        [`${themePreferenceSelector.light} &[data-theme-value="light"]`]: {
          opacity: 1,
        },
        [`${themePreferenceSelector.system} &[data-theme-value="system"]`]: {
          opacity: 1,
        },
        [`${themePreferenceSelector.dark} &[data-theme-value="dark"]`]: {
          opacity: 1,
        },
      },
    },
  ],
  variants: {
    active: {
      false: {},
      true: {
        opacity: 1,
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});
