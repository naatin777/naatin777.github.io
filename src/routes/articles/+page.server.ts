import { getExternalArticles, type ArticleItem } from "$lib/server/articles";
import { getPosts } from "$lib/server/posts";
import type { PageServerLoad } from "./$types";

const time = (value: string | null): number => {
  const parsed = value ? Date.parse(value) : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const load: PageServerLoad = async () => {
  const external = await getExternalArticles();
  const posts: ArticleItem[] = (await getPosts()).map((post) => ({
    title: post.title,
    url: `/posts/${post.slug}/`,
    tags: post.tags,
    source: "blog",
    emoji: null,
    publishedAt: post.publishedAt.toISOString(),
    updatedAt: (post.updatedAt ?? post.publishedAt).toISOString(),
  }));

  const articles = [...external, ...posts].sort((a, b) => time(b.updatedAt) - time(a.updatedAt));

  return { articles };
};
