import { style } from "@vanilla-extract/css";
import { sprinkles } from "../../styles/sprinkles.css";
import { themeVars } from "../../styles/vars.css";

export const tagCardActionButton = style([
  sprinkles({
    background: "surface",
    paddingBlock: "xs",
    paddingInline: "sm",
    color: "muted",
    fontSize: "xs",
    lineHeight: "tight",
    borderRadius: "pill",
  }),
  {
    border: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
    cursor: "pointer",
    selectors: {
      "&:hover:not(:disabled)": {
        color: themeVars.color.textStrong,
        background: themeVars.color.surfaceHover,
      },
      "&:disabled": {
        cursor: "default",
        opacity: 0.45,
      },
    },
  },
]);
