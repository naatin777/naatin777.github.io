import { recipe } from "@vanilla-extract/recipes";
import { sprinkles } from "../../styles/sprinkles.css";
import { themeVars } from "../../styles/vars.css";

export const chip = recipe({
  base: [
    sprinkles({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      paddingInline: "sm",
      paddingBlock: "xs",
      fontSize: "xs",
      borderWidth: "thin",
      borderRadius: "pill",
      borderColor: "soft",
      color: "muted",
      background: "surface",
    }),
    {
      borderStyle: "solid",
      selectors: {
        "button&": {
          cursor: "pointer",
        },
        "button&:hover": {
          backgroundColor: themeVars.color.surfaceHover,
        },
      },
    },
  ],
  variants: {
    active: {
      false: {},
      true: sprinkles({
        background: {
          default: "surfaceActive",
          hover: "surfaceActive",
        },
      }),
    },
  },
  defaultVariants: {
    active: false,
  },
});
