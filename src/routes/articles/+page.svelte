<script lang="ts">
  import ArticleCard from "$lib/components/ArticleCard.svelte";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import SourceFilter from "$lib/components/SourceFilter.svelte";
  import SortControl from "$lib/components/SortControl.svelte";
  import TagFilter from "$lib/components/TagFilter.svelte";
  import { ArticleListState } from "$lib/article-list-state.svelte";
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

  const sourceCounts = $derived.by(() => {
    const counts = Object.fromEntries(sourceOrder.map((s) => [s, 0])) as Record<ArticleSource, number>;
    for (const article of data.articles) counts[article.source] += 1;
    return counts;
  });

  const state = new ArticleListState(() => allTags);

  const selectedKeys = $derived(new Set([...state.selected].map((t) => t.toLowerCase())));
  const filtered = $derived(
    data.articles.filter(
      (article) =>
        (state.selectedSource === null || article.source === state.selectedSource) &&
        (selectedKeys.size === 0 || article.tags.some((tag) => selectedKeys.has(tag.toLowerCase()))),
    ),
  );

  // Never-updated articles sort by their publish date under "updated".
  const sorted = $derived.by(() => {
    const dir = state.sortOrder === "asc" ? 1 : -1;
    const at = (article: (typeof filtered)[number]) =>
      Date.parse(state.sortKey === "updated" ? (article.updatedAt ?? article.publishedAt) : article.publishedAt);
    return filtered.toSorted((a, b) =>
      state.sortKey === "name" ? dir * a.title.localeCompare(b.title, "ja") : dir * (at(a) - at(b)),
    );
  });
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
  <!-- Chips are the "narrowing" group; below the hairline sits one toolbar
       row for list state — count/clear on the left, sorting on the right. -->
  <div class="flex flex-col gap-4">
    <SourceFilter
      sources={[...sourceOrder]}
      value={state.selectedSource}
      counts={sourceCounts}
      total={data.articles.length}
      onchange={state.setSource}
    />
    <TagFilter tags={allTags} selected={state.selected} ontoggle={state.toggleTag} />
  </div>
  <div class="border-border text-muted flex flex-wrap items-center gap-x-3 gap-y-3 border-t pt-4 text-xs">
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
      onclick={state.clearFilters}
      disabled={!state.hasFilters}
      class="chip hover:border-foreground px-3 py-1 disabled:invisible"
    >
      <LangText texts={{ ja: "フィルターをクリア", en: "Clear filters" }} />
    </button>
    <div class="w-full min-[36rem]:ml-auto min-[36rem]:w-auto">
      <SortControl value={state.sortKey} order={state.sortOrder} onsort={state.setSort} onorder={state.setOrder} />
    </div>
  </div>
  <ul class="flex flex-col gap-3">
    {#each sorted as article (article.url)}
      <li>
        <ArticleCard
          title={article.title}
          url={article.url}
          tags={article.tags}
          source={article.source}
          series={article.series}
          seriesSlug={article.seriesSlug}
          publishedAt={article.publishedAt}
          updatedAt={article.updatedAt}
          description={article.description}
          selectedTags={selectedKeys}
          ontag={state.toggleTag}
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
