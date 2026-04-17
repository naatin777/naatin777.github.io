import { style } from "@vanilla-extract/css";
import { darkTheme, lightTheme } from "../styles/theme.css";
import { sprinkles } from "../styles/sprinkles.css";
import { themeVars } from "../styles/vars.css";

export const socialLinkButton = style([
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "pill",
    background: "surfaceFloating",
  }),
  {
    width: "2.5rem",
    height: "2.5rem",
    border: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
    backdropFilter: `blur(${themeVars.effect.blur})`,
    WebkitBackdropFilter: `blur(${themeVars.effect.blur})`,
    transition: `background-color ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}, border-color ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}`,
    selectors: {
      "&:hover": {
        backgroundColor: themeVars.color.surfaceActive,
        borderColor: themeVars.color.borderStrong,
      },
      "&:focus-visible": {
        outline: `${themeVars.borderWidth.thick} solid ${themeVars.color.focusRing}`,
      },
    },
  },
]);

export const socialLinkIcon = style({
  display: "block",
  width: 24,
  height: 24,
  opacity: 0.75,
  transition: `opacity ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}`,
  selectors: {
    [`${socialLinkButton}:hover &`]: {
      opacity: 1,
    },
    [`${socialLinkButton}:focus-visible &`]: {
      opacity: 1,
    },
  },
});

export const socialLinkIconLight = style({
  display: "block",
  selectors: {
    [`:root.${darkTheme} &`]: {
      display: "none",
    },
    [`:root.${lightTheme} &`]: {
      display: "block",
    },
  },
});

export const socialLinkIconDark = style({
  display: "none",
  selectors: {
    [`:root.${darkTheme} &`]: {
      display: "block",
    },
    [`:root.${lightTheme} &`]: {
      display: "none",
    },
  },
});
