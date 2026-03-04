import type { GlobalStyleRule, StyleRule } from "@vanilla-extract/css";

type MotionRule = StyleRule | GlobalStyleRule;
type MediaQueryWrappedRule<TRule extends MotionRule> = {
  "@media": Record<string, TRule>;
};

export const prefersReducedMotionQuery = "(prefers-reduced-motion: reduce)";

export const withReducedMotion = <TRule extends MotionRule>(
  rule: TRule,
): MediaQueryWrappedRule<TRule> => ({
  "@media": {
    [prefersReducedMotionQuery]: rule,
  },
});
