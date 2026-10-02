import { describe, expect, it } from "vitest";
import { loadPostsFrom } from "./posts";

const entry = (frontmatter: string, body = "body") => `---\n${frontmatter}\n---\n${body}`;

describe("loadPostsFrom", () => {
  it("skips drafts", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/draft/index.md": entry(
          "title: Draft\npublishedAt: 2026-03-01T00:00:00+09:00\ndraft: true",
        ),
        "/content/posts/2026/good/index.md": entry("title: Good\npublishedAt: 2026-03-03T00:00:00+09:00"),
      },
      {},
    );
    expect(posts.map((p) => p.slug)).toEqual(["good"]);
  });

  it("throws on malformed frontmatter, missing fields, and blank values", async () => {
    await expect(
      loadPostsFrom({ "/content/posts/2026/broken/index.md": "---\n: bad yaml\n---\nx" }, {}),
    ).rejects.toThrow("[posts] /content/posts/2026/broken/index.md");
    await expect(
      loadPostsFrom({ "/content/posts/2026/notitle/index.md": entry("publishedAt: 2026-03-02T00:00:00+09:00") }, {}),
    ).rejects.toThrow("[posts] /content/posts/2026/notitle/index.md");
    await expect(
      loadPostsFrom(
        {
          "/content/posts/2026/blank/index.md": entry("title: A\npublishedAt: 2026-03-01T00:00:00+09:00\ndescription:"),
        },
        {},
      ),
    ).rejects.toThrow("[posts] /content/posts/2026/blank/index.md");
  });

  it("throws on non-URL-safe or duplicate slugs", async () => {
    await expect(
      loadPostsFrom(
        { "/content/posts/2026/has space/index.md": entry("title: S\npublishedAt: 2026-03-01T00:00:00+09:00") },
        {},
      ),
    ).rejects.toThrow("[posts] /content/posts/2026/has space/index.md");
    await expect(
      loadPostsFrom(
        {
          "/content/posts/2026/dup/index.md": entry("title: A\npublishedAt: 2026-03-01T00:00:00+09:00"),
          "/content/posts/2027/dup/index.md": entry("title: B\npublishedAt: 2027-03-01T00:00:00+09:00"),
        },
        {},
      ),
    ).rejects.toThrow("[posts] /content/posts/2027/dup/index.md");
  });

  it("parses frontmatter dates with an explicit offset", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/date/index.md": entry("title: D\npublishedAt: 2026-03-08T00:00:00+09:00"),
        "/content/posts/2026/offset/index.md": entry("title: O\npublishedAt: 2026-03-08T23:00:45+09:00"),
      },
      {},
    );
    const bySlug = new Map(posts.map((p) => [p.slug, p]));
    expect(bySlug.get("date")?.publishedAt.toISOString()).toBe("2026-03-07T15:00:00.000Z");
    expect(bySlug.get("offset")?.publishedAt.toISOString()).toBe("2026-03-08T14:00:45.000Z");
  });

  it("rejects a bare frontmatter date without an offset", async () => {
    await expect(
      loadPostsFrom({ "/content/posts/2026/a/index.md": entry("title: A\npublishedAt: 2026-01-01") }, {}),
    ).rejects.toThrow("[posts] /content/posts/2026/a/index.md");
  });

  it("uses frontmatter updatedAt over the resolver, then falls back to it", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/explicit/index.md": entry(
          "title: E\npublishedAt: 2026-03-01T00:00:00+09:00\nupdatedAt: 2026-04-01T00:00:00+09:00",
        ),
        "/content/posts/2026/fallback/index.md": entry("title: F\npublishedAt: 2026-03-02T00:00:00+09:00"),
        "/content/posts/2026/none/index.md": entry("title: N\npublishedAt: 2026-03-03T00:00:00+09:00"),
      },
      {},
      (path) => (path.includes("none") ? null : new Date("2026-05-01T00:00:00Z")),
    );
    const bySlug = new Map(posts.map((p) => [p.slug, p]));
    expect(bySlug.get("explicit")?.updatedAt.toISOString()).toBe("2026-03-31T15:00:00.000Z");
    expect(bySlug.get("fallback")?.updatedAt.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    // no resolver result → publishedAt (updatedAt is never null downstream)
    expect(bySlug.get("none")?.updatedAt.toISOString()).toBe("2026-03-02T15:00:00.000Z");
  });

  it("resolves image paths against the post folder", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/a/index.md": entry(
          "title: A\npublishedAt: 2026-03-01T00:00:00+09:00",
          "![x](../markdown-test/sample.png)",
        ),
      },
      {
        "/content/posts/2026/markdown-test/sample.png": "/bundled/sample.png",
      },
    );
    expect(posts[0]?.html).toContain("/bundled/sample.png");
  });

  it("throws when a relative image is missing", async () => {
    await expect(
      loadPostsFrom(
        {
          "/content/posts/2026/a/index.md": entry("title: A\npublishedAt: 2026-03-01T00:00:00+09:00", "![x](gone.png)"),
        },
        {},
      ),
    ).rejects.toThrow("[posts] /content/posts/2026/a/index.md");
  });

  it("leaves external and absolute image srcs alone", async () => {
    const posts = await loadPostsFrom(
      {
        "/content/posts/2026/a/index.md": entry(
          "title: A\npublishedAt: 2026-03-01T00:00:00+09:00",
          "![x](https://example.com/x.png) ![y](/images/y.png)",
        ),
      },
      {},
    );
    expect(posts[0]?.html).toContain('src="https://example.com/x.png"');
    expect(posts[0]?.html).toContain('src="/images/y.png"');
  });

  it("rejects a frontmatter date without an offset", async () => {
    await expect(
      loadPostsFrom({ "/content/posts/2026/a/index.md": entry('title: A\npublishedAt: "2026-01-01 10:00"') }, {}),
    ).rejects.toThrow("[posts] /content/posts/2026/a/index.md");
  });
});
