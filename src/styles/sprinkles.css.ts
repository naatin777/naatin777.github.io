import { defineProperties, createSprinkles } from "@vanilla-extract/sprinkles";
import { themeVars } from "./vars.css";
import { sprinklesLayer } from "./layers.css";
import { media } from "./responsive.css";

const responsiveProperties = defineProperties({
  "@layer": sprinklesLayer,
  conditions: {
    mobile: {},
    tablet: { "@media": media.tablet },
    desktop: { "@media": media.desktop },
  },
  defaultCondition: "mobile",
  properties: {
    display: ["none", "block", "flex", "grid", "inline-flex", "inline-grid"],
    flexDirection: ["row", "column"],
    flexWrap: ["nowrap", "wrap"],
    justifyContent: ["flex-start", "center", "flex-end", "space-between"],
    alignItems: ["stretch", "flex-start", "center", "flex-end"],
    justifySelf: ["start", "center", "end"],
    gap: themeVars.spacing,
    rowGap: themeVars.spacing,
    columnGap: themeVars.spacing,

    paddingInline: themeVars.spacing,
    paddingBlock: themeVars.spacing,
    paddingInlineStart: themeVars.spacing,
    paddingInlineEnd: themeVars.spacing,
    paddingBlockStart: themeVars.spacing,
    paddingBlockEnd: themeVars.spacing,

    marginInline: { ...themeVars.spacing, auto: "auto" },
    marginBlock: { ...themeVars.spacing, auto: "auto" },
    marginInlineStart: { ...themeVars.spacing, auto: "auto" },
    marginInlineEnd: { ...themeVars.spacing, auto: "auto" },
    marginBlockStart: { ...themeVars.spacing, auto: "auto" },
    marginBlockEnd: { ...themeVars.spacing, auto: "auto" },

    width: {
      auto: "auto",
      full: "100%",
    },
    listStyle: ["none"],
    textAlign: ["left", "center", "right"],
    whiteSpace: ["nowrap"],
    textDecoration: ["none"],
    flexShrink: [0],
    maxWidth: {
      page: themeVars.layout.page,
      container: themeVars.layout.container,
      content: themeVars.layout.content,
      reading: themeVars.layout.reading,
    },
  },
});

const visualProperties = defineProperties({
  "@layer": sprinklesLayer,
  conditions: {
    default: {},
    hover: {
      selector: "&:hover",
    },
  },
  defaultCondition: "default",
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
      surfaceFloating: themeVars.color.surfaceFloating,
      surfaceHover: themeVars.color.surfaceHover,
      surfaceActive: themeVars.color.surfaceActive,
    },
    borderColor: {
      soft: themeVars.color.borderSoft,
      default: themeVars.color.border,
      strong: themeVars.color.borderStrong,
    },
    borderRadius: themeVars.radius,
    borderWidth: themeVars.borderWidth,
    boxShadow: {
      sm: themeVars.shadow.sm,
      md: themeVars.shadow.md,
      lg: themeVars.shadow.lg,
    },
    fontSize: {
      xs: themeVars.fontSize.xs,
      sm: themeVars.fontSize.sm,
      md: themeVars.fontSize.md,
      lg: themeVars.fontSize.lg,
      xl: themeVars.fontSize.xl,
      "2xl": themeVars.fontSize["2xl"],
      "3xl": themeVars.fontSize["3xl"],
      "4xl": themeVars.fontSize["4xl"],
      "5xl": themeVars.fontSize["5xl"],
    },
    fontWeight: themeVars.fontWeight,
    lineHeight: {
      tight: themeVars.lineHeight.tight,
      normal: themeVars.lineHeight.normal,
      relaxed: themeVars.lineHeight.relaxed,
    },
  },
});

export const sprinkles = createSprinkles(responsiveProperties, visualProperties);
