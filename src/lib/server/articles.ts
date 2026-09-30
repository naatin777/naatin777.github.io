import { getExternalArticles, type ArticleItem } from "$lib/server/external-articles";
import { getPosts } from "$lib/server/posts";

// Blog posts + external articles merged into one list, newest first. Both
// sides carry validated ISO datetimes, so Date.parse is all we need.
export async function getAllArticles(): Promise<ArticleItem[]> {
  const posts = await getPosts();
  const external = getExternalArticles();
  const blog: ArticleItem[] = posts.map((post) => ({
    title: post.title,
    url: `/posts/${post.slug}/`,
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
