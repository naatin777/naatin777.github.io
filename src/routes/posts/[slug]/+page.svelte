<script lang="ts">
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
      {#each post.tags as tag (tag)}
        <span class="chip bg-surface">{tag}</span>
      {/each}
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
</article>
