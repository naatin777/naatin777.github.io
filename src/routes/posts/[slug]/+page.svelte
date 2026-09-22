<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
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
</script>

<Seo title={`${post.title} · ${site.title}`} description={post.description || site.description} />

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
      {#each post.tags as tag (tag)}
        <span class="bg-surface rounded-full px-2 py-0.5 text-xs">{tag}</span>
      {/each}
    </div>
  </header>
  <div class="prose dark:prose-invert max-w-none">
    {@html post.html}
  </div>
</article>
