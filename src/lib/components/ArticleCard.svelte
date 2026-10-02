<script lang="ts">
  import { resolve } from "$app/paths";
  import { ExternalLink } from "@lucide/svelte";
  import { formatDate } from "#lib/date.js";
  import { sourceLabels } from "#lib/config/article-source.js";
  import type { ArticleItem } from "#lib/types.js";
  import LangText from "./LangText.svelte";

  interface Props extends ArticleItem {
    selectedTags?: Set<string>;
    ontag?: (tag: string) => void;
  }

  let {
    title,
    url,
    tags,
    source,
    series,
    seriesSlug,
    publishedAt,
    updatedAt,
    description,
    selectedTags,
    ontag,
  }: Props = $props();

  const external = $derived(source !== "blog");
</script>

<article class="card hover:border-foreground relative">
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      {#if series}
        <a
          href={resolve(`series/${encodeURIComponent(seriesSlug ?? series)}/`)}
          class="text-muted hover:text-foreground relative z-10 mb-0.5 block truncate text-xs hover:underline"
          >{series}</a
        >
      {/if}
      <a
        href={url}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        class="text-foreground font-medium after:absolute after:inset-0 after:content-[''] hover:underline"
      >
        {title}
        {#if external}<ExternalLink class="text-muted mb-0.5 ml-0.5 inline size-3.5" aria-hidden="true" /><span
            class="sr-only"><LangText texts={{ ja: "（新しいタブで開く）", en: "(opens in a new tab)" }} /></span
          >{/if}
      </a>
      {#if description}
        <p class="text-muted mt-1 line-clamp-2 text-sm">{description}</p>
      {/if}
    </div>
    <span class="badge badge-{source}">{sourceLabels[source]}</span>
  </div>
  <div class="text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
    {#if publishedAt}
      <span>
        <LangText texts={{ ja: "公開", en: "Published" }} />:
        <time datetime={publishedAt}>{formatDate(publishedAt)}</time>
      </span>
      <span>
        <LangText texts={{ ja: "更新", en: "Updated" }} />:
        <time datetime={updatedAt}>{formatDate(updatedAt)}</time>
      </span>
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
