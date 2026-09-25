import { defaultLang } from "$lib/config/i18n";
import { author, site } from "$lib/config/site";
import { absolutizeUrls } from "$lib/server/absolutize-urls";
import { getPosts, type Post } from "$lib/server/posts";
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

const itemXml = (post: Post): string => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${site.url}/posts/${post.slug}/</link>
      <guid isPermaLink="true">${site.url}/posts/${post.slug}/</guid>
      <pubDate>${toPubDate(post.publishedAt)}</pubDate>
      <dc:creator>${escapeXml(author.displayName)}</dc:creator>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
      <description>${escapeXml(post.description)}</description>
      <content:encoded><![CDATA[${escapeCdata(absolutizeUrls(post.html, `${site.url}/posts/${post.slug}/`))}]]></content:encoded>
    </item>`;

export const GET: RequestHandler = async () => {
  const posts = await getPosts();
  const items = posts.map(itemXml).join("\n");
  const lastUpdate = Math.max(...posts.map((p) => (p.updatedAt ?? p.publishedAt).getTime()), 0);
  const lastBuildDate = toPubDate(lastUpdate ? new Date(lastUpdate) : new Date());
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${site.url}/</link>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(site.description)}</description>
    <language>${defaultLang}</language>
    <image>
      <url>${site.url}/apple-touch-icon.png</url>
      <title>${escapeXml(site.title)}</title>
      <link>${site.url}/</link>
    </image>
    <!-- sync runs weekly — 12h is a reasonable polling hint for readers -->
    <ttl>720</ttl>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
