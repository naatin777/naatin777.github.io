<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { author } from "$lib/config/author";
  import { site } from "$lib/config/site";
  import type { PageProps } from "./$types";
  import "katex/dist/katex.min.css";

  let { data }: PageProps = $props();
  const post = $derived(data.post);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const showUpdated = $derived(post.updatedAt !== null && post.updatedAt.getTime() !== post.publishedAt.getTime());

  const tocHeadings = $derived(post.toc.filter((h) => h.depth === 2 || h.depth === 3));

  const jsonLd = $derived(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description || site.description,
      datePublished: post.publishedAt.toISOString(),
      dateModified: (post.updatedAt ?? post.publishedAt).toISOString(),
      inLanguage: "ja",
      author: { "@type": "Person", name: author.displayName, url: site.url },
      keywords: post.tags.join(", "),
      mainEntityOfPage: `${site.url}/posts/${post.slug}/`,
    }),
  );
</script>

<Seo
  title={`${post.title} · ${site.title}`}
  description={post.description || site.description}
  type="article"
  publishedTime={post.publishedAt}
  modifiedTime={post.updatedAt ?? undefined}
  tags={post.tags}
  {jsonLd}
/>

<article>
  <header class="border-border mb-8 flex flex-col gap-2 border-b pb-6">
    <h1 class="text-2xl font-bold tracking-tight">{post.title}</h1>
    <div class="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <time datetime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
      {#if showUpdated && post.updatedAt}
        <span>
          <LangText texts={{ ja: "更新", en: "Updated" }} />:
          <time datetime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)}</time>
        </span>
      {/if}
      <span>
        <LangText texts={{ ja: `${post.readingTime}分で読めます`, en: `${post.readingTime} min read` }} />
      </span>
      {#each post.tags as tag (tag)}
        <span class="bg-surface rounded-full px-2 py-0.5 text-xs">{tag}</span>
      {/each}
    </div>
  </header>
  {#if tocHeadings.length >= 3}
    <nav class="border-border mb-8 rounded-lg border p-4" aria-label="Table of contents">
      <p class="mb-2 text-sm font-bold"><LangText texts={{ ja: "目次", en: "Contents" }} /></p>
      <ul class="flex flex-col gap-1 text-sm">
        {#each tocHeadings as heading (heading.id)}
          <li class:pl-4={heading.depth === 3}>
            <a href="#{heading.id}" class="text-muted hover:text-foreground">{heading.text}</a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
  <div class="prose dark:prose-invert max-w-none">
    {@html post.html}
  </div>
  {#if data.prev || data.next}
    <nav
      class="border-border mt-10 flex items-center justify-between gap-4 border-t pt-6 text-sm"
      aria-label="Post navigation"
    >
      {#if data.prev}
        <a href="/posts/{data.prev.slug}/" class="text-muted hover:text-foreground max-w-[45%] truncate">
          ← {data.prev.title}
        </a>
      {:else}
        <span></span>
      {/if}
      {#if data.next}
        <a href="/posts/{data.next.slug}/" class="text-muted hover:text-foreground max-w-[45%] truncate text-right">
          {data.next.title} →
        </a>
      {/if}
    </nav>
  {/if}
</article>
