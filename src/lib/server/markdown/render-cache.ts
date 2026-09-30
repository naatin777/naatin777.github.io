import type { TocItem } from "$lib/types";
import { renderMarkdown } from "./index";

// Dev-mode render cache. Editing a post invalidates the posts module (the
// eager glob lives there) but not this module, so the Map survives and only
// the edited file re-renders through shiki/KaTeX/mermaid. This module
// deliberately imports the pipeline: a code change under markdown/
// propagates invalidation here too, resetting the cache — code edits never
// serve stale output.
const cache = new Map<string, Promise<{ html: string; toc: TocItem[] }>>();

export function renderMarkdownCached(
  content: string,
  options: { cacheKey: string; resolveImage: (src: string) => string },
): Promise<{ html: string; toc: TocItem[] }> {
  let task = cache.get(options.cacheKey);
  if (!task) {
    task = renderMarkdown(content, { resolveImage: options.resolveImage });
    cache.set(options.cacheKey, task);
    // Don't cache failures — a transient renderer crash (e.g. mermaid's
    // browser) must not poison the key.
    task.catch(() => {
      if (cache.get(options.cacheKey) === task) cache.delete(options.cacheKey);
    });
  }
  return task;
}
