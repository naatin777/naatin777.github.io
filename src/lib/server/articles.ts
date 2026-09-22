import matter from "gray-matter";
import { z } from "zod";
import { author } from "$lib/config/author";

// gray-matter parses unquoted YAML timestamps into Date objects
const dateish = z.union([z.string(), z.date().transform((d) => d.toISOString())]);

const zennFrontmatter = z.object({
  title: z.string(),
  emoji: z.string().optional(),
  topics: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  published_at: dateish.optional(),
});

const zennApiArticle = z.object({
  slug: z.string(),
  published_at: z.string().nullable(),
  body_updated_at: z.string().nullable().optional(),
});

const zennApiPage = z.object({
  articles: z.array(z.unknown()),
  next_page: z.number().nullable(),
});

const qiitaTag = z.union([z.string(), z.object({ name: z.string() }).transform((t) => t.name)]);

const qiitaFrontmatter = z.object({
  id: z.string().nullable().optional(),
  title: z.string(),
  tags: z.array(qiitaTag).default([]),
  private: z.boolean().default(false),
  ignorePublish: z.boolean().default(false),
  created_at: dateish.optional(),
  updated_at: dateish.optional(),
});

export interface ArticleItem {
  title: string;
  url: string;
  tags: string[];
  source: "zenn" | "qiita" | "blog";
  emoji: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
}

const zennFiles = import.meta.glob("/content/zenn/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const qiitaFiles = import.meta.glob("/content/qiita/public/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

async function fetchZennDates(): Promise<Map<string, { publishedAt: string; updatedAt: string }>> {
  const dates = new Map<string, { publishedAt: string; updatedAt: string }>();
  const MAX_PAGES = 20;

  try {
    let page: number | null = 1;
    while (page !== null && page <= MAX_PAGES) {
      const res = await fetch(`https://zenn.dev/api/articles?username=${author.name}&page=${page}`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        console.warn(`[articles] Zenn API responded ${res.status} on page ${page}`);
        break;
      }
      const body = zennApiPage.safeParse(await res.json());
      if (!body.success) {
        console.warn("[articles] Zenn API response shape changed; stopping pagination");
        break;
      }
      for (const entry of body.data.articles) {
        const parsed = zennApiArticle.safeParse(entry);
        if (!parsed.success || !parsed.data.published_at) continue;
        dates.set(parsed.data.slug, {
          publishedAt: parsed.data.published_at,
          updatedAt: parsed.data.body_updated_at ?? parsed.data.published_at,
        });
      }
      page = body.data.next_page;
    }
  } catch (error) {
    console.warn("[articles] Zenn API fetch failed; using frontmatter dates only:", error);
  }
  return dates;
}

export async function getExternalArticles(): Promise<ArticleItem[]> {
  const zennDates = await fetchZennDates();
  const items: ArticleItem[] = [];

  for (const [path, raw] of Object.entries(zennFiles)) {
    const parsed = zennFrontmatter.safeParse(matter(raw as string).data);
    if (!parsed.success) {
      console.warn(`[articles] skipping ${path}:`, parsed.error.issues);
      continue;
    }
    const fm = parsed.data;
    if (!fm.published) continue;
    const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
    const dates = zennDates.get(slug);
    items.push({
      title: fm.title,
      url: `https://zenn.dev/${author.name}/articles/${slug}`,
      tags: fm.topics,
      source: "zenn",
      emoji: fm.emoji ?? null,
      publishedAt: dates?.publishedAt ?? fm.published_at ?? null,
      updatedAt: dates?.updatedAt ?? fm.published_at ?? null,
    });
  }

  for (const [path, raw] of Object.entries(qiitaFiles)) {
    const parsed = qiitaFrontmatter.safeParse(matter(raw as string).data);
    if (!parsed.success) {
      console.warn(`[articles] skipping ${path}:`, parsed.error.issues);
      continue;
    }
    const fm = parsed.data;
    if (fm.private || fm.ignorePublish || !fm.id) continue;
    items.push({
      title: fm.title,
      url: `https://qiita.com/${author.name}/items/${fm.id}`,
      tags: fm.tags,
      source: "qiita",
      emoji: null,
      publishedAt: fm.created_at ?? fm.updated_at ?? null,
      updatedAt: fm.updated_at ?? fm.created_at ?? null,
    });
  }

  return items;
}
