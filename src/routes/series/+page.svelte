<script lang="ts">
  import LangText from "#lib/components/LangText.svelte";
  import Seo from "#lib/components/Seo.svelte";
  import { site } from "#lib/config/site.js";
  import { formatDate } from "#lib/date.js";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Seo title={`Series · ${site.title}`} description="連載シリーズの一覧。" />

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "シリーズ", en: "Series" }} /></h1>
  <ul class="flex flex-col gap-3">
    {#each data.series as s (s.name)}
      <li>
        <a href={s.href} class="card hover:border-foreground block">
          <span class="font-medium">{s.name}</span>
          <span class="text-muted mt-1 block text-xs">
            <LangText texts={{ ja: `${s.count}話`, en: `${s.count} posts` }} /> · {formatDate(s.latestAt)} · {s.latestTitle}
          </span>
        </a>
      </li>
    {:else}
      <li class="text-muted text-sm">
        <LangText texts={{ ja: "シリーズはまだありません", en: "No series yet." }} />
      </li>
    {/each}
  </ul>
</section>
