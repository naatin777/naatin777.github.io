// Shared helpers for the per-source sync scripts — the JSON shape written
// here is the contract consumed by src/lib/server/external-articles.ts.
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { z } from "zod";

export const USERNAME = "naatin777";
const GENERATED_DIR = "content/generated";
const FETCH_TIMEOUT_MS = 15_000;

const externalPost = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  url: z.string(),
  source: z.enum(["zenn", "qiita"]),
});
export type ExternalPost = z.infer<typeof externalPost>;
export type Source = ExternalPost["source"];

export const fetchText = async (url: string): Promise<string> => {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.text();
};

// title/publishedAt/url must be present and the date must parse; otherwise
// skip the item loudly instead of emitting broken data.
export const toExternalPost = (input: {
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

// Each source owns exactly one generated file. Writes go through temp+rename
// so a crash mid-write can't corrupt the last good file, and an empty fetch
// never overwrites real data.
export function writePosts(source: Source, posts: ExternalPost[]): void {
  if (posts.length === 0) throw new Error(`${source}: fetched 0 posts — not overwriting`);
  mkdirSync(GENERATED_DIR, { recursive: true });
  const file = `${GENERATED_DIR}/${source}.json`;
  const tmpFile = `${file}.tmp`;
  writeFileSync(tmpFile, `${JSON.stringify(posts, null, 2)}\n`);
  renameSync(tmpFile, file);
  console.log(`[sync] wrote ${posts.length} ${source} post(s) -> ${file}`);
}
