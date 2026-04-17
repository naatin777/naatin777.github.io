import { style } from "@vanilla-extract/css";
import { sprinkles } from "../../styles/sprinkles.css";
import { darkTheme, lightTheme } from "../../styles/theme.css";
import { themeVars } from "../../styles/vars.css";

export const projectCard = sprinkles({
  display: "flex",
  flexDirection: "column",
  paddingInline: "md",
  paddingBlock: "md",
  gap: "md",
});

export const projectTagList = style([
  sprinkles({
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
    gap: "md",
    paddingBlockEnd: "sm",
  }),
  {
    borderBottom: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
  },
]);

export const projectHeader = sprinkles({
  display: "flex",
  alignItems: "center",
});

export const projectContentSection = style([
  sprinkles({
    display: "flex",
    flexDirection: "column",
    gap: "md",
    paddingBlockEnd: "sm",
  }),
  {
    borderBottom: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
  },
]);

export const projectIcon = style([
  sprinkles({ borderRadius: "md" }),
  {
    width: "72px",
    height: "72px",
    objectFit: "cover",
  },
]);

export const projectName = style([
  sprinkles({
    fontSize: "xl",
    color: "strong",
    marginInlineStart: "lg",
  }),
  {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    WebkitLineClamp: 2,
  },
]);

export const projectSummary = style([
  sprinkles({ color: "muted" }),
  {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    WebkitLineClamp: 3,
    fontSize: themeVars.fontSize.sm,
  },
]);

export const projectActions = sprinkles({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "xs",
});

export const projectActionLink = style([
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "pill",
    background: "surfaceFloating",
    color: "muted",
    fontSize: "xs",
    lineHeight: "tight",
    whiteSpace: "nowrap",
    textDecoration: "none",
    gap: "xs",
    paddingBlock: "xs",
    paddingInline: "sm",
  }),
  {
    border: `${themeVars.borderWidth.thin} solid ${themeVars.color.border}`,
    transition: `color ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}, border-color ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}, background-color ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}`,
    selectors: {
      "&:hover": {
        color: themeVars.color.textStrong,
        backgroundColor: themeVars.color.surfaceActive,
        borderColor: themeVars.color.borderStrong,
      },
      "&:focus-visible": {
        outline: `${themeVars.borderWidth.thick} solid ${themeVars.color.focusRing}`,
        outlineOffset: "2px",
      },
    },
  },
]);

export const projectActionIcon = style({
  width: "14px",
  height: "14px",
  opacity: 0.85,
});

export const projectActionIconLight = style({
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

export const projectActionIconDark = style({
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
