import { style } from "@vanilla-extract/css";
import { sprinkles } from "../styles/sprinkles.css";
import { themeVars } from "../styles/vars.css";

export const siteFooter = style([
  sprinkles({ marginBlockStart: "auto", paddingBlockStart: "lg", paddingBlockEnd: "lg", paddingInline: "lg" }),
  {
    borderTop: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
  },
]);

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
    marginInline: "auto",
    paddingBlock: "md",
    paddingInline: "lg",
  }),
  {
    border: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
    backgroundColor: themeVars.color.surfaceFloating,
    backdropFilter: `blur(${themeVars.effect.blur})`,
    WebkitBackdropFilter: `blur(${themeVars.effect.blur})`,
  },
]);
