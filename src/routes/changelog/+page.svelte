<script lang="ts">
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
</script>

<Seo
  title="Changelog · Naatin's Portfolio"
  description="A running changelog for updates and improvements made across this site."
/>

<section class="flex flex-col gap-6">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "更新履歴", en: "Changelog" }} /></h1>
  <p class="text-muted text-sm">
    <LangText texts={{ ja: "まだエントリーはありません", en: "No entries yet." }} />
  </p>
</section>
