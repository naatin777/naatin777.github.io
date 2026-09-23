import matter from "gray-matter";
import { z } from "zod";
import { author } from "$lib/config/site";
import { parseDate } from "$lib/date";
import type { ArticleSource } from "$lib/config/article-source";

// gray-matter parses unquoted YAML timestamps into Date objects
const dateField = z.union([z.string(), z.date().transform((d) => d.toISOString())]);

// Zenn articles come from the GitHub-linked repo (content/zenn/). Dates are
// authored in frontmatter — `published_at` is Zenn's official field for the
// display publication date (JST). No API call is needed at build time.
const zennFrontmatter = z.object({
  title: z.string(),
  topics: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  published_at: dateField.optional(),
});

// Qiita articles come from qiita-cli-managed files — the CLI's publish
// action writes id/created_at/updated_at back into frontmatter.
const qiitaTag = z.union([z.string(), z.object({ name: z.string() }).transform((t) => t.name)]);

const qiitaFrontmatter = z.object({
  id: z.string().nullable().optional(),
  title: z.string(),
  tags: z.array(qiitaTag).default([]),
  private: z.boolean().default(false),
  ignorePublish: z.boolean().default(false),
  created_at: dateField.optional(),
  updated_at: dateField.optional(),
});

export interface ArticleItem {
  title: string;
  url: string;
  tags: string[];
  source: ArticleSource;
  series: string | null;
  publishedAt: string | null;
}

const zennFiles = import.meta.glob<string>("/content/zenn/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const qiitaFiles = import.meta.glob<string>("/content/qiita/public/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function* parseMarkdownFiles<T>(
  files: Record<string, string>,
  schema: z.ZodType<T>,
): Generator<{ slug: string; fm: T }> {
  for (const [path, raw] of Object.entries(files)) {
    // matter() throws YAMLException on malformed frontmatter — a single bad
    // file must not fail the whole build.
    let data: unknown;
    try {
      data = matter(raw).data;
    } catch (error) {
      console.warn(`[articles] skipping ${path}: frontmatter parse failed`, error);
      continue;
    }
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      console.warn(`[articles] skipping ${path}:`, parsed.error.issues);
      continue;
    }
    yield { slug: path.split("/").pop()?.replace(/\.md$/, "") ?? "", fm: parsed.data };
  }
}

let cache: ArticleItem[] | null = null;

export function getExternalArticles(): ArticleItem[] {
  return (cache ??= loadExternalArticles());
}

// Frontmatter dates arrive in mixed formats (Zenn "YYYY-MM-DD hh:mm" JST,
// Qiita ISO). Normalize to ISO so <time datetime> is unambiguous.
const toIso = (value: string | undefined): string | null => {
  const timestamp = value ? parseDate(value) : Number.NaN;
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
};

function loadExternalArticles(): ArticleItem[] {
  const items: ArticleItem[] = [];

  for (const { slug, fm } of parseMarkdownFiles(zennFiles, zennFrontmatter)) {
    if (!fm.published) continue;
    if (!fm.published_at) {
      console.warn(`[articles] ${slug}: published Zenn article has no published_at — date will be blank`);
    }
    items.push({
      title: fm.title,
      url: `https://zenn.dev/${author.name}/articles/${slug}`,
      tags: fm.topics,
      source: "zenn",
      series: null,
      publishedAt: toIso(fm.published_at),
    });
  }

  for (const { fm } of parseMarkdownFiles(qiitaFiles, qiitaFrontmatter)) {
    if (fm.private || fm.ignorePublish || !fm.id) continue;
    items.push({
      title: fm.title,
      url: `https://qiita.com/${author.name}/items/${fm.id}`,
      tags: fm.tags,
      source: "qiita",
      series: null,
      publishedAt: toIso(fm.created_at ?? fm.updated_at),
    });
  }

  return items;
}
