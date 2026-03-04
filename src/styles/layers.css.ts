import { globalLayer, layer, type GlobalStyleRule, type StyleRule } from "@vanilla-extract/css";

export const resetLayer = globalLayer("reset");
export const baseLayer = globalLayer("base");
export const componentLayer = globalLayer("component");
export const utilitiesLayer = globalLayer("utilities");

export const themeLayer = layer({ parent: baseLayer }, "theme");

type LayeredRule = StyleRule | GlobalStyleRule;

const withLayer = <TRule extends LayeredRule>(targetLayer: string, rule: TRule): TRule =>
  ({
    "@layer": {
      [targetLayer]: rule,
    },
  }) as TRule;

export const withResetLayer = <TRule extends LayeredRule>(rule: TRule): TRule =>
  withLayer(resetLayer, rule);

export const withBaseLayer = <TRule extends LayeredRule>(rule: TRule): TRule =>
  withLayer(baseLayer, rule);

export const withComponentLayer = <TRule extends LayeredRule>(rule: TRule): TRule =>
  withLayer(componentLayer, rule);

export const withUtilitiesLayer = <TRule extends LayeredRule>(rule: TRule): TRule =>
  withLayer(utilitiesLayer, rule);
