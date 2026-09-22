<script lang="ts">
  import { sourceLabels, sourceStyles, type ArticleSource } from "$lib/source";

  interface Props {
    title: string;
    url: string;
    tags: string[];
    source: ArticleSource;
    series?: string | null;
    updatedAt: string | null;
    selectedTags?: Set<string>;
    ontag?: (tag: string) => void;
  }

  let { title, url, tags, source, series = null, updatedAt, selectedTags, ontag }: Props = $props();

  const external = $derived(source !== "blog");
</script>

<article class="border-border bg-surface hover:border-accent rounded-lg border p-4 transition-colors">
  <div class="flex items-start justify-between gap-3">
    <a
      href={url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      class="text-foreground hover:text-accent font-medium"
    >
      {title}
    </a>
    <span class="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium tracking-wide {sourceStyles[source]}">
      {sourceLabels[source]}
    </span>
  </div>
  <div class="text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
    {#if updatedAt}
      <time datetime={updatedAt}>{updatedAt.slice(0, 10)}</time>
    {/if}
    {#if series}
      <span class="bg-accent/10 text-accent rounded-full px-2 py-0.5">{series}</span>
    {/if}
    {#each tags as tag (tag)}
      {#if ontag}
        <button
          type="button"
          onclick={() => ontag(tag)}
          aria-pressed={selectedTags?.has(tag.toLowerCase()) ?? false}
          class="bg-background hover:border-foreground aria-pressed:border-foreground rounded-full border border-transparent px-2 py-0.5 transition-colors"
        >
          {tag}
        </button>
      {:else}
        <span class="bg-background rounded-full px-2 py-0.5">{tag}</span>
      {/if}
    {/each}
  </div>
</article>
