<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import type { Lang } from "$lib/config/i18n";

  // add entries here — newest first
  const projects: { name: string; url: string; texts: Record<Lang, string> }[] = [];
</script>

<Seo title="Projects · Naatin's Portfolio" description="Things I have built, gathered in one place." />

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight">
    <LangText texts={{ ja: "プロジェクト", en: "Projects" }} />
  </h1>
  {#if projects.length === 0}
    <p class="text-muted text-sm">
      <LangText texts={{ ja: "まだ公開しているものはありません", en: "Nothing published yet" }} />
    </p>
  {:else}
    <ul class="flex flex-col gap-3">
      {#each projects as project (project.url)}
        <li class="border-border bg-surface flex flex-col gap-1 rounded-lg border p-4">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-accent text-sm font-semibold hover:underline"
          >
            {project.name}
          </a>
          <p class="text-muted text-sm"><LangText texts={project.texts} /></p>
        </li>
      {/each}
    </ul>
  {/if}
</section>
