// Syncs Zenn article metadata into content/generated/zenn.json.
// Run via `pnpm sync:zenn`. Uses the official unauthenticated RSS feed:
// https://zenn.dev/<user>/feed?all=1
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import { fetchText, toExternalPost, USERNAME, writePosts, type ExternalPost } from "./external-posts.ts";

const zennItem = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
  category: z.array(z.string()).optional(),
});

const xml = await fetchText(`https://zenn.dev/${USERNAME}/feed?all=1`);
const doc = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => name === "item" || name === "category",
}).parse(xml);
const items = (doc?.rss?.channel?.item ?? []) as unknown[];

const posts = items.flatMap((item): ExternalPost[] => {
  const parsed = zennItem.safeParse(item);
  if (!parsed.success) {
    console.warn("[sync] zenn: skipping malformed item", parsed.error.issues);
    return [];
  }
  const { title, link, pubDate, category } = parsed.data;
  const post = toExternalPost({
    title,
    url: link,
    publishedAt: pubDate,
    // Zenn emits topics as <category> — keep the dependency on that
    // structure localized to this line; absent categories yield [].
    tags: category ?? [],
    source: "zenn",
  });
  return post ? [post] : [];
});

writePosts("zenn", posts);
