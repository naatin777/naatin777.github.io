import { goto } from "$app/navigation";
import { page } from "$app/state";
import { untrack } from "svelte";
import { parseArticleListUrl, serializeArticleListUrl } from "#lib/article-list-url.js";
import type { ArticleSource } from "#lib/config/article-source.js";
import type { SortKey, SortOrder } from "#lib/types.js";

// Filter + sort state for the articles list, synced to the URL (?tag=
// repeatable, ?source=, ?sort=, ?order=) so views are shareable. The
// constructor effect adopts incoming/shared links and back/forward
// navigation; user actions publish via shallow goto({ replace: true }) —
// filtering shouldn't stack history entries.
export class ArticleListState {
  selected = $state(new Set<string>());
  selectedSource = $state<ArticleSource | null>(null);
  sortKey = $state<SortKey>("published");
  sortOrder = $state<SortOrder>("desc");

  hasFilters = $derived(this.selected.size > 0 || this.selectedSource !== null);

  // Canonical (original-case) tag list, read lazily so it stays reactive.
  #allTags: () => string[];

  constructor(allTags: () => string[]) {
    this.#allTags = allTags;

    $effect(() => {
      const incoming = parseArticleListUrl(page.shallow?.url ?? page.url, this.#allTags());
      // Compare untracked: re-run only on URL changes, not on our own writes.
      untrack(() => {
        if (
          incoming.selected.size !== this.selected.size ||
          [...incoming.selected].some((tag) => !this.selected.has(tag))
        )
          this.selected = incoming.selected;
        if (incoming.selectedSource !== this.selectedSource) this.selectedSource = incoming.selectedSource;
        if (incoming.sortKey !== this.sortKey) this.sortKey = incoming.sortKey;
        if (incoming.sortOrder !== this.sortOrder) this.sortOrder = incoming.sortOrder;
      });
    });
  }

  toggleTag = (tag: string): void => {
    const canonical = this.#allTags().find((t) => t.toLowerCase() === tag.toLowerCase()) ?? tag;
    const next = new Set(this.selected);
    if (next.has(canonical)) next.delete(canonical);
    else next.add(canonical);
    this.selected = next;
    this.#syncUrl();
  };

  setSource = (next: ArticleSource | null): void => {
    this.selectedSource = next;
    this.#syncUrl();
  };

  setSort = (key: SortKey): void => {
    this.sortKey = key;
    this.#syncUrl();
  };

  setOrder = (next: SortOrder): void => {
    this.sortOrder = next;
    this.#syncUrl();
  };

  clearFilters = (): void => {
    this.selected = new Set();
    this.selectedSource = null;
    this.#syncUrl();
  };

  #syncUrl = (): void => {
    const currentUrl = page.shallow?.url ?? page.url;
    const url = serializeArticleListUrl(currentUrl, this);
    if (url.href !== currentUrl.href) void goto(url, { shallow: true, replace: true, state: page.state });
  };
}
