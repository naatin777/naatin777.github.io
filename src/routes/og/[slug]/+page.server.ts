import { getPosts } from "$lib/server/posts";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = async () => (await getPosts()).map((post) => ({ slug: post.slug }));

export const load: PageServerLoad = async ({ params }) => {
  const post = (await getPosts()).find((p) => p.slug === params.slug);
  if (!post) error(404);
  return { title: post.title, publishedAt: post.publishedAt.toISOString(), tags: post.tags };
};
