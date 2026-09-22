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
  const toNavItem = (post?: (typeof posts)[number]) => (post ? { slug: post.slug, title: post.title } : null);
  return {
    post,
    prev: toNavItem(posts[index - 1]), // newer
    next: toNavItem(posts[index + 1]), // older
  };
};
