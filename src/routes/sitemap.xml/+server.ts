import { navItems } from "$lib/config/nav";
import { site } from "$lib/config/site";
import { getPosts } from "$lib/server/posts";
import type { RequestHandler } from "./$types";

export const prerender = true;

// static pages derive from the shared nav config — add new routes there
const staticPages = ["/", ...navItems.map((item) => item.href)];

const toDate = (date: Date) => date.toISOString().split("T")[0];

export const GET: RequestHandler = async () => {
  const posts = await getPosts();
  const urls = [
    ...staticPages.map((path) => `  <url><loc>${site.url}${path}</loc></url>`),
    ...posts.map(
      (post) =>
        `  <url><loc>${site.url}/posts/${post.slug}/</loc><lastmod>${toDate(post.updatedAt ?? post.publishedAt)}</lastmod></url>`,
    ),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
