import { replaceState } from "$app/navigation";
import { page } from "$app/state";
import { onMount, untrack } from "svelte";
import { sourceOrder, type ArticleSource } from "$lib/config/article-source";
import { sortKeys, sortOrders, type SortKey, type SortOrder } from "$lib/types";

// Filter + sort state for the articles list, synced to the URL (?tag=
// repeatable, ?source=, ?sort=, ?order=) so views are shareable. The
// constructor effect adopts incoming/shared links and back/forward
// navigation; user actions publish via replaceState — never pushState,
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
      const canonical = this.#allTags();
      const tags = new Set<string>();
      for (const raw of page.url.searchParams.getAll("tag")) {
        const found = canonical.find((t) => t.toLowerCase() === raw.toLowerCase());
        if (found) tags.add(found);
      }
      const source = sourceOrder.find((s) => s === page.url.searchParams.get("source")) ?? null;
      const sort = sortKeys.find((k) => k === page.url.searchParams.get("sort")) ?? "published";
      const order = sortOrders.find((o) => o === page.url.searchParams.get("order")) ?? "desc";
      // Compare untracked: re-run only on URL changes, not on our own writes.
      untrack(() => {
        if (tags.size !== this.selected.size || [...tags].some((t) => !this.selected.has(t))) this.selected = tags;
        if (source !== this.selectedSource) this.selectedSource = source;
        if (sort !== this.sortKey) this.sortKey = sort;
        if (order !== this.sortOrder) this.sortOrder = order;
      });
    });

    // A shared link can carry params matching nothing (?tag=bogus,
    // ?source=zzz) — the effect adopts only valid values, so strip the
    // leftovers once mounted. This stays out of the effect for the same
    // router-init race documented above.
    onMount(() => {
      const canonical = this.#allTags();
      const url = new URL(page.url);
      const rawTags = url.searchParams.getAll("tag");
      const tags = rawTags.filter((raw) => canonical.some((t) => t.toLowerCase() === raw.toLowerCase()));
      const source = url.searchParams.get("source");
      const sourceOk = source === null || (sourceOrder as readonly string[]).includes(source);
      // Strip invalid values AND redundant defaults so the URL stays canonical.
      const sort = url.searchParams.get("sort");
      const stripSort = sort !== null && (sort === "published" || !(sortKeys as readonly string[]).includes(sort));
      const order = url.searchParams.get("order");
      const stripOrder = order !== null && (order === "desc" || !(sortOrders as readonly string[]).includes(order));
      if (tags.length === rawTags.length && sourceOk && !stripSort && !stripOrder) return;
      url.searchParams.delete("tag");
      for (const tag of tags) url.searchParams.append("tag", tag);
      if (!sourceOk) url.searchParams.delete("source");
      if (stripSort) url.searchParams.delete("sort");
      if (stripOrder) url.searchParams.delete("order");
      replaceState(url, page.state);
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

  // Defaults stay out of the URL so the canonical articles link is clean.
  #syncUrl = (): void => {
    const url = new URL(page.url);
    url.searchParams.delete("tag");
    for (const tag of this.selected) url.searchParams.append("tag", tag);
    if (this.selectedSource) url.searchParams.set("source", this.selectedSource);
    else url.searchParams.delete("source");
    if (this.sortKey !== "published") url.searchParams.set("sort", this.sortKey);
    else url.searchParams.delete("sort");
    if (this.sortOrder !== "desc") url.searchParams.set("order", this.sortOrder);
    else url.searchParams.delete("order");
    if (url.href !== page.url.href) replaceState(url, page.state);
  };
}
