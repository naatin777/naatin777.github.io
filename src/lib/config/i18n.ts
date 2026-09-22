export const langs = ["ja", "en"] as const;
export type Lang = (typeof langs)[number];

export type LocalizedText = Record<Lang, string>;

export const defaultLang: Lang = "ja";

export const langNames: Record<Lang, string> = {
  ja: "日本語",
  en: "English",
};
