import { site } from "$lib/config/site";
import { absolutizeUrls } from "$lib/server/absolutize-urls";
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

const toPubDate = (date: Date) => date.toUTCString();

// Article HTML can contain a literal "]]>" (e.g. inside code samples), which
// would terminate the CDATA section early — split it across two sections.
const escapeCdata = (html: string): string => html.replace(/\]\]>/g, "]]]]><![CDATA[>");

export const GET: RequestHandler = async () => {
  const posts = await getPosts();
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${site.url}/posts/${post.slug}/</link>
      <guid isPermaLink="true">${site.url}/posts/${post.slug}/</guid>
      <pubDate>${toPubDate(post.publishedAt)}</pubDate>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
      <description>${escapeXml(post.description)}</description>
      <content:encoded><![CDATA[${escapeCdata(absolutizeUrls(post.html, `${site.url}/posts/${post.slug}/`))}]]></content:encoded>
    </item>`,
    )
    .join("\n");
  const lastUpdate = Math.max(...posts.map((p) => (p.updatedAt ?? p.publishedAt).getTime()), 0);
  const lastBuildDate = toPubDate(lastUpdate ? new Date(lastUpdate) : new Date());
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${site.url}/</link>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(site.description)}</description>
    <language>ja</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
