<script lang="ts">
  import { onMount } from "svelte";
  import type { TocItem } from "$lib/types";
  import LangText from "./LangText.svelte";

  interface Props {
    headings: TocItem[];
    // "inline": bordered box inside the article flow — shown below xl.
    // "sidebar": bare list for the sticky grid column — shown at xl+.
    variant?: "inline" | "sidebar";
  }

  interface TocNode extends TocItem {
    children: TocNode[];
  }

  let { headings, variant = "inline" }: Props = $props();
  const labelId = $props.id();

  const tocHeadings = $derived(headings.filter((h) => h.depth >= 2 && h.depth <= 4));

  // Fold the flat heading list into a tree: each node adopts following
  // deeper headings until a same-or-shallower one pops the stack.
  const tocTree = $derived.by(() => {
    const root: TocNode[] = [];
    const stack: TocNode[] = [];
    for (const h of tocHeadings) {
      const node: TocNode = { ...h, children: [] };
      while (stack.length > 0 && stack[stack.length - 1]!.depth >= h.depth) stack.pop();
      if (stack.length > 0) stack[stack.length - 1]!.children.push(node);
      else root.push(node);
      stack.push(node);
    }
    return root;
  });

  // Scroll-spy: the active entry is the last heading above the line just
  // under the sticky header. getBoundingClientRect is read live so lazy
  // images shifting the layout can't leave a stale highlight.
  let activeId = $state<string | null>(null);
  const updateActive = () => {
    let current: string | null = null;
    for (const h of tocHeadings) {
      const el = document.getElementById(h.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top > 96) break; // headings are in document order
      current = h.id;
    }
    activeId = current;
  };
  onMount(updateActive);
</script>

<svelte:window onscroll={updateActive} onresize={updateActive} />

{#snippet tocNodes(nodes: TocNode[], nested: boolean)}
  <ul class="flex flex-col gap-1 {nested ? 'border-border mt-1 ml-1 border-l pl-3' : 'text-sm'}">
    {#each nodes as node (node.id)}
      <li>
        <a
          href="#{node.id}"
          aria-current={activeId === node.id ? "location" : undefined}
          class="text-muted hover:text-foreground aria-[current=location]:text-foreground aria-[current=location]:font-medium"
          >{node.text}</a
        >
        {#if node.children.length > 0}
          {@render tocNodes(node.children, true)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

{#if tocHeadings.length >= 3}
  {#if variant === "inline"}
    <nav class="border-border mb-8 rounded-lg border p-4 xl:hidden" aria-labelledby={labelId}>
      <p id={labelId} class="mb-2 text-sm font-bold"><LangText texts={{ ja: "目次", en: "Contents" }} /></p>
      {@render tocNodes(tocTree, false)}
    </nav>
  {:else}
    <nav class="border-border rounded-lg border p-4" aria-labelledby={labelId}>
      <p id={labelId} class="mb-2 text-sm font-bold"><LangText texts={{ ja: "目次", en: "Contents" }} /></p>
      {@render tocNodes(tocTree, false)}
    </nav>
  {/if}
{/if}
