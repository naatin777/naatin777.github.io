import { getExternalArticles, type ArticleItem } from "$lib/server/external-articles";
import { getPosts } from "$lib/server/posts";

const toTimestamp = (value: string | null): number => {
  const parsed = value ? Date.parse(value) : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

// Blog posts + external articles merged into one list, newest first.
export async function getAllArticles(): Promise<ArticleItem[]> {
  const external = await getExternalArticles();
  const posts: ArticleItem[] = (await getPosts()).map((post) => ({
    title: post.title,
    url: `/posts/${post.slug}/`,
    tags: post.tags,
    source: "blog",
    series: post.series,
    publishedAt: post.publishedAt.toISOString(),
    updatedAt: (post.updatedAt ?? post.publishedAt).toISOString(),
  }));
  return [...external, ...posts].toSorted((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt));
}
