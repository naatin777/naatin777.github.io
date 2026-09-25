import { error } from "@sveltejs/kit";
import { getPosts } from "$lib/server/posts";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = async () => {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.slug === params.slug);
  const post = posts[index];
  if (!post) error(404, "Post not found");
  const series = post.series
    ? {
        name: post.series,
        posts: posts
          .filter((p) => p.series === post.series)
          .toSorted((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime() || a.slug.localeCompare(b.slug))
          .map((p) => ({ slug: p.slug, title: p.title })),
      }
    : null;
  // posts are sorted newest-first — "newer" is the previous index.
  const toLink = (p: (typeof posts)[number] | undefined) => (p === undefined ? null : { slug: p.slug, title: p.title });
  const newer = toLink(posts[index - 1]);
  const older = toLink(posts[index + 1]);
  return { post, series, newer, older };
};
