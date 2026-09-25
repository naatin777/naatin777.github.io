<script lang="ts">
  import { ArrowUp, Check, Link } from "@lucide/svelte";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import SeriesNav from "$lib/components/SeriesNav.svelte";
  import Toc from "$lib/components/Toc.svelte";
  import { defaultLang } from "$lib/config/i18n";
  import { selectionGroupKeydown } from "$lib/selection-group";
  import { author, site } from "$lib/config/site";
  import { formatDate } from "$lib/date";
  import type { PageProps } from "./$types";
  import "katex/dist/katex.min.css";

  let { data }: PageProps = $props();
  const post = $derived(data.post);
  const uid = $props.id();
  const copyLabelId = `${uid}-copy`;
  const pagerLabelId = `${uid}-pager`;
  const topLabelId = `${uid}-top`;

  let linkCopied = $state(false);
  let showTop = $state(false);

  const showUpdated = $derived(post.updatedAt !== null && post.updatedAt.getTime() !== post.publishedAt.getTime());

  const jsonLd = $derived(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description || site.description,
      datePublished: post.publishedAt.toISOString(),
      dateModified: (post.updatedAt ?? post.publishedAt).toISOString(),
      inLanguage: defaultLang,
      author: { "@type": "Person", name: author.displayName, url: site.url },
      image: `${site.url}/og/${post.slug}.png`,
      keywords: post.tags.join(", "),
      mainEntityOfPage: `${site.url}/posts/${post.slug}/`,
    }),
  );

  const onArticleClick = async (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target;

    // mermaid preview/source tabs (APG tabs: roving tabindex + aria-selected)
    const tab = target.closest<HTMLButtonElement>(".mermaid-tab");
    if (tab) {
      const block = tab.closest(".mermaid-block");
      if (!block) return;
      const pane = tab.dataset.tab;
      block.querySelectorAll<HTMLButtonElement>(".mermaid-tab").forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
      });
      block.querySelectorAll<HTMLElement>(".mermaid-pane").forEach((p) => {
        p.hidden = p.dataset.pane !== pane;
      });
      return;
    }

    const button = target.closest<HTMLButtonElement>(".code-copy");
    if (!button) return;
    // Code blocks copy their code; the mermaid bar button copies the
    // diagram source — target the source pane explicitly since the
    // preview pane (SVG/foreignObject) could contain stray <code> too.
    const block = button.closest(".code-block, .mermaid-block");
    const code = block?.classList.contains("mermaid-block")
      ? block.querySelector('[data-pane="source"] code')?.textContent
      : block?.querySelector("code")?.textContent;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.replace(/\n+$/, ""));
      button.classList.add("copied");
      button.setAttribute("aria-label", "コピーしました");
      setTimeout(() => {
        button.classList.remove("copied");
        button.setAttribute("aria-label", "コードをコピー");
      }, 1500);
    } catch {
      // clipboard unavailable (permissions, insecure context) — no-op
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${site.url}/posts/${post.slug}/`);
      linkCopied = true;
      setTimeout(() => (linkCopied = false), 1500);
    } catch {
      // clipboard unavailable (permissions, insecure context) — no-op
    }
  };

  // Move focus too, not just the viewport — otherwise keyboard users keep
  // their focus at the bottom while the page jumps away.
  const toTop = () => {
    document.getElementById("main")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  };
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

<!-- Delegated clicks only reach real <button>s (copy / mermaid tabs), which
     handle their own activation; the delegated keydown adds arrow-key
     navigation for the tablists. The article itself is not interactive. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions -->
<article onclick={onArticleClick} onkeydown={selectionGroupKeydown}>
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
        <LangText texts={{ ja: `約${post.readingTime}分`, en: `${post.readingTime} min read` }} />
      </span>
      {#each post.tags as tag (tag)}
        <span class="chip bg-surface">{tag}</span>
      {/each}
      <button
        type="button"
        onclick={copyLink}
        aria-labelledby={copyLabelId}
        class="hover:text-foreground -m-1 ml-auto inline-flex items-center p-1 transition-colors"
      >
        <span id={copyLabelId} class="sr-only">
          <LangText
            texts={linkCopied
              ? { ja: "リンクをコピーしました", en: "Link copied" }
              : { ja: "記事のリンクをコピー", en: "Copy link to this post" }}
          />
        </span>
        {#if linkCopied}
          <Check class="size-4" aria-hidden="true" />
        {:else}
          <Link class="size-4" aria-hidden="true" />
        {/if}
      </button>
    </div>
  </header>
  {#if data.series}
    <SeriesNav name={data.series.name} posts={data.series.posts} currentSlug={post.slug} />
  {/if}
  <Toc headings={post.toc} />
  <!-- Post content is authored in Japanese — including pipeline-generated
       labels (copy buttons, heading anchors, mermaid tabs). lang="ja" keeps
       screen readers correct when the UI language is switched to English. -->
  <div class="prose max-w-none" lang="ja">
    {@html post.html}
  </div>
  {#if data.newer || data.older}
    <nav aria-labelledby={pagerLabelId} class="border-border mt-10 grid grid-cols-2 gap-4 border-t pt-6 text-sm">
      <span id={pagerLabelId} class="sr-only"><LangText texts={{ ja: "前後の記事", en: "Adjacent posts" }} /></span>
      <span class="flex min-w-0 flex-col gap-1">
        {#if data.older}
          <span class="text-muted text-xs"><LangText texts={{ ja: "前の記事", en: "Older" }} /></span>
          <a href="/posts/{data.older.slug}/" class="truncate font-medium hover:underline">
            <span aria-hidden="true">← </span>{data.older.title}
          </a>
        {/if}
      </span>
      <span class="flex min-w-0 flex-col items-end gap-1 text-right">
        {#if data.newer}
          <span class="text-muted text-xs"><LangText texts={{ ja: "次の記事", en: "Newer" }} /></span>
          <a href="/posts/{data.newer.slug}/" class="truncate font-medium hover:underline">
            {data.newer.title}<span aria-hidden="true"> →</span>
          </a>
        {/if}
      </span>
    </nav>
  {/if}
</article>

<svelte:window onscroll={() => (showTop = window.scrollY > 800)} />
{#if showTop}
  <button
    type="button"
    onclick={toTop}
    aria-labelledby={topLabelId}
    class="border-border bg-surface text-muted hover:text-foreground fixed right-6 bottom-6 z-20 flex size-10 items-center justify-center rounded-full border shadow-sm transition-colors"
  >
    <span id={topLabelId} class="sr-only"><LangText texts={{ ja: "ページの先頭へ戻る", en: "Back to top" }} /></span>
    <ArrowUp class="size-5" aria-hidden="true" />
  </button>
{/if}
