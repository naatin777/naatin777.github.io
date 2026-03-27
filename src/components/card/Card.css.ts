import { style } from "@vanilla-extract/css";
import { sprinkles } from "../../styles/sprinkles.css";
import { themeVars } from "../../styles/vars.css";

export const card = style([
  sprinkles({
    borderRadius: "lg",
    background: "surfaceFloating",
    textDecoration: "none",
  }),
  {
    minWidth: 0,
    border: `${themeVars.borderWidth.thin} solid ${themeVars.color.border}`,
    color: "inherit",
    backdropFilter: `blur(${themeVars.effect.blur})`,
    WebkitBackdropFilter: `blur(${themeVars.effect.blur})`,
  },
]);
