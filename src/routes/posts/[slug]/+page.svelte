<script lang="ts">
  import { resolve } from "$app/paths";
  import { ArrowUp } from "@lucide/svelte";
  import { handleArticleClick, handleArticleKeydown } from "#lib/article-interactions.js";
  import LangText from "#lib/components/LangText.svelte";
  import Seo from "#lib/components/Seo.svelte";
  import SeriesNav from "#lib/components/SeriesNav.svelte";
  import Toc from "#lib/components/Toc.svelte";
  import { defaultLang } from "#lib/config/i18n.js";
  import { author, site } from "#lib/config/site.js";
  import { formatDate } from "#lib/date.js";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const post = $derived(data.post);
  const uid = $props.id();
  const pagerLabelId = `${uid}-pager`;
  const topLabelId = `${uid}-top`;

  let showTop = $state(false);

  const showUpdated = $derived(post.updatedAt.getTime() !== post.publishedAt.getTime());
  // Same h2–h4 >= 3 rule as Toc — needed here to decide whether the aside
  // column exists at all, so the article isn't offset by an empty track.
  const hasToc = $derived(post.toc.filter((h) => h.depth >= 2 && h.depth <= 4).length >= 3);

  const jsonLd = $derived(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description || site.description,
      datePublished: post.publishedAt.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      inLanguage: defaultLang,
      author: { "@type": "Person", name: author.displayName, url: site.url },
      image: `${site.url}/og/${post.slug}.png`,
      keywords: post.tags.join(", "),
      mainEntityOfPage: `${site.url}${resolve(`posts/${post.slug}/`)}`,
    }),
  );

  // Move focus too, not just the viewport — otherwise keyboard users keep
  // their focus at the bottom while the page jumps away.
  const toTop = () => {
    document.getElementById("main")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  };
</script>

<svelte:head>
  {#if post.hasMath}
    <!-- Vendored from node_modules by the katex-vendor vite plugin — a
         bundled CSS import can't be conditional, and ?url would break the
         stylesheet's relative font urls. -->
    <link rel="stylesheet" href="/vendor/katex/katex.min.css" />
  {/if}
</svelte:head>

<Seo
  title={`${post.title} · ${site.title}`}
  description={post.description || site.description}
  type="article"
  image={`/og/${post.slug}.png`}
  publishedTime={post.publishedAt}
  modifiedTime={post.updatedAt}
  tags={post.tags}
  {jsonLd}
/>

<!-- Two-column grid at xl+ when the post has a ToC: the article keeps its
     readable max-w-3xl width, the sticky ToC sidebar takes the second track.
     Below xl (or with too few headings) it's a plain centered column. -->
<div class={hasToc ? "xl:grid xl:grid-cols-[minmax(0,48rem)_14rem] xl:justify-center xl:gap-12" : ""}>
  <!-- Delegated clicks only reach real <button>s (copy / mermaid tabs), which
       handle their own activation; the delegated keydown adds arrow-key
       navigation for the tablists and scrollable tables. The article itself is not interactive. -->
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions -->
  <article onclick={handleArticleClick} onkeydown={handleArticleKeydown}>
    <header class="border-border mb-8 flex flex-col gap-2 border-b pb-6">
      <h1 class="text-4xl font-bold tracking-tight">{post.title}</h1>
      {#if post.description}
        <p class="text-muted">{post.description}</p>
      {/if}
      <div class="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span>
          <LangText texts={{ ja: "公開", en: "Published" }} />:
          <time datetime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
        </span>
        {#if showUpdated}
          <span>
            <LangText texts={{ ja: "更新", en: "Updated" }} />:
            <time datetime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)}</time>
          </span>
        {/if}
        {#each post.tags as tag (tag)}
          <span class="chip bg-surface">{tag}</span>
        {/each}
      </div>
    </header>
    <Toc headings={post.toc} />
    <!-- Post content is authored in Japanese — including pipeline-generated
       labels (copy buttons, heading anchors, mermaid tabs). lang="ja" keeps
       screen readers correct when the UI language is switched to English. -->
    <div class="prose max-w-none" lang="ja">
      {@html post.html}
    </div>
    {#if data.series}
      <div class="mt-10">
        <SeriesNav name={data.series.name} slug={data.series.slug} posts={data.series.posts} currentSlug={post.slug} />
      </div>
    {/if}
    {#if data.newer || data.older}
      <nav
        aria-labelledby={pagerLabelId}
        class="border-border grid grid-cols-2 gap-4 border-t pt-6 text-sm{data.series ? '' : ' mt-10'}"
      >
        <span id={pagerLabelId} class="sr-only"><LangText texts={{ ja: "前後の記事", en: "Adjacent posts" }} /></span>
        <span class="flex min-w-0 flex-col gap-1">
          {#if data.older}
            <span class="text-muted text-xs"><LangText texts={{ ja: "前の記事", en: "Older" }} /></span>
            <a href={resolve(`posts/${data.older.slug}/`)} class="truncate font-medium hover:underline">
              <span aria-hidden="true">← </span>{data.older.title}
            </a>
          {/if}
        </span>
        <span class="flex min-w-0 flex-col items-end gap-1 text-right">
          {#if data.newer}
            <span class="text-muted text-xs"><LangText texts={{ ja: "次の記事", en: "Newer" }} /></span>
            <a href={resolve(`posts/${data.newer.slug}/`)} class="truncate font-medium hover:underline">
              {data.newer.title}<span aria-hidden="true"> →</span>
            </a>
          {/if}
        </span>
      </nav>
    {/if}
  </article>
  {#if hasToc}
    <aside class="hidden xl:block">
      <div class="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto">
        <Toc headings={post.toc} variant="sidebar" />
      </div>
    </aside>
  {/if}
</div>

<svelte:window onscroll={() => (showTop = window.scrollY > 800)} />
{#if showTop}
  <button
    type="button"
    onclick={toTop}
    aria-labelledby={topLabelId}
    class="border-border bg-surface text-muted hover:text-foreground fixed right-6 bottom-6 z-20 flex size-10 items-center justify-center rounded-full border shadow-sm transition starting:opacity-0"
  >
    <span id={topLabelId} class="sr-only"><LangText texts={{ ja: "ページの先頭へ戻る", en: "Back to top" }} /></span>
    <ArrowUp class="size-5" aria-hidden="true" />
  </button>
{/if}
