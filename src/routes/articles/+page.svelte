<script lang="ts">
  import ArticleCard from "$lib/components/ArticleCard.svelte";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import TagFilter from "$lib/components/TagFilter.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const allTags = $derived.by(() => {
    const tagNames = new Map<string, string>();
    for (const article of data.articles) {
      for (const tag of article.tags) {
        if (!tagNames.has(tag.toLowerCase())) tagNames.set(tag.toLowerCase(), tag);
      }
    }
    return [...tagNames.values()].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  });

  let selected = $state(new Set<string>());

  const selectedKeys = $derived(new Set([...selected].map((t) => t.toLowerCase())));
  const filtered = $derived(
    selectedKeys.size === 0
      ? data.articles
      : data.articles.filter((a) => a.tags.some((t) => selectedKeys.has(t.toLowerCase()))),
  );
</script>

<Seo
  title="Articles · Naatin's Portfolio"
  description="Articles from my blog, Qiita, and Zenn gathered in one place with tag-based browsing."
/>

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "記事", en: "Articles" }} /></h1>
  <TagFilter tags={allTags} bind:selected />
  <ul class="flex flex-col gap-3">
    {#each filtered as article (article.url)}
      <li>
        <ArticleCard
          title={article.title}
          url={article.url}
          tags={article.tags}
          source={article.source}
          emoji={article.emoji}
          updatedAt={article.updatedAt}
        />
      </li>
    {:else}
      <li class="text-muted text-sm">
        <LangText
          texts={{ ja: "選択したタグに一致する記事はありません", en: "No articles match the selected tags." }}
        />
      </li>
    {/each}
  </ul>
</section>
