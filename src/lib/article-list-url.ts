import type { ReadonlyURL } from "$app/state";
import { sourceOrder, type ArticleSource } from "#lib/config/article-source.js";
import { sortKeys, sortOrders, type SortKey, type SortOrder } from "#lib/types.js";

interface ArticleListQuery {
  selected: Set<string>;
  selectedSource: ArticleSource | null;
  sortKey: SortKey;
  sortOrder: SortOrder;
}

export function parseArticleListUrl(url: ReadonlyURL, allTags: readonly string[]): ArticleListQuery {
  const selected = new Set<string>();
  for (const rawTag of url.searchParams.getAll("tag")) {
    const canonicalTag = allTags.find((tag) => tag.toLowerCase() === rawTag.toLowerCase());
    if (canonicalTag) selected.add(canonicalTag);
  }
  return {
    selected,
    selectedSource: sourceOrder.find((source) => source === url.searchParams.get("source")) ?? null,
    sortKey: sortKeys.find((key) => key === url.searchParams.get("sort")) ?? "published",
    sortOrder: sortOrders.find((order) => order === url.searchParams.get("order")) ?? "desc",
  };
}

// Keep unrelated query parameters and the fragment when publishing a view.
// Defaults are omitted to keep the default articles URL clean.
export function serializeArticleListUrl(currentUrl: ReadonlyURL, query: ArticleListQuery): URL {
  const url = new URL(currentUrl.href);
  url.searchParams.delete("tag");
  for (const tag of query.selected) url.searchParams.append("tag", tag);
  if (query.selectedSource) url.searchParams.set("source", query.selectedSource);
  else url.searchParams.delete("source");
  if (query.sortKey !== "published") url.searchParams.set("sort", query.sortKey);
  else url.searchParams.delete("sort");
  if (query.sortOrder !== "desc") url.searchParams.set("order", query.sortOrder);
  else url.searchParams.delete("order");
  return url;
}
