import { error } from "@sveltejs/kit";
import { getPosts } from "#lib/server/posts.js";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = async () => {
  const slugs = new Set((await getPosts()).flatMap((post) => (post.seriesSlug ? [post.seriesSlug] : [])));
  return [...slugs].map((slug) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  // Reading order: oldest first, the sequence the series is meant to be read in.
  const posts = (await getPosts())
    .filter((p) => p.seriesSlug === params.slug)
    .toSorted((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime() || a.slug.localeCompare(b.slug));
  if (posts.length === 0) error(404, "Series not found");
  return {
    // `posts[0].series` holds the display name; params.slug may be an ASCII slug.
    name: posts[0]?.series ?? params.slug,
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      publishedAt: p.publishedAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  };
};
