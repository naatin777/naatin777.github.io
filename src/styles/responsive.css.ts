import type { GlobalStyleRule, StyleRule } from "@vanilla-extract/css";

const breakpoints = {
  mobileMax: 640,
  tabletMax: 960,
} as const;

export const mediaQueries = {
  mobile: `screen and (width <= ${breakpoints.mobileMax}px)`,
  tablet: `screen and (${breakpoints.mobileMax}px < width <= ${breakpoints.tabletMax}px)`,
  desktop: `screen and (${breakpoints.tabletMax}px < width)`,
} as const;

type ResponsiveRule = StyleRule | GlobalStyleRule;
type MediaQueryWrappedRule<TRule extends ResponsiveRule> = {
  "@media": Record<string, TRule>;
};

const withMediaQuery = <TRule extends ResponsiveRule>(
  query: string,
  rule: TRule,
): MediaQueryWrappedRule<TRule> => ({
  "@media": {
    [query]: rule,
  },
});

export const withMobile = <TRule extends ResponsiveRule>(
  rule: TRule,
): MediaQueryWrappedRule<TRule> => withMediaQuery(mediaQueries.mobile, rule);

export const withTablet = <TRule extends ResponsiveRule>(
  rule: TRule,
): MediaQueryWrappedRule<TRule> => withMediaQuery(mediaQueries.tablet, rule);

export const withDesktop = <TRule extends ResponsiveRule>(
  rule: TRule,
): MediaQueryWrappedRule<TRule> => withMediaQuery(mediaQueries.desktop, rule);
