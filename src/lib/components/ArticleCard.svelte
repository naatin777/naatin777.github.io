<script lang="ts">
  import { formatDate } from "$lib/date";
  import { sourceLabels, type ArticleSource } from "$lib/config/article-source";
  import LangText from "./LangText.svelte";

  interface Props {
    title: string;
    url: string;
    tags: string[];
    source: ArticleSource;
    series: string | null;
    publishedAt: string;
    selectedTags?: Set<string>;
    ontag?: (tag: string) => void;
  }

  let { title, url, tags, source, series, publishedAt, selectedTags, ontag }: Props = $props();

  const external = $derived(source !== "blog");
</script>

<article class="card hover:border-foreground relative">
  <div class="flex items-start justify-between gap-3">
    <a
      href={url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      class="text-foreground font-medium after:absolute after:inset-0 after:content-[''] hover:underline"
    >
      {title}
      {#if external}<span class="sr-only"
          ><LangText texts={{ ja: "（新しいタブで開く）", en: "(opens in a new tab)" }} /></span
        >{/if}
    </a>
    <span class="badge badge-{source}">{sourceLabels[source]}</span>
  </div>
  <div class="text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
    {#if publishedAt}
      <time datetime={publishedAt}>{formatDate(publishedAt)}</time>
    {/if}
    {#if series}
      <span class="chip bg-foreground/10 text-foreground border-transparent">{series}</span>
    {/if}
    {#each tags as tag (tag)}
      {#if ontag}
        <button
          type="button"
          onclick={() => ontag(tag)}
          aria-pressed={selectedTags?.has(tag.toLowerCase()) ?? false}
          class="chip bg-background hover:border-foreground relative z-10 border-transparent"
        >
          {tag}
        </button>
      {:else}
        <span class="chip bg-background border-transparent">{tag}</span>
      {/if}
    {/each}
  </div>
</article>
