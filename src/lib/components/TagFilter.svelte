<script lang="ts">
  import LangText from "./LangText.svelte";

  interface Props {
    tags: string[];
    selected: Set<string>;
    ontoggle: (tag: string) => void;
  }

  let { tags, selected, ontoggle }: Props = $props();
  const groupLabelId = $props.id();
</script>

<div role="group" aria-labelledby={groupLabelId} class="flex flex-wrap gap-2">
  <span id={groupLabelId} class="sr-only"><LangText texts={{ ja: "タグで絞り込む", en: "Filter by tag" }} /></span>
  {#each tags as tag (tag)}
    <button type="button" onclick={() => ontoggle(tag)} aria-pressed={selected.has(tag)} class="chip px-3 py-1">
      {tag}
    </button>
  {/each}
</div>
