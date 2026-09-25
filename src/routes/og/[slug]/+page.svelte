<script lang="ts">
  import icon from "$lib/assets/icon.png";
  import { author, site } from "$lib/config/site";
  import { formatDate } from "$lib/date";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const host = new URL(site.url).host;
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{data.title}</title>
</svelte:head>

<!-- OG cards are always dark regardless of the user's theme, so pin it
     here and reuse the theme tokens instead of duplicating the palette. -->
<div
  data-theme="dark"
  class="og-card bg-background text-foreground relative flex h-[630px] w-[1200px] flex-col justify-between p-16"
>
  <!-- hairline frame inset from the card edge -->
  <div class="border-border pointer-events-none absolute inset-5 rounded-md border"></div>

  <div class="flex flex-1 items-start justify-center pt-24">
    <h1 class="line-clamp-3 text-center text-6xl leading-tight font-bold tracking-tight">{data.title}</h1>
  </div>

  <div class="flex items-end justify-between gap-8">
    <div class="flex items-center gap-4">
      <img src={icon} alt="" width={80} height={80} class="rounded-full" />
      <div>
        <p class="text-2xl font-semibold">{author.displayName}</p>
        <p class="text-muted text-xl">{host}</p>
      </div>
    </div>
    <div class="flex flex-col items-end gap-3">
      {#if data.tags.length > 0}
        <div class="flex gap-2">
          {#each data.tags as tag (tag)}
            <span class="chip bg-surface px-3 py-1 text-base">{tag}</span>
          {/each}
        </div>
      {/if}
      <time class="text-muted text-xl" datetime={data.publishedAt}>{formatDate(data.publishedAt)}</time>
    </div>
  </div>
</div>
