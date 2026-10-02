// Syncs Qiita article metadata into content/generated/qiita.json.
// Run via `pnpm sync:qiita`. Uses the unauthenticated Qiita API v2:
// https://qiita.com/api/v2/users/<user>/items (paginated, 100/page).
import { writeFileSync } from "node:fs";
import { z } from "zod";

import { author } from "#lib/config/site.ts";
// Type-only import: erased at runtime — external-articles' own #lib/*.js
// specifiers don't exist on disk, so it can't be a runtime import under
// node's type stripping.
import type { ExternalPost } from "#lib/server/external-articles.ts";

const OUT_FILE = "content/generated/qiita.json";
const PER_PAGE = 100;
const MAX_PAGES = 10;

const qiitaItemSchema = z.object({
  title: z.string(),
  url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  private: z.boolean().optional(),
  tags: z.array(z.object({ name: z.string() })),
});

const posts: ExternalPost[] = [];
/* oxlint-disable no-await-in-loop -- each page depends on the previous page's item count */
for (let page = 1; page <= MAX_PAGES; page++) {
  const res = await fetch(`https://qiita.com/api/v2/users/${author.handle}/items?per_page=${PER_PAGE}&page=${page}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`qiita api responded ${res.status}`);
  const items = z.array(qiitaItemSchema).parse(await res.json());
  for (const item of items) {
    if (item.private === true) continue;
    posts.push({
      title: item.title,
      tags: item.tags.map((tag) => tag.name),
      publishedAt: new Date(item.created_at).toISOString(),
      updatedAt: new Date(item.updated_at).toISOString(),
      url: item.url,
      source: "qiita",
    });
  }
  if (items.length < PER_PAGE) break;
  if (page === MAX_PAGES) {
    throw new Error(`[sync] qiita: hit MAX_PAGES (${MAX_PAGES * PER_PAGE} items) — output would be truncated`);
  }
}
/* oxlint-enable no-await-in-loop */

if (posts.length === 0) throw new Error("qiita: fetched 0 posts — not overwriting");
writeFileSync(OUT_FILE, `${JSON.stringify(posts, null, 2)}\n`);
console.log(`[sync] wrote ${posts.length} qiita post(s) -> ${OUT_FILE}`);
