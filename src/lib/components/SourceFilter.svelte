<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import { sourceLabels, type ArticleSource } from "$lib/config/article-source";
  import { radioGroupKeydown } from "$lib/radio-group";

  interface Props {
    sources: ArticleSource[];
    value: ArticleSource | null;
  }

  let { sources, value = $bindable() }: Props = $props();
  const groupLabelId = $props.id();
</script>

<div
  role="radiogroup"
  aria-labelledby={groupLabelId}
  tabindex="-1"
  onkeydown={radioGroupKeydown}
  class="flex flex-wrap gap-2"
>
  <span id={groupLabelId} class="sr-only"><LangText texts={{ ja: "ソースで絞り込む", en: "Filter by source" }} /></span>
  <button
    type="button"
    role="radio"
    tabindex={value === null ? 0 : -1}
    onclick={() => (value = null)}
    aria-checked={value === null}
    class="chip px-3 py-1"
  >
    <LangText texts={{ ja: "すべて", en: "All" }} />
  </button>
  {#each sources as source (source)}
    <button
      type="button"
      role="radio"
      tabindex={value === source ? 0 : -1}
      onclick={() => (value = source)}
      aria-checked={value === source}
      class="chip px-3 py-1"
    >
      {sourceLabels[source]}
    </button>
  {/each}
</div>
