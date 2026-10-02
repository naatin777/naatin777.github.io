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
// keeps them as strings so parseDate validates the explicit offset itself.
const matterOptions = {
  engines: {
    yaml: {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- gray-matter's engine signature wants `object`; frontmatterSchema validates the shape right after.
      parse: (input: string) => load(input, { schema: CORE_SCHEMA }) as Record<string, unknown>,
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
  title: z.string().min(1),
  description: z.string().default(""),
  publishedAt: frontmatterDate,
  updatedAt: frontmatterDate.optional(),
  tags: z.array(z.string()).default([]),
  series: z.string().optional(),
  seriesSlug: z.string().optional(),
  draft: z.boolean().default(false),
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
  return (cache ??= loadPostsFrom(postFiles, postAssets, gitUpdatedAt).catch((error) => {
    // A rejected cache would poison every subsequent call — reset on failure.
    cache = null;
    throw error;
  }));
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
// SVG) just ship without them.
const imageDimensions = (globKey: string): { width?: number; height?: number } => {
  const { width, height } = imageSize(readFileSync(globKey.slice(1)));
  return width === undefined || height === undefined ? {} : { width, height };
};

function parsePostFrontmatter(raw: string): { frontmatter: z.infer<typeof frontmatterSchema>; content: string } | null {
  const { data, content } = matter(raw, matterOptions);
  const frontmatter = frontmatterSchema.parse(data);
  // A draft's page is skipped, but its folder's assets still ship.
  if (frontmatter.draft) return null;
  return { frontmatter, content };
}

function createImageResolver(path: string, assets: Record<string, string>): ResolveImage {
  const directory = posix.dirname(path);
  return (src) => {
    if (URL.canParse(src) || src.startsWith("/")) return { src };
    const key = posix.normalize(`${directory}/${src}`);
    const bundled = assets[key];
    if (!bundled) throw new Error(`image "${src}" not found beside the post`);
    return { src: bundled, ...imageDimensions(key) };
  };
}

// An explicit slug applies to every member of its series, including posts
// that omit it. Conflicting explicit slugs fail the build.
function resolveSeriesSlugs(posts: Post[]): void {
  const slugBySeries = new Map<string, string>();
  for (const post of posts) {
    if (post.series === null || post.seriesSlug === null) continue;
    const existing = slugBySeries.get(post.series);
    if (existing === undefined) slugBySeries.set(post.series, post.seriesSlug);
    else if (existing !== post.seriesSlug)
      throw new Error(`[posts] conflicting seriesSlug "${post.seriesSlug}" for series "${post.series}"`);
  }
  for (const post of posts) {
    if (post.series !== null) post.seriesSlug = slugBySeries.get(post.series) ?? post.series;
  }
  const seriesBySlug = new Map<string, string>();
  for (const post of posts) {
    if (post.series === null || post.seriesSlug === null) continue;
    const other = seriesBySlug.get(post.seriesSlug);
    if (other !== undefined && other !== post.series) {
      throw new Error(`[posts] series slug "${post.seriesSlug}" is shared by "${other}" and "${post.series}"`);
    }
    seriesBySlug.set(post.seriesSlug, post.series);
  }
}

// Files/assets are injectable so tests can exercise the loading rules
// (draft/slug/date handling) without fixtures in content/. The
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
      try {
        const parsed = parsePostFrontmatter(raw);
        if (!parsed) return null;
        const { frontmatter, content } = parsed;
        // /content/posts/<year>/<slug>/index.md — slug is the folder name and
        // must be unique since it is the URL segment. It lands unescaped in
        // sitemap.xml / feed.xml / OG paths, so it must be URL-safe.
        const dir = path.slice(0, path.lastIndexOf("/"));
        const slug = dir.split("/").pop() ?? "";
        if (!/^[\w-]+$/.test(slug) || slugs.has(slug)) throw new Error(`invalid or duplicate slug "${slug}"`);
        slugs.add(slug);
        const resolveImage = createImageResolver(path, assets);
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
        const { html, toc } = await renderMarkdownCached(content, { cacheKey, resolveImage });
        // Like the post slug, the series slug is a URL segment.
        const seriesSlug = frontmatter.seriesSlug ?? null;
        if (seriesSlug !== null && !/^[\w-]+$/.test(seriesSlug))
          throw new Error(`seriesSlug "${seriesSlug}" is not URL-safe`);
        return {
          slug,
          title: frontmatter.title,
          description: frontmatter.description,
          publishedAt: frontmatter.publishedAt,
          updatedAt: frontmatter.updatedAt ?? resolveUpdatedAt(path) ?? frontmatter.publishedAt,
          tags: frontmatter.tags,
          series: frontmatter.series ?? null,
          seriesSlug,
          html,
          toc,
          hasMath: html.includes('class="katex"'),
        };
      } catch (error) {
        throw new Error(`[posts] ${path}`, { cause: error });
      }
    }),
  );
  const loaded = posts.filter((post): post is Post => post !== null);
  resolveSeriesSlugs(loaded);
  return loaded.toSorted((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}
