// Syncs external article metadata into content/generated/external-posts.json.
// Run explicitly via `pnpm sync:external-posts` — the SvelteKit build never
// touches the network and only reads the generated file.
//
// Sources (both official, unauthenticated):
//   Zenn  — RSS feed: https://zenn.dev/<user>/feed?all=1
//   Qiita — API v2:   https://qiita.com/api/v2/users/<user>/items
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const USERNAME = "naatin777";
const OUT_FILE = "content/generated/external-posts.json";
const FETCH_TIMEOUT_MS = 15_000;

const zennItem = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
  category: z.array(z.string()).optional(),
});

const qiitaItem = z.object({
  title: z.string(),
  url: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  private: z.boolean().optional(),
  tags: z.array(z.object({ name: z.string() })).default([]),
});

const fetchText = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.text();
};

// Required per the design: title/publishedAt/url must be present and the
// date must parse; otherwise skip the item loudly instead of emitting
// broken data.
const toExternalPost = ({ title, url, publishedAt, updatedAt, tags, source }) => {
  const timestamp = Date.parse(publishedAt);
  if (!title || !url || Number.isNaN(timestamp)) {
    console.warn(`[sync] ${source}: skipping item with missing/invalid fields (${title ?? url ?? "?"})`);
    return null;
  }
  const post = { title, tags, publishedAt: new Date(timestamp).toISOString(), url, source };
  if (updatedAt && !Number.isNaN(Date.parse(updatedAt))) {
    post.updatedAt = new Date(updatedAt).toISOString();
  }
  return post;
};

async function fetchZennPosts() {
  const xml = await fetchText(`https://zenn.dev/${USERNAME}/feed?all=1`);
  const doc = new XMLParser({
    ignoreAttributes: true,
    isArray: (name) => name === "item" || name === "category",
  }).parse(xml);
  const items = doc?.rss?.channel?.item ?? [];

  return items.flatMap((item) => {
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
}

async function fetchQiitaPosts() {
  const PER_PAGE = 100;
  const MAX_PAGES = 10;
  const posts = [];
  /* oxlint-disable no-await-in-loop -- each page depends on the previous page's item count */
  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = await fetchText(`https://qiita.com/api/v2/users/${USERNAME}/items?per_page=${PER_PAGE}&page=${page}`);
    const items = JSON.parse(body);
    if (!Array.isArray(items)) throw new Error("unexpected response shape (not an array)");
    for (const raw of items) {
      const parsed = qiitaItem.safeParse(raw);
      if (!parsed.success) {
        console.warn("[sync] qiita: skipping malformed item", parsed.error.issues);
        continue;
      }
      if (parsed.data.private === true) continue;
      const { title, url, created_at, updated_at, tags } = parsed.data;
      const post = toExternalPost({
        title,
        url,
        publishedAt: created_at,
        updatedAt: updated_at,
        tags: tags.map((tag) => tag.name),
        source: "qiita",
      });
      if (post) posts.push(post);
    }
    if (items.length < PER_PAGE) break;
  }
  /* oxlint-enable no-await-in-loop */
  return posts;
}

const fetchers = { zenn: fetchZennPosts, qiita: fetchQiitaPosts };
const results = await Promise.all(
  Object.entries(fetchers).map(async ([source, run]) => {
    try {
      return await run();
    } catch (error) {
      throw new Error(`${source}: ${error instanceof Error ? error.message : error}`, {
        cause: error,
      });
    }
  }),
);
const posts = results.flat().toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

if (posts.length === 0) throw new Error("no posts fetched from any source — not overwriting");

// Write via temp+rename so a crash mid-write can't corrupt the existing file.
mkdirSync("content/generated", { recursive: true });
const tmpFile = `${OUT_FILE}.tmp`;
writeFileSync(tmpFile, `${JSON.stringify(posts, null, 2)}\n`);
renameSync(tmpFile, OUT_FILE);
console.log(`[sync] wrote ${posts.length} posts (${posts.map((p) => p.source).join(", ")}) -> ${OUT_FILE}`);
