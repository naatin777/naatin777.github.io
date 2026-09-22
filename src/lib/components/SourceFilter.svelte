<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import { sourceLabels, type ArticleSource } from "$lib/source";

  interface Props {
    sources: ArticleSource[];
    value?: ArticleSource | null;
  }

  let { sources, value = $bindable(null) }: Props = $props();
</script>

<div role="group" aria-label="ソースで絞り込む / Filter by source" class="flex flex-wrap gap-2">
  <button
    type="button"
    onclick={() => (value = null)}
    aria-pressed={value === null}
    class="border-border aria-pressed:border-accent aria-pressed:bg-background rounded-full border px-3 py-1 text-xs transition-colors aria-pressed:text-accent"
  >
    <LangText texts={{ ja: "すべて", en: "All" }} />
  </button>
  {#each sources as source (source)}
    <button
      type="button"
      onclick={() => (value = source)}
      aria-pressed={value === source}
      class="border-border aria-pressed:border-accent aria-pressed:bg-background rounded-full border px-3 py-1 text-xs transition-colors aria-pressed:text-accent"
    >
      {sourceLabels[source]}
    </button>
  {/each}
</div>
