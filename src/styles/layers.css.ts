import { globalLayer, layer } from "@vanilla-extract/css";

globalLayer("reset");
globalLayer("theme");
globalLayer("base");
globalLayer("sprinkles");
globalLayer("components");
globalLayer("utilities");

export const resetLayer = layer("reset");
export const themeLayer = layer("theme");
export const baseLayer = layer("base");
export const sprinklesLayer = layer("sprinkles");
export const componentsLayer = layer("components");
export const utilitiesLayer = layer("utilities");
