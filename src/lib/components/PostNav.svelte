<script lang="ts">
  import type { PostLink } from "$lib/types";
  import LangText from "./LangText.svelte";

  interface Props {
    prev: PostLink | null;
    next: PostLink | null;
  }

  let { prev, next }: Props = $props();
  const navLabelId = $props.id();
</script>

{#if prev || next}
  <nav
    class="border-border mt-10 flex items-center justify-between gap-4 border-t pt-6 text-sm"
    aria-labelledby={navLabelId}
  >
    <span id={navLabelId} class="sr-only"><LangText texts={{ ja: "記事ナビゲーション", en: "Post navigation" }} /></span
    >
    {#if prev}
      <a href="/posts/{prev.slug}/" class="text-muted hover:text-foreground max-w-[45%] truncate">← {prev.title}</a>
    {/if}
    {#if next}
      <a
        href="/posts/{next.slug}/"
        class="text-muted hover:text-foreground max-w-[45%] truncate text-right {prev ? '' : 'ml-auto'}"
      >
        {next.title} →
      </a>
    {/if}
  </nav>
{/if}
