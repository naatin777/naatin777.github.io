<script lang="ts">
  interface Props {
    title: string;
    url: string;
    tags: string[];
    source: "zenn" | "qiita" | "blog";
    emoji?: string | null;
    updatedAt: string | null;
  }

  let { title, url, tags, source, emoji = null, updatedAt }: Props = $props();

  const external = $derived(source !== "blog");
  const sourceLabels = { zenn: "Zenn", qiita: "Qiita", blog: "Blog" } as const;
</script>

<article class="reveal border-border bg-surface hover:border-accent rounded-lg border p-4 transition-colors">
  <div class="flex items-start justify-between gap-3">
    <a
      href={url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      class="text-foreground hover:text-accent font-medium"
    >
      {#if emoji}<span aria-hidden="true">{emoji} </span>{/if}{title}
    </a>
    <span class="border-border text-muted shrink-0 rounded border px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
      {sourceLabels[source]}
    </span>
  </div>
  <div class="text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
    {#if updatedAt}
      <time datetime={updatedAt}>{updatedAt.slice(0, 10)}</time>
    {/if}
    {#each tags as tag (tag)}
      <span class="bg-background rounded-full px-2 py-0.5">{tag}</span>
    {/each}
  </div>
</article>
