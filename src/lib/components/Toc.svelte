<script lang="ts">
  import type { TocItem } from "$lib/types";
  import LangText from "./LangText.svelte";

  interface Props {
    headings: TocItem[];
  }

  let { headings }: Props = $props();
  const navLabelId = $props.id();

  const tocHeadings = $derived(headings.filter((h) => h.depth === 2 || h.depth === 3));
</script>

{#if tocHeadings.length >= 3}
  <nav class="border-border mb-8 rounded-lg border p-4" aria-labelledby={navLabelId}>
    <p id={navLabelId} class="mb-2 text-sm font-bold"><LangText texts={{ ja: "目次", en: "Contents" }} /></p>
    <ul class="flex flex-col gap-1 text-sm">
      {#each tocHeadings as heading (heading.id)}
        <li class:pl-4={heading.depth === 3}>
          <a href="#{heading.id}" class="text-muted hover:text-foreground">{heading.text}</a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}
