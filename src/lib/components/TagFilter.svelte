<script lang="ts">
  interface Props {
    tags: string[];
    selected?: Set<string>;
  }

  let { tags, selected = $bindable(new Set<string>()) }: Props = $props();

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

<div role="group" aria-label="タグで絞り込む / Filter by tag" class="flex flex-wrap gap-2">
  {#each tags as tag (tag)}
    <button
      type="button"
      onclick={() => toggle(tag)}
      aria-pressed={selected.has(tag)}
      class="border-border aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-background rounded-full border px-3 py-1 text-xs transition-colors"
    >
      {tag}
    </button>
  {/each}
</div>
