<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import { sourceLabels, type ArticleSource } from "$lib/source";

  interface Props {
    sources: ArticleSource[];
    value: ArticleSource | null;
  }

  let { sources, value = $bindable() }: Props = $props();
</script>

<div role="group" aria-label="ソースで絞り込む / Filter by source" class="flex flex-wrap gap-2">
  <button type="button" onclick={() => (value = null)} aria-pressed={value === null} class="chip px-3 py-1">
    <LangText texts={{ ja: "すべて", en: "All" }} />
  </button>
  {#each sources as source (source)}
    <button type="button" onclick={() => (value = source)} aria-pressed={value === source} class="chip px-3 py-1">
      {sourceLabels[source]}
    </button>
  {/each}
</div>
