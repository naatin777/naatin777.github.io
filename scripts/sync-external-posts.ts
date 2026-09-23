// Syncs external article metadata into content/generated/external-posts.json.
// Run via `pnpm sync:external-posts` (both sources), `pnpm sync:zenn`, or
// `pnpm sync:qiita`. The SvelteKit build never touches the network — it only
// reads the generated file.
//
// Sources (both official, unauthenticated):
//   Zenn  — RSS feed: https://zenn.dev/<user>/feed?all=1
//   Qiita — API v2:   https://qiita.com/api/v2/users/<user>/items
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
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

// Shape of one record in the generated file. `source` is the merge key when
// only a subset of sources is synced.
const externalPost = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  url: z.string(),
  source: z.enum(["zenn", "qiita"]),
});
type ExternalPost = z.infer<typeof externalPost>;
type Source = ExternalPost["source"];

const fetchText = async (url: string): Promise<string> => {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.text();
};

// title/publishedAt/url must be present and the date must parse; otherwise
// skip the item loudly instead of emitting broken data.
const toExternalPost = (input: {
  title: string;
  url: string;
  publishedAt: string;
  updatedAt?: string | undefined;
  tags: string[];
  source: Source;
}): ExternalPost | null => {
  const { title, url, publishedAt, updatedAt, tags, source } = input;
  const timestamp = Date.parse(publishedAt);
  if (!title || !url || Number.isNaN(timestamp)) {
    console.warn(`[sync] ${source}: skipping item with missing/invalid fields (${title || url || "?"})`);
    return null;
  }
  const post: ExternalPost = {
    title,
    tags,
    publishedAt: new Date(timestamp).toISOString(),
    url,
    source,
  };
  if (updatedAt && !Number.isNaN(Date.parse(updatedAt))) {
    post.updatedAt = new Date(updatedAt).toISOString();
  }
  return post;
};

async function fetchZennPosts(): Promise<ExternalPost[]> {
  const xml = await fetchText(`https://zenn.dev/${USERNAME}/feed?all=1`);
  const doc = new XMLParser({
    ignoreAttributes: true,
    isArray: (name) => name === "item" || name === "category",
  }).parse(xml);
  const items: unknown = doc?.rss?.channel?.item ?? [];

  return (items as unknown[]).flatMap((item) => {
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

async function fetchQiitaPosts(): Promise<ExternalPost[]> {
  const PER_PAGE = 100;
  const MAX_PAGES = 10;
  const posts: ExternalPost[] = [];
  /* oxlint-disable no-await-in-loop -- each page depends on the previous page's item count */
  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = await fetchText(`https://qiita.com/api/v2/users/${USERNAME}/items?per_page=${PER_PAGE}&page=${page}`);
    const items: unknown = JSON.parse(body);
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

const fetchers: Record<Source, () => Promise<ExternalPost[]>> = {
  zenn: fetchZennPosts,
  qiita: fetchQiitaPosts,
};

// `pnpm sync:zenn` / `pnpm sync:qiita` sync just that source; no args = all.
const requested = process.argv.slice(2);
const sources = (requested.length > 0 ? requested : Object.keys(fetchers)) as Source[];
for (const source of sources) {
  if (!(source in fetchers)) {
    throw new Error(`unknown source "${source}" — expected: ${Object.keys(fetchers).join(", ")}`);
  }
}

const fresh = await Promise.all(
  sources.map(async (source) => {
    try {
      return await fetchers[source]();
    } catch (error) {
      throw new Error(`${source}: ${error instanceof Error ? error.message : error}`, {
        cause: error,
      });
    }
  }),
);

// Records of non-requested sources are kept as-is so a partial sync doesn't
// drop data it didn't refresh.
let existing: ExternalPost[] = [];
if (existsSync(OUT_FILE)) {
  const parsed = z.array(externalPost).safeParse(JSON.parse(readFileSync(OUT_FILE, "utf8")));
  if (!parsed.success) {
    throw new Error(`${OUT_FILE} is malformed — delete it and re-run the full sync`, {
      cause: parsed.error,
    });
  }
  existing = parsed.data.filter((post) => !sources.includes(post.source));
}

const posts = [...existing, ...fresh.flat()].toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
if (posts.length === 0) throw new Error("no posts to write — not overwriting");

// Write via temp+rename so a crash mid-write can't corrupt the existing file.
mkdirSync("content/generated", { recursive: true });
const tmpFile = `${OUT_FILE}.tmp`;
writeFileSync(tmpFile, `${JSON.stringify(posts, null, 2)}\n`);
renameSync(tmpFile, OUT_FILE);
console.log(`[sync] wrote ${posts.length} posts (${sources.join(" + ")} synced) -> ${OUT_FILE}`);
