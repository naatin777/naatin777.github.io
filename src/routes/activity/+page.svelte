<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import type { LocalizedText } from "$lib/config/i18n";
  import { formatDate } from "$lib/date";

  // newest first
  const entries: { date: string; texts: LocalizedText }[] = [
    {
      date: "2026-03-10",
      texts: {
        ja: "サイトをAstroからSvelteKitへ作り替え、デザインを刷新しました",
        en: "Rebuilt the site from Astro to SvelteKit with a new design",
      },
    },
  ];
</script>

<Seo title="Activity · Naatin's Portfolio" description="A running log of updates and activity across this site." />

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "アクティビティ", en: "Activity" }} /></h1>
  <ul class="flex flex-col gap-3">
    {#each entries as entry (entry.date)}
      <li class="card flex flex-col gap-1">
        <time datetime={entry.date} class="text-muted text-xs">{formatDate(entry.date)}</time>
        <p class="text-sm"><LangText texts={entry.texts} /></p>
      </li>
    {/each}
  </ul>
</section>
