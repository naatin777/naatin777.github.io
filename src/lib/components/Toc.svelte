<script lang="ts">
  import LangText from "./LangText.svelte";

  interface TocHeading {
    id: string;
    text: string;
    depth: number;
  }

  interface Props {
    headings: TocHeading[];
  }

  let { headings }: Props = $props();

  const tocHeadings = $derived(headings.filter((h) => h.depth === 2 || h.depth === 3));
</script>

{#if tocHeadings.length >= 3}
  <nav class="border-border mb-8 rounded-lg border p-4" aria-label="Table of contents">
    <p class="mb-2 text-sm font-bold"><LangText texts={{ ja: "目次", en: "Contents" }} /></p>
    <ul class="flex flex-col gap-1 text-sm">
      {#each tocHeadings as heading (heading.id)}
        <li class:pl-4={heading.depth === 3}>
          <a href="#{heading.id}" class="text-muted hover:text-foreground">{heading.text}</a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}
