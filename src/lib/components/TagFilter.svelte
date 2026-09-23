<script lang="ts">
  import LangText from "./LangText.svelte";

  interface Props {
    tags: string[];
    selected: Set<string>;
  }

  let { tags, selected = $bindable() }: Props = $props();
  const groupLabelId = $props.id();

  function toggle(tag: string): void {
    const next = new Set(selected);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    selected = next;
  }
</script>

<div role="group" aria-labelledby={groupLabelId} class="flex flex-wrap gap-2">
  <span id={groupLabelId} class="sr-only"><LangText texts={{ ja: "タグで絞り込む", en: "Filter by tag" }} /></span>
  {#each tags as tag (tag)}
    <button type="button" onclick={() => toggle(tag)} aria-pressed={selected.has(tag)} class="chip px-3 py-1">
      {tag}
    </button>
  {/each}
</div>
