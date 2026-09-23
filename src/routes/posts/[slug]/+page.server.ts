import { error } from "@sveltejs/kit";
import { getPosts } from "$lib/server/posts";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = async () => {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) error(404, "Post not found");
  const series = post.series
    ? {
        name: post.series,
        posts: posts
          .filter((p) => p.series === post.series)
          .toSorted((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
          .map((p) => ({ slug: p.slug, title: p.title })),
      }
    : null;
  return { post, series };
};
