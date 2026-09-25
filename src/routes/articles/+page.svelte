<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount, untrack } from "svelte";
  import ArticleCard from "$lib/components/ArticleCard.svelte";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import SourceFilter from "$lib/components/SourceFilter.svelte";
  import TagFilter from "$lib/components/TagFilter.svelte";
  import { sourceOrder, type ArticleSource } from "$lib/config/article-source";
  import { site } from "$lib/config/site";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const allTags = $derived.by(() => {
    const tagNames = new Map<string, string>();
    for (const article of data.articles) {
      for (const tag of article.tags) {
        if (!tagNames.has(tag.toLowerCase())) tagNames.set(tag.toLowerCase(), tag);
      }
    }
    return [...tagNames.values()].toSorted((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  });

  let selected = $state(new Set<string>());
  let selectedSource = $state<ArticleSource | null>(null);

  const hasFilters = $derived(selected.size > 0 || selectedSource !== null);
  const clearFilters = () => {
    selected = new Set();
    selectedSource = null;
    syncUrl();
  };

  const toggleTag = (tag: string) => {
    const canonical = allTags.find((t) => t.toLowerCase() === tag.toLowerCase()) ?? tag;
    const next = new Set(selected);
    if (next.has(canonical)) {
      next.delete(canonical);
    } else {
      next.add(canonical);
    }
    selected = next;
    syncUrl();
  };

  // Filters live in the URL (?tag= repeatable, ?source=) so filtered views
  // are shareable. The effect adopts incoming/shared links and back/forward
  // navigation; user actions publish via replaceState — never pushState,
  // filtering shouldn't stack history entries. URL writes stay out of the
  // effect: replaceState during the hydration flush races router init —
  // page.url never updates and the adopted state gets reverted.
  const syncUrl = (): void => {
    const url = new URL(page.url);
    url.searchParams.delete("tag");
    for (const tag of selected) url.searchParams.append("tag", tag);
    if (selectedSource) url.searchParams.set("source", selectedSource);
    else url.searchParams.delete("source");
    if (url.href !== page.url.href) replaceState(url, page.state);
  };

  $effect(() => {
    const tags = new Set<string>();
    for (const raw of page.url.searchParams.getAll("tag")) {
      const canonical = allTags.find((t) => t.toLowerCase() === raw.toLowerCase());
      if (canonical) tags.add(canonical);
    }
    const source = sourceOrder.find((s) => s === page.url.searchParams.get("source")) ?? null;
    // Compare untracked: re-run only on URL changes, not on our own writes.
    untrack(() => {
      if (tags.size !== selected.size || [...tags].some((t) => !selected.has(t))) selected = tags;
      if (source !== selectedSource) selectedSource = source;
    });
  });

  // A shared link can carry params matching nothing (?tag=bogus,
  // ?source=zzz) — the effect adopts only valid values, so strip the
  // leftovers once mounted. This stays out of the effect for the same
  // router-init race documented above.
  onMount(() => {
    const url = new URL(page.url);
    const rawTags = url.searchParams.getAll("tag");
    const tags = rawTags.filter((raw) => allTags.some((t) => t.toLowerCase() === raw.toLowerCase()));
    const source = url.searchParams.get("source");
    const sourceOk = source === null || (sourceOrder as readonly string[]).includes(source);
    if (tags.length === rawTags.length && sourceOk) return;
    url.searchParams.delete("tag");
    for (const tag of tags) url.searchParams.append("tag", tag);
    if (!sourceOk) url.searchParams.delete("source");
    replaceState(url, page.state);
  });

  const setSource = (next: ArticleSource | null): void => {
    selectedSource = next;
    syncUrl();
  };

  const selectedKeys = $derived(new Set([...selected].map((t) => t.toLowerCase())));
  const filtered = $derived(
    data.articles.filter(
      (article) =>
        (selectedSource === null || article.source === selectedSource) &&
        (selectedKeys.size === 0 || article.tags.some((tag) => selectedKeys.has(tag.toLowerCase()))),
    ),
  );
</script>

<Seo
  title={`Articles · ${site.title}`}
  description="ブログ・Qiita・Zennの記事をまとめて一覧。タグやソースで絞り込めます。"
/>

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "記事", en: "Articles" }} /></h1>
  <!-- All sources stay visible even when empty — a vanishing chip is
       confusing, and a shared ?source=blog link would otherwise select a
       filter that doesn't exist in the UI. The each-block's empty state
       covers the zero-result case. -->
  <SourceFilter sources={[...sourceOrder]} value={selectedSource} onchange={setSource} />
  <TagFilter tags={allTags} {selected} ontoggle={toggleTag} />
  <div class="text-muted flex items-center justify-between text-xs">
    <p role="status">
      <LangText
        texts={{
          ja: `${filtered.length} / ${data.articles.length} 件`,
          en: `${filtered.length} of ${data.articles.length} articles`,
        }}
      />
    </p>
    <button
      type="button"
      onclick={clearFilters}
      disabled={!hasFilters}
      class="chip hover:border-foreground disabled:invisible"
    >
      <LangText texts={{ ja: "フィルターをクリア", en: "Clear filters" }} />
    </button>
  </div>
  <ul class="flex flex-col gap-3">
    {#each filtered as article (article.url)}
      <li>
        <ArticleCard
          title={article.title}
          url={article.url}
          tags={article.tags}
          source={article.source}
          series={article.series}
          publishedAt={article.publishedAt}
          selectedTags={selectedKeys}
          ontag={toggleTag}
        />
      </li>
    {:else}
      <!-- No second clear button here — the one beside the count above is
           already visible whenever filters are active. -->
      <li class="text-muted text-sm">
        <LangText texts={{ ja: "条件に一致する記事はありません", en: "No articles match the current filters." }} />
      </li>
    {/each}
  </ul>
</section>
