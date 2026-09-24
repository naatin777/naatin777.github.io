<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import type { LocalizedText } from "$lib/config/i18n";
  import { site } from "$lib/config/site";

  // add entries here — newest first
  const projects: { name: string; url: string; texts: LocalizedText }[] = [];
</script>

<Seo title={`Projects · ${site.title}`} description="作ったものをひとまとめに。" />

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight">
    <LangText texts={{ ja: "制作物", en: "Projects" }} />
  </h1>
  {#if projects.length === 0}
    <p class="text-muted text-sm">
      <LangText texts={{ ja: "準備中です。", en: "Under construction." }} />
    </p>
  {:else}
    <ul class="flex flex-col gap-3">
      {#each projects as project (project.url)}
        <li class="card flex flex-col gap-1">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-foreground text-sm font-semibold hover:underline"
          >
            {project.name}
          </a>
          <p class="text-muted text-sm"><LangText texts={project.texts} /></p>
        </li>
      {/each}
    </ul>
  {/if}
</section>
