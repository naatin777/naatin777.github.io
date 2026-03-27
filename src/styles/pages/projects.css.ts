import { style } from "@vanilla-extract/css";
import { media } from "../responsive.css";
import { sprinkles } from "../sprinkles.css";

export const projectsPageBody = style([
  sprinkles({
    width: "full",
    maxWidth: "page",
    marginInline: "auto",
  }),
]);

export const projectsPageTitle = sprinkles({
  textAlign: "center",
  fontSize: "xl",
  lineHeight: "tight",
  marginBlockEnd: "md",
});

export const projectsPageLayout = style([
  sprinkles({
    display: "grid",
    gap: "lg",
    alignItems: "flex-start",
  }),
  {
    "@media": {
      [media.desktop]: {
        gridTemplateColumns: "minmax(0, 1fr) 16rem",
      },
    },
  },
]);

export const projectsCardList = style([
  sprinkles({
    listStyle: "none",
    display: "grid",
    gap: "lg",
  }),
]);
