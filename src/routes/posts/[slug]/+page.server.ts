import { error } from "@sveltejs/kit";
import { getPosts, type Post } from "$lib/server/posts";
import type { PostLink } from "$lib/types";
import type { EntryGenerator, PageServerLoad } from "./$types";

const toPostLink = (item?: Post): PostLink | null => (item ? { slug: item.slug, title: item.title } : null);

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
          .toSorted((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
          .map((p) => ({ slug: p.slug, title: p.title })),
      }
    : null;
  return {
    post,
    prev: toPostLink(posts[index - 1]), // newer
    next: toPostLink(posts[index + 1]), // older
    series,
  };
};
