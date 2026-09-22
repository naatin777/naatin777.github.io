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
  const pick = (p?: (typeof posts)[number]) => (p ? { slug: p.slug, title: p.title } : null);
  return {
    post,
    prev: pick(posts[index - 1]), // newer
    next: pick(posts[index + 1]), // older
  };
};
