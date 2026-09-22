// Single source of truth for article sources.
// When adding a source, update this file — ArticleCard badges, the
// /articles/ source filter, and ArticleItem.source all derive from it.
export type ArticleSource = "blog" | "zenn" | "qiita";

export const sourceOrder: ArticleSource[] = ["blog", "zenn", "qiita"];

export const sourceLabels: Record<ArticleSource, string> = {
  blog: "Blog",
  zenn: "Zenn",
  qiita: "Qiita",
};

export const sourceStyles: Record<ArticleSource, string> = {
  blog: "border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-[#7048d8] dark:text-[#a78bfa]",
  zenn: "border-[#3ea8ff]/50 bg-[#3ea8ff]/10 text-[#1a85d6] dark:text-[#74c0ff]",
  qiita: "border-[#55c500]/50 bg-[#55c500]/10 text-[#3d8f00] dark:text-[#7ed321]",
};
