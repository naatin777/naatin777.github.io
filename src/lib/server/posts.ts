import { posix } from "node:path";
import matter from "gray-matter";
import { CORE_SCHEMA, load } from "js-yaml";
import { z } from "zod";
import { parseDate } from "$lib/date";
import type { TocItem } from "$lib/types";
import { renderMarkdown } from "./markdown";

// gray-matter's bundled js-yaml resolves YAML timestamps into Date objects
// (UTC for date-only, machine-local otherwise) — parsing with CORE_SCHEMA
// keeps them as strings so parseDate can pin bare dates to JST instead.
const matterOptions = {
  engines: {
    yaml: {
      parse: (input: string) => {
        const data: unknown = load(input, { schema: CORE_SCHEMA });
        if (typeof data !== "object" || data === null) return {};
        // A blank YAML value (`description:` etc.) parses as null — treat
        // it as unset so optional fields hit their defaults instead of
        // failing validation and skipping the whole post.
        return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null));
      },
    },
  },
};

const frontmatterDate = z.string().transform((value, ctx) => {
  const timestamp = parseDate(value);
  if (Number.isNaN(timestamp)) {
    ctx.addIssue({ code: "custom", message: `invalid date: ${JSON.stringify(value)}` });
    return z.NEVER;
  }
  return new Date(timestamp);
});

const postFrontmatter = z.object({
  title: z.string().trim().min(1),
  description: z.string().default(""),
  publishedAt: frontmatterDate,
  updatedAt: frontmatterDate.optional(),
  tags: z
    .array(z.string())
    .default([])
    .transform((tags) => [...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag !== ""))]),
  series: z.string().optional(),
  // "true"/"false" strings are accepted (a common frontmatter slip); other
  // truthy-looking values like "yes" still fail validation loudly.
  draft: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true")
    .default(false),
});

export interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt: Date | null;
  tags: string[];
  series: string | null;
  html: string;
  toc: TocItem[];
}

// Posts live at content/posts/<year>/<slug>/index.md — the year folder is
// organizational only (the URL stays /posts/<slug>/).
const postFiles = import.meta.glob<string>("/content/posts/*/*/index.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Assets co-located with a post (images etc.) are bundled by vite; markdown
// references them relatively (./image.png) and rehypeResolveImages swaps in
// the emitted URL. Every glob match is emitted to build/ whether a post
// references it or not — that's why drafts live outside content/posts/,
// outside this glob, so their assets never reach the output.
const postAssets = import.meta.glob<string>("/content/posts/*/**/*.{png,jpg,jpeg,gif,svg,webp,avif}", {
  query: "?url",
  import: "default",
  eager: true,
});

let cache: Promise<Post[]> | null = null;

export function getPosts(): Promise<Post[]> {
  return (cache ??= loadPosts().catch((error) => {
    // A rejected cache would poison every subsequent call — reset on failure.
    cache = null;
    throw error;
  }));
}

async function loadPosts(): Promise<Post[]> {
  return loadPostsFrom(postFiles, postAssets);
}

// Files/assets are injectable so tests can exercise the loading rules
// (skip/dedup/draft/date parsing) without fixtures in content/.
export async function loadPostsFrom(files: Record<string, string>, assets: Record<string, string>): Promise<Post[]> {
  const slugs = new Set<string>();
  const posts = await Promise.all(
    Object.entries(files).map(async ([path, raw]): Promise<Post | null> => {
      // matter() throws YAMLException on malformed frontmatter — a single
      // bad file must not fail the whole build.
      let matterResult: ReturnType<typeof matter>;
      try {
        matterResult = matter(raw, matterOptions);
      } catch (error) {
        console.warn(`[posts] skipping ${path}: frontmatter parse failed`, error);
        return null;
      }
      const { data, content } = matterResult;
      const parsed = postFrontmatter.safeParse(data);
      if (!parsed.success) {
        console.warn(`[posts] skipping ${path}:`, parsed.error.issues);
        return null;
      }
      const fm = parsed.data;
      if (fm.draft) {
        // The page is skipped, but every asset in this folder still ships —
        // drafts belong outside content/posts/ where the glob can't see them.
        console.warn(`[posts] skipping ${path}: draft post inside content/posts/ (assets still ship)`);
        return null;
      }
      // /content/posts/<year>/<slug>/index.md — slug is the folder name and
      // must be unique since it is the URL segment.
      const dir = path.slice(0, path.lastIndexOf("/"));
      const slug = dir.split("/").pop() ?? "";
      // The slug is a URL segment that also lands unescaped in sitemap.xml /
      // feed.xml / OG paths — restrict it to URL-safe characters.
      if (!/^[\w-]+$/.test(slug) || slugs.has(slug)) {
        console.warn(`[posts] skipping ${path}: invalid or duplicate slug "${slug}"`);
        return null;
      }
      slugs.add(slug);
      const resolveImage = (src: string): string => {
        // Absolute URLs, site-root paths, and anchors pass through untouched.
        if (/^[a-z]+:/i.test(src) || src.startsWith("/") || src.startsWith("#")) return src;
        // ./ and ../ resolve against the post folder via glob keys, so
        // normalize the joined path; a query/hash suffix is ignored.
        const rel = src.split(/[?#]/)[0] ?? "";
        const bundled = assets[posix.normalize(`${dir}/${rel}`)];
        if (!bundled) {
          console.warn(`[posts] ${path}: image "${src}" not found beside the post`);
          return src;
        }
        return bundled;
      };
      let rendered: { html: string; toc: TocItem[] };
      try {
        rendered = await renderMarkdown(content, { resolveImage });
      } catch (error) {
        console.warn(`[posts] skipping ${path}: markdown render failed`, error);
        return null;
      }
      const { html, toc } = rendered;
      return {
        slug,
        title: fm.title,
        description: fm.description,
        publishedAt: fm.publishedAt,
        updatedAt: fm.updatedAt ?? null,
        tags: fm.tags,
        series: fm.series ?? null,
        html,
        toc,
      };
    }),
  );
  return posts
    .filter((post): post is Post => post !== null)
    .toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
