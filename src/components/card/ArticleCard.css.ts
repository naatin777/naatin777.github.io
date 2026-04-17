import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { sprinkles } from "../../styles/sprinkles.css";
import { themeVars } from "../../styles/vars.css";

export const articleCard = style([
  sprinkles({
    display: "flex",
    flexDirection: "column",
    width: "full",
    paddingBlock: "md",
    paddingInline: "lg",
  }),
  {
    overflow: "hidden",
  },
]);

export const articleCardHeader = sprinkles({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "sm",
  flexWrap: "wrap",
  width: "full",
});

export const articleCardSourceBadge = recipe({
  base: [
    sprinkles({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "lg",
      color: "muted",
      paddingInline: "sm",
      paddingBlock: "xs",
      fontSize: "xs",
      whiteSpace: "nowrap",
    }),
    {
      border: `${themeVars.borderWidth.thin} solid ${themeVars.color.border}`,
      transition: `border-color ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}, background-color ${themeVars.motion.duration.normal} ${themeVars.motion.easing.standard}`,
    },
  ],
  variants: {
    tone: {
      default: {
        backgroundColor: themeVars.color.surfaceFloating,
      },
      blog: {
        backgroundColor: themeVars.color.accent.blogBg,
        borderColor: themeVars.color.accent.blogBorder,
      },
      qiita: {
        backgroundColor: themeVars.color.accent.qiitaBg,
        borderColor: themeVars.color.accent.qiitaBorder,
      },
      zenn: {
        backgroundColor: themeVars.color.accent.zennBg,
        borderColor: themeVars.color.accent.zennBorder,
      },
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export const articleCardMetaSection = style([
  sprinkles({
    marginBlockEnd: "xs",
    paddingBlockEnd: "sm",
  }),
  {
    borderBottom: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
  },
]);

export const articleCardContentSection = style([
  sprinkles({
    display: "flex",
    flexDirection: "column",
    gap: "sm",
    paddingBlock: "sm",
    paddingInline: "xs",
  }),
  {
    borderBottom: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
  },
]);

export const articleCardDateList = sprinkles({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: { mobile: "flex-start", tablet: "flex-end" },
  marginInlineStart: { mobile: "none", tablet: "auto" },
  gap: "sm",
});

export const articleCardTitle = sprinkles({
  fontSize: "md",
  lineHeight: "normal",
  fontWeight: "semibold",
  textDecoration: "none",
});

export const articleCardSummary = style([
  sprinkles({
    color: "muted",
    lineHeight: "normal",
    fontSize: "sm",
    textDecoration: "none",
  }),
  {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    WebkitLineClamp: 1,
    minWidth: 0,
  },
]);

export const articleCardLink = style([
  sprinkles({
    display: "flex",
    flexDirection: "column",
    gap: "sm",
    width: "full",
    textDecoration: "none",
  }),
  {
    color: "inherit",
    selectors: {
      "&:hover, &:focus-visible": {
        textDecoration: "underline",
        textUnderlineOffset: "0.2em",
      },
    },
  },
]);

export const articleCardTagList = sprinkles({
  listStyle: "none",
  display: "flex",
  flexWrap: "wrap",
  paddingBlockStart: "sm",
  gap: "sm",
});
