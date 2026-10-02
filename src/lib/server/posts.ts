import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { posix } from "node:path";
import { imageSize } from "image-size";
import matter from "gray-matter";
import { CORE_SCHEMA, load } from "js-yaml";
import { z } from "zod";
import { parseDate } from "#lib/date.js";
import type { TocItem } from "#lib/types.js";
import type { ResolveImage } from "./markdown/images";
import { linkcardsDigest } from "./markdown/linkcards";
import { renderMarkdownCached } from "./markdown/render-cache";

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

const frontmatterSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().default(""),
  publishedAt: frontmatterDate,
  updatedAt: frontmatterDate.optional(),
  tags: z
    .array(z.string())
    .default([])
    .transform((tags) => [...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag !== ""))]),
  series: z.string().optional(),
  seriesSlug: z.string().optional(),
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
  updatedAt: Date;
  tags: string[];
  series: string | null;
  seriesSlug: string | null;
  readingTime: number;
  html: string;
  toc: TocItem[];
  // True when the rendered HTML contains KaTeX markup — gates the vendored
  // stylesheet link so math-free posts don't pay for it.
  hasMath: boolean;
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
  return loadPostsFrom(postFiles, postAssets, gitUpdatedAt);
}

// updatedAt falls back to the file's last commit when frontmatter doesn't
// set it — author date (%aI), which survives rebase unlike committer date.
// Requires a full clone (CI checks out with fetch-depth: 0): if git itself
// fails there is no reliable date source, so the build fails rather than
// shipping silently-wrong dates. A file with no commits yet (a WIP post
// not yet committed) just yields null → publishedAt.
function gitUpdatedAt(path: string): Date | null {
  const out = execFileSync("git", ["log", "-1", "--format=%aI", "--", path.replace(/^\//, "")], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  if (out === "") return null;
  const timestamp = Date.parse(out);
  if (Number.isNaN(timestamp)) {
    throw new Error(`[posts] unparseable commit date ${JSON.stringify(out)} for ${path}`);
  }
  return new Date(timestamp);
}

// Reads a bundled image's intrinsic size from disk — glob keys are
// root-relative ("/content/..."), so strip the leading slash. The
// dimensions become width/height attrs that let the browser reserve the
// layout box pre-fetch; files with no measurable size (e.g. a viewBox-only
// SVG) or unreadable paths just ship without them.
const imageDimensions = (globKey: string): { width?: number; height?: number } => {
  try {
    const { width, height } = imageSize(readFileSync(globKey.slice(1)));
    return width === undefined || height === undefined ? {} : { width, height };
  } catch {
    return {};
  }
};

function parsePostFrontmatter(
  path: string,
  raw: string,
): { frontmatter: z.infer<typeof frontmatterSchema>; content: string } | null {
  let result: ReturnType<typeof matter>;
  try {
    result = matter(raw, matterOptions);
  } catch (error) {
    console.warn(`[posts] skipping ${path}: frontmatter parse failed`, error);
    return null;
  }
  const parsed = frontmatterSchema.safeParse(result.data);
  if (!parsed.success) {
    console.warn(`[posts] skipping ${path}:`, parsed.error.issues);
    return null;
  }
  if (parsed.data.draft) {
    console.warn(`[posts] skipping ${path}: draft post inside content/posts/ (assets still ship)`);
    return null;
  }
  return { frontmatter: parsed.data, content: result.content };
}

function createImageResolver(path: string, assets: Record<string, string>): ResolveImage {
  const directory = posix.dirname(path);
  return (src) => {
    if (/^[a-z]+:/i.test(src) || src.startsWith("/") || src.startsWith("#")) return { src };
    // Glob keys are paths; query strings and fragments do not identify files.
    const relativePath = src.split(/[?#]/)[0] ?? "";
    const key = posix.normalize(`${directory}/${relativePath}`);
    const bundled = assets[key];
    if (!bundled) {
      console.warn(`[posts] ${path}: image "${src}" not found beside the post`);
      return { src };
    }
    return { src: bundled, ...imageDimensions(key) };
  };
}

// CJK text is estimated at 500 characters/minute, Latin text at 200 words/minute.
// Fenced code is excluded because readers usually skim it.
function estimateReadingTime(content: string): number {
  const prose = content.replace(/```[\s\S]*?(?:```|$)/g, " ");
  const cjkCharacters = (prose.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const latinWords = (prose.match(/[a-zA-Z0-9_'-]+/g) ?? []).length;
  return Math.max(1, Math.ceil(cjkCharacters / 500 + latinWords / 200));
}

// An explicit slug applies to every member of its series, including posts
// that omit it. Conflicts keep the first explicit slug and emit a warning.
function resolveSeriesSlugs(posts: Post[]): void {
  const slugBySeries = new Map<string, string>();
  for (const post of posts) {
    if (post.series === null || post.seriesSlug === null) continue;
    const existing = slugBySeries.get(post.series);
    if (existing === undefined) slugBySeries.set(post.series, post.seriesSlug);
    else if (existing !== post.seriesSlug)
      console.warn(
        `[posts] conflicting seriesSlug "${post.seriesSlug}" for series "${post.series}" — keeping "${existing}"`,
      );
  }
  for (const post of posts) {
    if (post.series !== null) post.seriesSlug = slugBySeries.get(post.series) ?? post.series;
  }
  const seriesBySlug = new Map<string, string>();
  for (const post of posts) {
    if (post.series === null || post.seriesSlug === null) continue;
    const other = seriesBySlug.get(post.seriesSlug);
    if (other !== undefined && other !== post.series) {
      console.warn(
        `[posts] series slug "${post.seriesSlug}" is shared by "${other}" and "${post.series}" — their series pages will merge`,
      );
    }
    seriesBySlug.set(post.seriesSlug, post.series);
  }
}

// Files/assets are injectable so tests can exercise the loading rules
// (skip/dedup/draft/date parsing) without fixtures in content/. The
// updatedAt fallback is injectable for the same reason.
export async function loadPostsFrom(
  files: Record<string, string>,
  assets: Record<string, string>,
  resolveUpdatedAt: (path: string) => Date | null = () => null,
): Promise<Post[]> {
  const slugs = new Set<string>();
  // Render-cache salt covering every image this glob could resolve to —
  // an asset add/remove/swap re-renders posts even when their md is
  // untouched.
  const assetsDigest = createHash("sha256").update(JSON.stringify(assets)).digest("hex");
  const posts = await Promise.all(
    Object.entries(files).map(async ([path, raw]): Promise<Post | null> => {
      const parsed = parsePostFrontmatter(path, raw);
      if (!parsed) return null;
      const { frontmatter, content } = parsed;
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
      const resolveImage = createImageResolver(path, assets);
      let rendered: { html: string; toc: TocItem[] };
      try {
        // Keyed by everything that affects the output: body, post dir
        // (resolveImage resolves ./ against it), and the asset map.
        const cacheKey = createHash("sha256")
          .update(dir)
          .update("\0")
          .update(assetsDigest)
          .update("\0")
          .update(linkcardsDigest())
          .update("\0")
          .update(content)
          .digest("hex");
        rendered = await renderMarkdownCached(content, { cacheKey, resolveImage });
      } catch (error) {
        console.warn(`[posts] skipping ${path}: markdown render failed`, error);
        return null;
      }
      const { html, toc } = rendered;
      // Like the post slug, the series slug is a URL segment — fall back to
      // the series name itself when absent or not URL-safe.
      let seriesSlug = frontmatter.seriesSlug ?? null;
      if (seriesSlug !== null && !/^[\w-]+$/.test(seriesSlug)) {
        console.warn(`[posts] ${path}: seriesSlug "${seriesSlug}" is not URL-safe — ignoring it`);
        seriesSlug = null;
      }
      return {
        slug,
        title: frontmatter.title,
        description: frontmatter.description,
        publishedAt: frontmatter.publishedAt,
        updatedAt: frontmatter.updatedAt ?? resolveUpdatedAt(path) ?? frontmatter.publishedAt,
        tags: frontmatter.tags,
        series: frontmatter.series ?? null,
        seriesSlug,
        readingTime: estimateReadingTime(content),
        html,
        toc,
        hasMath: html.includes('class="katex"'),
      };
    }),
  );
  const loaded = posts.filter((post): post is Post => post !== null);
  resolveSeriesSlugs(loaded);
  return loaded.toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
