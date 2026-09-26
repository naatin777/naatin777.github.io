import { getPosts } from "$lib/server/posts";
import type { PageServerLoad } from "./$types";

// Series are a local-post concept — external articles can't belong to one.
export const load: PageServerLoad = async () => {
  const posts = await getPosts(); // newest-first
  const groups = new Map<string, typeof posts>();
  for (const post of posts) {
    if (!post.series) continue;
    const members = groups.get(post.series) ?? [];
    members.push(post);
    groups.set(post.series, members);
  }
  return {
    series: [...groups.entries()]
      .map(([name, members]) => {
        const latest = members[0];
        return latest
          ? {
              name,
              href: `/series/${encodeURIComponent(latest.seriesSlug ?? name)}/`,
              count: members.length,
              latestTitle: latest.title,
              latestAt: latest.publishedAt.toISOString(),
            }
          : null;
      })
      .filter((s) => s !== null)
      .toSorted((a, b) => Date.parse(b.latestAt) - Date.parse(a.latestAt)),
  };
};
