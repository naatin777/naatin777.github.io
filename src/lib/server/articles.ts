import { resolve } from "$app/paths";
import { getExternalArticles } from "#lib/server/external-articles.js";
import { getPosts } from "#lib/server/posts.js";
import type { ArticleItem } from "#lib/types.js";

// Blog posts + external articles merged into one list, newest first. Both
// sides carry validated ISO datetimes, so Date.parse is all we need.
export async function getAllArticles(): Promise<ArticleItem[]> {
  const posts = await getPosts();
  const external = getExternalArticles();
  const blog: ArticleItem[] = posts.map((post) => ({
    title: post.title,
    url: resolve(`posts/${post.slug}/`),
    tags: post.tags,
    source: "blog",
    series: post.series,
    seriesSlug: post.seriesSlug ?? undefined,
    publishedAt: post.publishedAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    description: post.description || undefined,
  }));
  return [...external, ...blog].toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
