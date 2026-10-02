import { describe, expect, it } from "vitest";
import { parseArticleListUrl, serializeArticleListUrl } from "./article-list-url";

describe("article list URLs", () => {
  it("canonicalizes and deduplicates shared tags, ignoring unknown tags", () => {
    const query = parseArticleListUrl(
      new URL(
        "https://site.test/articles/?tag=svelte&tag=SVELTE&tag=TypeScript&tag=unknown&source=blog&sort=title&order=asc",
      ),
      ["Svelte", "TypeScript"],
    );
    expect(query).toEqual({
      selected: new Set(["Svelte", "TypeScript"]),
      selectedSource: "blog",
      sortKey: "title",
      sortOrder: "asc",
    });
  });

  it("uses defaults for missing or invalid query values", () => {
    for (const search of ["", "?source=unknown&sort=unknown&order=unknown"]) {
      expect(parseArticleListUrl(new URL(`https://site.test/articles/${search}`), [])).toEqual({
        selected: new Set(),
        selectedSource: null,
        sortKey: "published",
        sortOrder: "desc",
      });
    }
  });

  it("removes default filters without mutating the URL or losing unrelated parameters", () => {
    const original = new URL("https://site.test/articles/?tag=old&source=qiita&sort=title&order=asc&ref=shared#list");
    const defaults = parseArticleListUrl(new URL("https://site.test/articles/"), []);
    const result = serializeArticleListUrl(original, defaults);
    expect(result.href).toBe("https://site.test/articles/?ref=shared#list");
    expect(original.href).toBe("https://site.test/articles/?tag=old&source=qiita&sort=title&order=asc&ref=shared#list");
  });

  it("preserves tags with URL delimiters and non-default sorting in a round trip", () => {
    const query = {
      selected: new Set(["C++", "日本語 / 入門"]),
      selectedSource: "zenn" as const,
      sortKey: "updated" as const,
      sortOrder: "asc" as const,
    };
    const url = serializeArticleListUrl(new URL("https://site.test/articles/?tag=old"), query);
    expect(parseArticleListUrl(url, ["C++", "日本語 / 入門"])).toEqual(query);
  });
});
