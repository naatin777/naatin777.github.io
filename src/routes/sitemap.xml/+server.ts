import { resolve } from "$app/paths";
import { navItems } from "#lib/config/nav.js";
import { site } from "#lib/config/site.js";
import { getPosts } from "#lib/server/posts.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

// static pages derive from the shared nav config — add new routes there
const staticPages = ["/", ...navItems.map((item) => item.href)];

const toDate = (date: Date) => date.toISOString().slice(0, 10);

export const GET: RequestHandler = async () => {
  const posts = await getPosts();
  const seriesSlugs = new Set(posts.flatMap((post) => (post.seriesSlug ? [post.seriesSlug] : [])));
  const urls = [
    ...staticPages.map((path) => `  <url><loc>${site.url}${path}</loc></url>`),
    // /series/ always exists (it renders an empty state without series).
    `  <url><loc>${site.url}${resolve("series/")}</loc></url>`,
    ...[...seriesSlugs].map(
      (slug) => `  <url><loc>${site.url}${resolve(`series/${encodeURIComponent(slug)}/`)}</loc></url>`,
    ),
    ...posts.map(
      (post) =>
        `  <url><loc>${site.url}${resolve(`posts/${post.slug}/`)}</loc><lastmod>${toDate(post.updatedAt)}</lastmod></url>`,
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
