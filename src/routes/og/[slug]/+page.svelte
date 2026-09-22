<script lang="ts">
  import icon from "$lib/assets/icon.png";
  import { author, site } from "$lib/config/site";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{data.title}</title>
</svelte:head>

<!-- keep OG template pages out of the pagefind index; the generator screenshots .og-card -->
<div
  data-pagefind-ignore
  class="og-card flex h-[630px] w-[1200px] flex-col justify-between bg-[#0a0a0a] p-16 text-[#ededed]"
>
  <h1 class="text-5xl leading-tight font-bold tracking-tight">{data.title}</h1>
  <div class="flex items-center gap-4">
    <img src={icon} alt="" width="72" height="72" class="rounded-full" />
    <div>
      <p class="text-xl font-semibold">{author.displayName}</p>
      <p class="text-lg text-[#9ca3af]">{new URL(site.url).host}</p>
    </div>
  </div>
</div>
