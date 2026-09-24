<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import type { LocalizedText } from "$lib/config/i18n";
  import { site } from "$lib/config/site";
  import { formatDate } from "$lib/date";

  // newest first
  const entries: { date: string; texts: LocalizedText }[] = [];
</script>

<Seo title={`Activity · ${site.title}`} description="このサイトの更新と活動のログ。" />

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "活動", en: "Activity" }} /></h1>
  {#if entries.length === 0}
    <p class="text-muted text-sm">
      <LangText texts={{ ja: "準備中です。", en: "Under construction." }} />
    </p>
  {:else}
    <ul class="flex flex-col gap-3">
      {#each entries as entry (entry.date)}
        <li class="card flex flex-col gap-1">
          <time datetime={entry.date} class="text-muted text-xs">{formatDate(entry.date)}</time>
          <p class="text-sm"><LangText texts={entry.texts} /></p>
        </li>
      {/each}
    </ul>
  {/if}
</section>
