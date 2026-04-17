import { style } from "@vanilla-extract/css";
import { sprinkles } from "../styles/sprinkles.css";
import { media } from "../styles/responsive.css";
import { themeVars } from "../styles/vars.css";

export const siteHeader = style([
  sprinkles({
    width: "full",
  }),
  {
    position: "sticky",
    top: 0,
    zIndex: themeVars.zIndex.header,
    userSelect: "none",
    WebkitUserSelect: "none",
    paddingBlockStart: `calc(${themeVars.spacing.sm} + env(safe-area-inset-top, 0px))`,
    paddingInlineStart: `max(${themeVars.spacing.lg}, env(safe-area-inset-left, 0px))`,
    paddingInlineEnd: `max(${themeVars.spacing.lg}, env(safe-area-inset-right, 0px))`,
  },
]);

export const headerInner = style([
  sprinkles({
    marginInline: "auto",
    paddingBlock: "sm",
    paddingInline: "md",
    borderRadius: "lg",
    background: "surfaceFloating",
    width: "full",
    maxWidth: "page",
    display: { mobile: "flex", tablet: "grid" },
    alignItems: "center",
    gap: "md",
    justifyContent: { mobile: "space-between" },
    flexWrap: { mobile: "wrap" },
  }),
  {
    gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
    border: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
    backdropFilter: `blur(${themeVars.effect.blur})`,
    WebkitBackdropFilter: `blur(${themeVars.effect.blur})`,
    "@media": {
      [media.mobile]: {
        rowGap: themeVars.spacing.xs,
        columnGap: themeVars.spacing.sm,
      },
    },
  },
]);

export const siteBrand = style([
  sprinkles({
    display: "inline-flex",
    whiteSpace: "nowrap",
    fontSize: "md",
    fontWeight: "semibold",
    justifySelf: "start",
    textDecoration: "none",
    color: { default: "strong", hover: "muted" },
  }),
  {
    gridColumn: "1",
  },
]);

export const siteNav = style([
  sprinkles({
    display: { mobile: "block", tablet: "inline-flex" },
    justifySelf: "center",
  }),
  {
    gridColumn: "2",
    gridRow: "1",
    "@media": {
      [media.mobile]: {
        width: `calc(100% + ${themeVars.spacing.xl})`,
        marginInlineStart: `-${themeVars.spacing.md}`,
        marginInlineEnd: `-${themeVars.spacing.md}`,
        paddingBlockStart: themeVars.spacing.xs,
        borderTop: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
      },
    },
  },
]);

export const siteNavList = sprinkles({
  listStyle: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "xs",
  width: { mobile: "full", tablet: "auto" },
  justifyContent: { mobile: "center", tablet: "flex-start" },
  flexWrap: { mobile: "wrap", tablet: "nowrap" },
});

export const siteNavLink = style([
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    fontWeight: "medium",
    borderRadius: "pill",
    textDecoration: "none",
    paddingInline: "md",
    color: { default: "muted", hover: "strong" },
    background: { hover: "surfaceHover" },
  }),
  {
    minHeight: "2rem",
    border: "none",
    backgroundColor: "transparent",
    selectors: {
      "&:hover": {
        boxShadow: `inset 0 0 0 1px ${themeVars.color.borderSoft}`,
      },
      '&[aria-current="page"]': {
        color: themeVars.color.textStrong,
        backgroundColor: themeVars.color.surfaceActive,
        boxShadow: `inset 0 0 0 1px ${themeVars.color.border}`,
      },
    },
  },
]);

export const headerActions = style([
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    whiteSpace: "nowrap",
    gap: "md",
    justifySelf: "end",
  }),
  {
    gridColumn: "3",
  },
]);
