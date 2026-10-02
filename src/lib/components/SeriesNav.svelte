<script lang="ts">
  import { resolve } from "$app/paths";
  import type { PostLink } from "#lib/types.js";
  import LangText from "./LangText.svelte";

  interface Props {
    name: string;
    slug: string;
    posts: PostLink[];
    currentSlug: string;
  }

  let { name, slug, posts, currentSlug }: Props = $props();
  const navLabelId = $props.id();
</script>

<nav class="card mb-8" aria-labelledby={navLabelId}>
  <p id={navLabelId} class="mb-2 text-sm font-bold">
    <LangText texts={{ ja: "シリーズ", en: "Series" }} />:
    <a href={resolve(`series/${encodeURIComponent(slug)}/`)} class="hover:underline">{name}</a>
  </p>
  <ol class="flex list-decimal flex-col gap-1 pl-5 text-sm">
    {#each posts as seriesPost (seriesPost.slug)}
      <li
        class:font-semibold={seriesPost.slug === currentSlug}
        aria-current={seriesPost.slug === currentSlug ? "true" : undefined}
      >
        {#if seriesPost.slug === currentSlug}
          <span class="text-foreground">{seriesPost.title}</span>
        {:else}
          <a href={resolve(`posts/${seriesPost.slug}/`)} class="text-muted hover:text-foreground">{seriesPost.title}</a>
        {/if}
        {#if seriesPost.description}
          <span class="text-muted block text-xs">{seriesPost.description}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
