import { author, site } from "$lib/config/site";
import { getPosts } from "$lib/server/posts";
import type { RequestHandler } from "./$types";

export const prerender = true;

const escapeXml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toRfc822 = (date: Date) => date.toUTCString();

export const GET: RequestHandler = async () => {
  const posts = await getPosts();
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${site.url}/posts/${post.slug}/</link>
      <guid isPermaLink="true">${site.url}/posts/${post.slug}/</guid>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${site.url}/</link>
    <description>${escapeXml(site.description)}</description>
    <language>ja</language>
    <managingEditor>${escapeXml(author.displayName)}</managingEditor>
${items}
  </channel>
</rss>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
