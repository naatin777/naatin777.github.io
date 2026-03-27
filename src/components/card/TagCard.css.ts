import { style } from "@vanilla-extract/css";
import { media } from "../../styles/responsive.css";
import { sprinkles } from "../../styles/sprinkles.css";
import { themeVars } from "../../styles/vars.css";

export const tagCard = style([
  sprinkles({
    paddingBlock: "md",
    paddingInline: "md",
  }),
  {
    order: -1,
  },
  {
    "@media": {
      [media.desktop]: {
        order: 1,
        position: "sticky",
        top: "4.5rem",
      },
    },
  },
]);

export const tagCardTitle = style([
  sprinkles({
    fontSize: "sm",
    color: "muted",
    fontWeight: "semibold",
  }),
]);

export const tagCardHeader = style([
  sprinkles({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "sm",
  }),
]);

export const tagCardList = style([
  sprinkles({
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
    gap: "sm",
    marginBlockStart: "sm",
    paddingBlockStart: "sm",
  }),
  {
    borderTop: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
  },
]);
