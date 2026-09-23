import { parseDate } from "$lib/date";
import { getExternalArticles, type ArticleItem } from "$lib/server/external-articles";
import { getPosts } from "$lib/server/posts";

const toTimestamp = (value: string | null): number => {
  const parsed = value ? parseDate(value) : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

// Blog posts + external articles merged into one list, newest first.
export async function getAllArticles(): Promise<ArticleItem[]> {
  const [external, postsRaw] = await Promise.all([getExternalArticles(), getPosts()]);
  const posts: ArticleItem[] = postsRaw.map((post) => ({
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
