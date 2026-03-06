import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles";
import { themeVars } from "./vars.css";
import { sprinklesLayer } from "./layers.css";

const responsiveProperties = defineProperties({
  "@layer": sprinklesLayer,
  conditions: {
    mobile: {},
    tablet: { "@media": "screen and (min-width: 768px)" },
    desktop: { "@media": "screen and (min-width: 1024px)" },
  },
  defaultCondition: "mobile",
  properties: {
    display: ["none", "block", "flex", "grid", "inline-flex"],
    flexDirection: ["row", "column"],
    justifyContent: ["flex-start", "center", "flex-end", "space-between"],
    alignItems: ["stretch", "flex-start", "center", "flex-end"],
    gap: themeVars.spacing,
    rowGap: themeVars.spacing,
    columnGap: themeVars.spacing,

    paddingTop: themeVars.spacing,
    paddingBottom: themeVars.spacing,
    paddingLeft: themeVars.spacing,
    paddingRight: themeVars.spacing,

    marginTop: themeVars.spacing,
    marginBottom: themeVars.spacing,
    marginLeft: themeVars.spacing,
    marginRight: themeVars.spacing,

    width: {
      auto: "auto",
      full: "100%",
    },
    maxWidth: {
      header: themeVars.layout.header,
      container: themeVars.layout.container,
      content: themeVars.layout.content,
      reading: themeVars.layout.reading,
    },
  },
  shorthands: {
    paddingX: ["paddingLeft", "paddingRight"],
    paddingY: ["paddingTop", "paddingBottom"],
    marginX: ["marginLeft", "marginRight"],
    marginY: ["marginTop", "marginBottom"],
    padding: ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"],
    margin: ["marginTop", "marginBottom", "marginLeft", "marginRight"],
  },
});

const visualProperties = defineProperties({
  "@layer": sprinklesLayer,
  properties: {
    color: {
      default: themeVars.color.text,
      strong: themeVars.color.textStrong,
      muted: themeVars.color.textMuted,
      weak: themeVars.color.textWeak,
      link: themeVars.color.link,
    },
    background: {
      canvas: themeVars.color.background,
      surface: themeVars.color.surface,
      surfaceSoft: themeVars.color.surfaceSoft,
    },
    borderColor: {
      soft: themeVars.color.borderSoft,
      default: themeVars.color.border,
      strong: themeVars.color.borderStrong,
    },
    borderRadius: themeVars.radius,
    boxShadow: {
      sm: themeVars.shadow.sm,
      md: themeVars.shadow.md,
    },
    fontSize: {
      xs: themeVars.fontSize.xs,
      sm: themeVars.fontSize.sm,
      md: themeVars.fontSize.md,
      lg: themeVars.fontSize.lg,
    },
    lineHeight: {
      tight: themeVars.lineHeight.tight,
      normal: themeVars.lineHeight.normal,
      relaxed: themeVars.lineHeight.relaxed,
    },
  },
});

export const sprinkles = createSprinkles(responsiveProperties, visualProperties);
