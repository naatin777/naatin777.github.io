// Syncs Qiita article metadata into content/generated/qiita.json.
// Run via `pnpm sync:qiita`. Uses the unauthenticated Qiita API v2:
// https://qiita.com/api/v2/users/<user>/items (paginated, 100/page).
import { z } from "zod";
import { fetchText, toExternalPost, USERNAME, writePosts, type ExternalPost } from "./external-posts.ts";

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

writePosts("qiita", posts);
