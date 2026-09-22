import { error } from "@sveltejs/kit";
import { getPosts } from "$lib/server/posts";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = async () => {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const post = (await getPosts()).find((p) => p.slug === params.slug);
  if (!post) error(404, "Post not found");
  return { post };
};
