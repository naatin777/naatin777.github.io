<script lang="ts">
  import { onMount } from "svelte";
  import type { TocItem } from "$lib/types";
  import LangText from "./LangText.svelte";

  interface Props {
    headings: TocItem[];
  }

  let { headings }: Props = $props();
  const navLabelId = $props.id();

  const tocHeadings = $derived(headings.filter((h) => h.depth === 2 || h.depth === 3));

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

{#if tocHeadings.length >= 3}
  <nav class="border-border mb-8 rounded-lg border p-4" aria-labelledby={navLabelId}>
    <p id={navLabelId} class="mb-2 text-sm font-bold"><LangText texts={{ ja: "目次", en: "Contents" }} /></p>
    <ul class="flex flex-col gap-1 text-sm">
      {#each tocHeadings as heading (heading.id)}
        <li class:pl-4={heading.depth === 3}>
          <a
            href="#{heading.id}"
            aria-current={activeId === heading.id ? "location" : undefined}
            class="text-muted hover:text-foreground aria-[current=location]:text-foreground aria-[current=location]:font-medium"
            >{heading.text}</a
          >
        </li>
      {/each}
    </ul>
  </nav>
{/if}
