// Syncs Qiita article metadata into content/generated/qiita.json.
// Run via `pnpm sync:qiita`. Uses the unauthenticated Qiita API v2:
// https://qiita.com/api/v2/users/<user>/items (paginated, 100/page).
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { z } from "zod";

const USERNAME = "naatin777";
const OUT_FILE = "content/generated/qiita.json";
const PER_PAGE = 100;
const MAX_PAGES = 10;

const qiitaItem = z.object({
  title: z.string(),
  url: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  private: z.boolean().optional(),
  tags: z.array(z.object({ name: z.string() })).default([]),
});

type Post = {
  title: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  url: string;
  source: "qiita";
};

const posts: Post[] = [];
/* oxlint-disable no-await-in-loop -- each page depends on the previous page's item count */
for (let page = 1; page <= MAX_PAGES; page++) {
  const res = await fetch(`https://qiita.com/api/v2/users/${USERNAME}/items?per_page=${PER_PAGE}&page=${page}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`qiita api responded ${res.status}`);
  const items: unknown = await res.json();
  if (!Array.isArray(items)) throw new Error("unexpected response shape (not an array)");
  for (const raw of items) {
    const parsed = qiitaItem.safeParse(raw);
    if (!parsed.success) {
      console.warn("[sync] qiita: skipping malformed item", parsed.error.issues);
      continue;
    }
    if (parsed.data.private === true) continue;
    const { title, url, created_at, updated_at, tags } = parsed.data;
    const timestamp = Date.parse(created_at);
    if (!title || !url || Number.isNaN(timestamp)) {
      console.warn(`[sync] qiita: skipping item with missing/invalid fields (${title || url || "?"})`);
      continue;
    }
    const post: Post = {
      title,
      tags: tags.map((tag) => tag.name),
      publishedAt: new Date(timestamp).toISOString(),
      url,
      source: "qiita",
    };
    if (updated_at && !Number.isNaN(Date.parse(updated_at))) {
      post.updatedAt = new Date(updated_at).toISOString();
    }
    posts.push(post);
  }
  if (items.length < PER_PAGE) break;
}
/* oxlint-enable no-await-in-loop */

// Write via temp+rename so a crash mid-write can't corrupt the existing file;
// an empty fetch never overwrites real data.
if (posts.length === 0) throw new Error("qiita: fetched 0 posts — not overwriting");
mkdirSync("content/generated", { recursive: true });
writeFileSync(`${OUT_FILE}.tmp`, `${JSON.stringify(posts, null, 2)}\n`);
renameSync(`${OUT_FILE}.tmp`, OUT_FILE);
console.log(`[sync] wrote ${posts.length} qiita post(s) -> ${OUT_FILE}`);
