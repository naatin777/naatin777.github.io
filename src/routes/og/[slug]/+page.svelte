<script lang="ts">
  import icon from "$lib/assets/icon.png";
  import { author, site } from "$lib/config/site";
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
  class="og-card bg-background text-foreground flex h-[630px] w-[1200px] flex-col justify-between p-16"
>
  <h1 class="text-5xl leading-tight font-bold tracking-tight">{data.title}</h1>
  <div class="flex items-center gap-4">
    <img src={icon} alt="" width="72" height="72" class="rounded-full" />
    <div>
      <p class="text-xl font-semibold">{author.displayName}</p>
      <p class="text-muted text-lg">{host}</p>
    </div>
  </div>
</div>
