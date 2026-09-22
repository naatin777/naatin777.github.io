<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import type { Lang } from "$lib/config/i18n";
  import { formatDate } from "$lib/date";

  // newest first
  const entries: { date: string; texts: Record<Lang, string> }[] = [
    {
      date: "2026-03-10",
      texts: {
        ja: "サイトをAstroからSvelteKitへ作り替え、デザインを刷新しました",
        en: "Rebuilt the site from Astro to SvelteKit with a new design",
      },
    },
  ];
</script>

<Seo
  title="Changelog · Naatin's Portfolio"
  description="A running changelog for updates and improvements made across this site."
/>

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "更新履歴", en: "Changelog" }} /></h1>
  <ul class="flex flex-col gap-3">
    {#each entries as entry (entry.date)}
      <li class="border-border bg-surface flex flex-col gap-1 rounded-lg border p-4">
        <time datetime={entry.date} class="text-muted text-xs">{formatDate(entry.date)}</time>
        <p class="text-sm"><LangText texts={entry.texts} /></p>
      </li>
    {/each}
  </ul>
</section>
