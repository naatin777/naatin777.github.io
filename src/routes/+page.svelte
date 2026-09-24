<script lang="ts">
  import icon from "$lib/assets/icon.png?enhanced";
  import ArticleCard from "$lib/components/ArticleCard.svelte";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { author, site } from "$lib/config/site";
  import { socialLinks } from "$lib/config/social";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: author.displayName,
        url: site.url,
        sameAs: socialLinks.map((link) => link.url),
      },
      {
        "@type": "WebSite",
        name: site.title,
        url: site.url,
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${site.url}/articles/?q={query}` },
          "query-input": "required name=query",
        },
      },
    ],
  });
</script>

<Seo title={site.title} {jsonLd} />

<section class="flex flex-col items-center justify-center gap-6 text-center">
  <enhanced:img src={icon} alt={`${author.displayName}'s icon`} class="size-30 rounded-full" />
  <h1 class="text-3xl font-bold tracking-tight">
    <LangText texts={{ ja: "仮サイト", en: "Temporary site" }} />
  </h1>
  <p class="text-muted max-w-xl">
    <LangText
      texts={{
        ja: "準備中です。",
        en: "Under construction.",
      }}
    />
  </p>
</section>

{#if data.articles.length > 0}
  <section class="mt-12 flex flex-col gap-4">
    <div class="flex items-baseline justify-between">
      <h2 class="text-lg font-semibold"><LangText texts={{ ja: "最近の記事", en: "Recent articles" }} /></h2>
      <a href="/articles/" class="text-muted hover:text-foreground text-sm transition-colors">
        <LangText texts={{ ja: "すべて見る", en: "View all" }} /> →
      </a>
    </div>
    <ul class="flex flex-col gap-3">
      {#each data.articles as article (article.url)}
        <li>
          <ArticleCard
            title={article.title}
            url={article.url}
            tags={article.tags}
            source={article.source}
            series={article.series}
            publishedAt={article.publishedAt}
          />
        </li>
      {/each}
    </ul>
  </section>
{/if}
