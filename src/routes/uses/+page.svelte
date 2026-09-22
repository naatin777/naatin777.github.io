<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import type { Lang } from "$lib/config/i18n";

  // edit freely — tools, hardware, apps, anything you use
  const sections: { texts: Record<Lang, string>; items: string[] }[] = [
    {
      texts: { ja: "開発環境", en: "Development" },
      items: ["VS Code", "Git"],
    },
    {
      texts: { ja: "ハードウェア", en: "Hardware" },
      items: ["MacBook"],
    },
  ];
</script>

<Seo title="Uses · Naatin's Portfolio" description="Tools, apps, and hardware I use for development and daily work." />

<section class="flex flex-col gap-8">
  <h1 class="text-2xl font-bold tracking-tight">
    <LangText texts={{ ja: "使ってるもの", en: "Uses" }} />
  </h1>
  {#each sections as section (section.texts.en)}
    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-semibold"><LangText texts={section.texts} /></h2>
      <ul class="text-muted list-inside list-disc text-sm">
        {#each section.items as item (item)}
          <li>{item}</li>
        {/each}
      </ul>
    </section>
  {/each}
</section>
