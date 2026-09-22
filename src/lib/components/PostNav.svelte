<script lang="ts">
  interface NavPost {
    slug: string;
    title: string;
  }

  interface Props {
    prev: NavPost | null;
    next: NavPost | null;
  }

  let { prev, next }: Props = $props();
</script>

{#if prev || next}
  <nav
    class="border-border mt-10 flex items-center justify-between gap-4 border-t pt-6 text-sm"
    aria-label="Post navigation"
  >
    {#if prev}
      <a href="/posts/{prev.slug}/" class="text-muted hover:text-foreground max-w-[45%] truncate">← {prev.title}</a>
    {:else}
      <span></span>
    {/if}
    {#if next}
      <a href="/posts/{next.slug}/" class="text-muted hover:text-foreground max-w-[45%] truncate text-right">
        {next.title} →
      </a>
    {/if}
  </nav>
{/if}
