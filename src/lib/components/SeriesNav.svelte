<script lang="ts">
  import LangText from "./LangText.svelte";

  interface SeriesPost {
    slug: string;
    title: string;
  }

  interface Props {
    name: string;
    posts: SeriesPost[];
    currentSlug: string;
  }

  let { name, posts, currentSlug }: Props = $props();
</script>

<nav class="card mb-8" aria-label="Series">
  <p class="mb-2 text-sm font-bold"><LangText texts={{ ja: "シリーズ", en: "Series" }} />: {name}</p>
  <ol class="flex list-decimal flex-col gap-1 pl-5 text-sm">
    {#each posts as seriesPost (seriesPost.slug)}
      <li class:font-semibold={seriesPost.slug === currentSlug}>
        {#if seriesPost.slug === currentSlug}
          <span class="text-foreground">{seriesPost.title}</span>
          <span class="text-muted text-xs">
            <LangText texts={{ ja: "（この記事）", en: " (this post)" }} />
          </span>
        {:else}
          <a href="/posts/{seriesPost.slug}/" class="text-muted hover:text-foreground">{seriesPost.title}</a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
