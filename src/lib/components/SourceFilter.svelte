<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import { sourceLabels, type ArticleSource } from "$lib/config/article-source";
  import { selectionGroupKeydown } from "$lib/selection-group";

  interface Props {
    sources: ArticleSource[];
    value: ArticleSource | null;
    onchange: (value: ArticleSource | null) => void;
  }

  let { sources, value, onchange }: Props = $props();
  const groupLabelId = $props.id();
</script>

<div
  role="radiogroup"
  aria-labelledby={groupLabelId}
  tabindex="-1"
  onkeydown={selectionGroupKeydown}
  class="flex flex-wrap gap-2"
>
  <span id={groupLabelId} class="sr-only"><LangText texts={{ ja: "ソースで絞り込む", en: "Filter by source" }} /></span>
  <button
    type="button"
    role="radio"
    tabindex={value === null ? 0 : -1}
    onclick={() => onchange(null)}
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
      onclick={() => onchange(source)}
      aria-checked={value === source}
      class="chip px-3 py-1"
    >
      {sourceLabels[source]}
    </button>
  {/each}
</div>
