// Single source of truth for article sources.
// When adding a source, update this file — ArticleCard badges, the
// /articles/ source filter, and ArticleItem.source all derive from it.
// Badge styling is the `.badge-{source}` naming convention in app.css.
export const sourceOrder = ["blog", "zenn", "qiita"] as const;

export type ArticleSource = (typeof sourceOrder)[number];

export const sourceLabels: Record<ArticleSource, string> = {
  blog: "Blog",
  zenn: "Zenn",
  qiita: "Qiita",
};
