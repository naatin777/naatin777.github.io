import { style } from "@vanilla-extract/css";
import { sprinkles } from "../styles/sprinkles.css";
import { themeVars } from "../styles/vars.css";

export const siteFooter = style({
  marginBlockStart: "auto",
  paddingBlockStart: themeVars.spacing.lg,
  paddingBlockEnd: themeVars.spacing.lg,
  paddingInline: themeVars.spacing.lg,
  borderTop: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
});

export const footerInner = style([
  sprinkles({
    width: "full",
    maxWidth: "page",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "sm",
    borderRadius: "lg",
    boxShadow: "sm",
  }),
  {
    marginInline: "auto",
    paddingBlock: themeVars.spacing.md,
    paddingInline: themeVars.spacing.lg,
    border: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
    backgroundColor: themeVars.color.surfaceFloating,
    backdropFilter: `blur(${themeVars.effect.blur})`,
    WebkitBackdropFilter: `blur(${themeVars.effect.blur})`,
  },
]);
