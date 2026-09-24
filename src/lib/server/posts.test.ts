import { describe, expect, it } from "vitest";
import { loadPostsFrom } from "./posts";

const entry = (frontmatter: string, body = "body") => `---\n${frontmatter}\n---\n${body}`;

describe("loadPostsFrom", () => {
  it("skips drafts, malformed frontmatter, and missing required fields", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/draft/index.md": entry("title: Draft\npublishedAt: 2026-03-01\ndraft: true"),
        "/content/posts/2026/draftstr/index.md": entry('title: DraftStr\npublishedAt: 2026-03-01\ndraft: "true"'),
        "/content/posts/2026/broken/index.md": "---\n: bad yaml\n---\nx",
        "/content/posts/2026/notitle/index.md": entry("publishedAt: 2026-03-02"),
        "/content/posts/2026/good/index.md": entry("title: Good\npublishedAt: 2026-03-03"),
      },
      {},
    );
    expect(posts.map((p) => p.slug)).toEqual(["good"]);
  });

  it("skips slugs that are not URL-safe", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/has space/index.md": entry("title: S\npublishedAt: 2026-03-01"),
        "/content/posts/2026/a&b/index.md": entry("title: A\npublishedAt: 2026-03-02"),
        "/content/posts/2026/ok-slug_1/index.md": entry("title: O\npublishedAt: 2026-03-03"),
      },
      {},
    );
    expect(posts.map((p) => p.slug)).toEqual(["ok-slug_1"]);
  });

  it("skips duplicate slugs across year folders", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/dup/index.md": entry("title: A\npublishedAt: 2026-03-01"),
        "/content/posts/2027/dup/index.md": entry("title: B\npublishedAt: 2027-03-01"),
      },
      {},
    );
    expect(posts).toHaveLength(1);
    expect(posts[0]?.slug).toBe("dup");
  });

  it("pins bare frontmatter dates to JST regardless of machine timezone", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/date/index.md": entry("title: D\npublishedAt: 2026-03-08"),
        "/content/posts/2026/time/index.md": entry("title: T\npublishedAt: 2026-03-08 23:00"),
        "/content/posts/2026/sec/index.md": entry("title: S\npublishedAt: 2026-03-08 23:00:45"),
        "/content/posts/2026/offset/index.md": entry("title: O\npublishedAt: 2026-03-08T23:00:45+09:00"),
      },
      {},
    );
    const bySlug = new Map(posts.map((p) => [p.slug, p]));
    expect(bySlug.get("date")?.publishedAt.toISOString()).toBe("2026-03-07T15:00:00.000Z");
    expect(bySlug.get("time")?.publishedAt.toISOString()).toBe("2026-03-08T14:00:00.000Z");
    expect(bySlug.get("sec")?.publishedAt.toISOString()).toBe("2026-03-08T14:00:45.000Z");
    expect(bySlug.get("offset")?.publishedAt.toISOString()).toBe("2026-03-08T14:00:45.000Z");
  });
});
