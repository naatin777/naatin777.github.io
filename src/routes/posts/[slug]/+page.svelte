<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import PostNav from "$lib/components/PostNav.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import SeriesNav from "$lib/components/SeriesNav.svelte";
  import Toc from "$lib/components/Toc.svelte";
  import { author, site } from "$lib/config/site";
  import { formatDate } from "$lib/date";
  import type { PageProps } from "./$types";
  import "katex/dist/katex.min.css";

  let { data }: PageProps = $props();
  const post = $derived(data.post);

  const showUpdated = $derived(post.updatedAt !== null && post.updatedAt.getTime() !== post.publishedAt.getTime());

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
      image: `${site.url}/og/${post.slug}.png`,
      keywords: post.tags.join(", "),
      mainEntityOfPage: `${site.url}/posts/${post.slug}/`,
    }),
  );
</script>

<Seo
  title={`${post.title} · ${site.title}`}
  description={post.description || site.description}
  type="article"
  image={`/og/${post.slug}.png`}
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
        <span class="chip bg-surface">{tag}</span>
      {/each}
    </div>
  </header>
  {#if data.series}
    <SeriesNav name={data.series.name} posts={data.series.posts} currentSlug={post.slug} />
  {/if}
  <Toc headings={post.toc} />
  <div class="prose max-w-none">
    {@html post.html}
  </div>
  <PostNav prev={data.prev} next={data.next} />
</article>
