import { globalStyle, style } from "@vanilla-extract/css";
import { card } from "../../../components/card/Card.css";
import { sprinkles } from "../../sprinkles.css";
import { themeVars } from "../../vars.css";

export const blogArticleLayout = style({
  width: `min(${themeVars.layout.page}, 100%)`,
  marginBlock: 0,
  marginInline: "auto",
  paddingBlockEnd: themeVars.spacing.xl,
});

export const blogBackLinkContainer = sprinkles({
  marginBlockEnd: "md",
});

export const blogBackLink = style([
  sprinkles({
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "pill",
    background: "surfaceFloating",
    color: "muted",
    fontSize: "xs",
    paddingBlock: "xs",
    paddingInline: "sm",
    textDecoration: "none",
  }),
  {
    border: `${themeVars.borderWidth.thin} solid ${themeVars.color.border}`,
    backdropFilter: `blur(${themeVars.effect.blur})`,
    WebkitBackdropFilter: `blur(${themeVars.effect.blur})`,
    selectors: {
      "&:hover": {
        color: themeVars.color.textStrong,
        backgroundColor: themeVars.color.surfaceActive,
        borderColor: themeVars.color.borderStrong,
      },
    },
  },
]);

export const blogArticleHeader = style([
  card,
  {
    marginBlockEnd: themeVars.spacing.lg,
    paddingBlock: themeVars.spacing.lg,
    paddingInline: themeVars.spacing.lg,
    borderRadius: themeVars.radius.lg,
  },
]);

export const blogArticleTitle = style({
  margin: `0 0 ${themeVars.spacing.sm}`,
  fontSize: themeVars.fontSize["2xl"],
  lineHeight: themeVars.lineHeight.tight,
});

export const blogArticleMeta = style({
  display: "flex",
  flexWrap: "wrap",
  gap: `${themeVars.spacing.sm} ${themeVars.spacing.md}`,
  fontSize: themeVars.fontSize.xs,
  opacity: 0.7,
});

export const blogArticleDescription = style({
  marginBlockStart: themeVars.spacing.md,
  lineHeight: themeVars.lineHeight.relaxed,
  opacity: 0.85,
});

export const blogArticleContent = style([
  card,
  {
    paddingBlock: themeVars.spacing.sm,
    paddingInline: themeVars.spacing.lg,
    borderRadius: themeVars.radius.lg,
    lineHeight: themeVars.lineHeight.relaxed,
    minWidth: 0,
    overflowX: "clip",
  },
]);

const prose = (sel: string) => `${blogArticleContent} :where(${sel})`;

globalStyle(prose("h1, h2, h3, h4, h5, h6"), {
  marginBlockStart: themeVars.spacing.xl,
  marginBlockEnd: themeVars.spacing.sm,
  lineHeight: themeVars.lineHeight.tight,
  color: themeVars.color.textStrong,
});

globalStyle(prose("h1"), {
  fontSize: `clamp(${themeVars.fontSize.xl}, 1.5vw, ${themeVars.fontSize["2xl"]})`,
});

globalStyle(prose("h2"), {
  fontSize: `clamp(${themeVars.fontSize.lg}, 1.35vw, ${themeVars.fontSize.xl})`,
});

globalStyle(prose("h3"), {
  fontSize: `clamp(${themeVars.fontSize.md}, 1.2vw, ${themeVars.fontSize.xl})`,
});

globalStyle(prose("p, ul, ol, pre, blockquote, table, details"), {
  marginBlock: themeVars.spacing.md,
});

globalStyle(prose("table"), {
  width: "100%",
  tableLayout: "auto",
  borderCollapse: "collapse",
  border: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
  borderRadius: themeVars.radius.sm,
  overflow: "hidden",
  background: themeVars.color.surfaceFloating,
});

globalStyle(prose("th, td"), {
  paddingBlock: themeVars.spacing.sm,
  paddingInline: themeVars.spacing.md,
  textAlign: "left",
  verticalAlign: "top",
  borderBlockEnd: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
  wordBreak: "normal",
  overflowWrap: "anywhere",
});

globalStyle(prose("th"), {
  fontWeight: themeVars.fontWeight.bold,
  color: themeVars.color.textStrong,
  background: themeVars.color.surfaceSoft,
});

globalStyle(prose("tbody tr:last-child td"), {
  borderBlockEnd: 0,
});

globalStyle(prose("ul, ol"), {
  paddingInlineStart: themeVars.spacing.xl,
});

globalStyle(prose("li + li"), {
  marginBlockStart: themeVars.spacing.xs,
});

globalStyle(prose("a"), {
  color: themeVars.color.textStrong,
  textDecorationColor: themeVars.color.borderStrong,
  textUnderlineOffset: "0.12em",
});

globalStyle(prose("a:hover"), {
  textDecorationColor: themeVars.color.textStrong,
});

globalStyle(prose("a:focus-visible"), {
  outline: `${themeVars.borderWidth.thick} solid ${themeVars.color.focusRing}`,
  outlineOffset: "2px",
});

globalStyle(prose("code"), {
  fontFamily: "'Fira Code', 'Cascadia Code', 'SFMono-Regular', Menlo, Consolas, monospace",
  fontSize: themeVars.fontSize.md,
  paddingBlock: themeVars.spacing.xs,
  paddingInline: themeVars.spacing.xs,
  borderRadius: themeVars.radius.sm,
  background: themeVars.color.surfaceSoft,
  border: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
});

globalStyle(prose("pre"), {
  overflowX: "auto",
  paddingBlock: themeVars.spacing.md,
  paddingInline: themeVars.spacing.md,
  borderRadius: themeVars.radius.md,
  background: themeVars.color.surfaceSoft,
  border: `${themeVars.borderWidth.thin} solid ${themeVars.color.border}`,
});

globalStyle(prose("pre > code"), {
  display: "block",
  padding: 0,
  border: 0,
  background: "transparent",
});

globalStyle(prose("blockquote"), {
  paddingInlineStart: themeVars.spacing.lg,
  borderInlineStart: `${themeVars.borderWidth.thick} solid ${themeVars.color.borderStrong}`,
  color: themeVars.color.textMuted,
});

globalStyle(prose("img, video"), {
  borderRadius: themeVars.radius.sm,
  border: `${themeVars.borderWidth.thin} solid ${themeVars.color.borderSoft}`,
});
