<script lang="ts">
  import { ArrowDown, ArrowUp } from "@lucide/svelte";
  import LangText from "$lib/components/LangText.svelte";
  import { selectionGroupKeydown } from "$lib/selection-group";
  import { sortKeys, sortOrders, type SortKey, type SortOrder } from "$lib/types";

  interface Props {
    value: SortKey;
    order: SortOrder;
    onsort: (key: SortKey) => void;
    onorder: (order: SortOrder) => void;
  }

  let { value, order, onsort, onorder }: Props = $props();
  // $props.id() may be called once — derive both group ids from the base.
  const baseId = $props.id();

  const keyLabels: Record<SortKey, { ja: string; en: string }> = {
    name: { ja: "タイトル", en: "Title" },
    published: { ja: "公開日", en: "Published" },
    updated: { ja: "更新日", en: "Updated" },
  };
  const orderLabels: Record<SortOrder, { ja: string; en: string }> = {
    asc: { ja: "昇順", en: "Asc" },
    desc: { ja: "降順", en: "Desc" },
  };
  const orderIcons: Record<SortOrder, typeof ArrowUp> = { asc: ArrowUp, desc: ArrowDown };
</script>

<div class="flex flex-wrap items-center gap-2">
  <div role="radiogroup" aria-labelledby="{baseId}-sort" tabindex="-1" onkeydown={selectionGroupKeydown} class="seg">
    <span id="{baseId}-sort" class="sr-only"><LangText texts={{ ja: "並び替え", en: "Sort by" }} /></span>
    {#each sortKeys as key (key)}
      <button
        type="button"
        role="radio"
        tabindex={value === key ? 0 : -1}
        onclick={() => onsort(key)}
        aria-checked={value === key}
        class="chip px-3 py-1"
      >
        <LangText texts={keyLabels[key]} />
      </button>
    {/each}
  </div>
  <div role="radiogroup" aria-labelledby="{baseId}-order" tabindex="-1" onkeydown={selectionGroupKeydown} class="seg">
    <span id="{baseId}-order" class="sr-only"><LangText texts={{ ja: "順序", en: "Sort order" }} /></span>
    {#each sortOrders as option (option)}
      {@const Icon = orderIcons[option]}
      <button
        type="button"
        role="radio"
        tabindex={order === option ? 0 : -1}
        onclick={() => onorder(option)}
        aria-checked={order === option}
        class="chip gap-1 px-3 py-1"
      >
        <Icon class="size-3.5" aria-hidden="true" />
        <LangText texts={orderLabels[option]} />
      </button>
    {/each}
  </div>
</div>
