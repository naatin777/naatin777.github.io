import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles";
import { utilitiesLayer } from "./layers.css";
import { mediaQueries } from "./responsive.css";
import { themeVars } from "./vars.css";

const responsiveProperties = defineProperties({
  "@layer": utilitiesLayer,
  conditions: {
    mobile: {},
    tablet: { "@media": mediaQueries.tablet },
    desktop: { "@media": mediaQueries.desktop },
  },
  defaultCondition: "mobile",
  properties: {
    display: ["none", "block", "flex", "inline-flex"],
    alignItems: ["center"],
    justifyContent: ["center"],
    gap: themeVars.spacing,
    paddingBlock: themeVars.spacing,
    paddingInline: themeVars.spacing,
    fontSize: themeVars.fontSize,
    lineHeight: themeVars.lineHeight,
  },
});

const visualProperties = defineProperties({
  "@layer": utilitiesLayer,
  properties: {
    borderRadius: themeVars.radius,
    color: ["inherit"],
    background: ["transparent"],
    cursor: ["pointer"],
  },
});

export const sprinkles = createSprinkles(responsiveProperties, visualProperties);
