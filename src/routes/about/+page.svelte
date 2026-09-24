<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import type { LocalizedText } from "$lib/config/i18n";
  import { sourceLabels, type ArticleSource } from "$lib/config/article-source";
  import { site } from "$lib/config/site";

  const writingPlaces: { source: ArticleSource; texts: LocalizedText }[] = [
    {
      source: "blog",
      texts: {
        ja: "自分自身の活動や過程の記録。開発記録、勉強記録、振り返りなど",
        en: "My own activity and process — dev logs, study notes, retrospectives",
      },
    },
    {
      source: "zenn",
      texts: {
        ja: "あるテーマを調べて整理した記事。俯瞰・まとめ・比較・体系化",
        en: "Researched and organized pieces on a theme — overviews, roundups, comparisons",
      },
    },
    {
      source: "qiita",
      texts: {
        ja: "具体的な技術知見。「これをやったらこうなった」「こう実装できる」",
        en: "Concrete technical findings — tried-this-got-that notes and how-tos",
      },
    },
  ];
</script>

<Seo title={`About · ${site.title}`} description="Naatinについて — プロフィール、連絡先、使っているツールや機材。" />

<section class="flex flex-col gap-10">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "運営者", en: "About" }} /></h1>

  <p class="text-muted text-sm">
    <LangText texts={{ ja: "準備中です。", en: "Under construction." }} />
  </p>

  <section class="flex flex-col gap-3">
    <h2 class="text-lg font-semibold"><LangText texts={{ ja: "書いている場所", en: "Where I write" }} /></h2>
    <ul class="flex flex-col gap-2">
      {#each writingPlaces as place (place.source)}
        <li class="flex items-baseline gap-2 text-sm">
          <span class="badge badge-{place.source}">{sourceLabels[place.source]}</span>
          <span class="text-muted"><LangText texts={place.texts} /></span>
        </li>
      {/each}
    </ul>
  </section>
</section>
