<script lang="ts">
  import { page } from "$app/state";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { site } from "$lib/config/site";
</script>

<Seo title={`${page.status} · ${site.title}`} noindex />

<section class="flex flex-col items-center gap-4 text-center" data-pagefind-ignore>
  <h1 class="text-4xl font-bold tracking-tight">{page.status}</h1>
  <p class="text-muted">
    <LangText texts={{ ja: "ページが見つかりません", en: page.error?.message ?? "Something went wrong." }} />
  </p>
  <a href="/" class="text-foreground underline underline-offset-2">
    <LangText texts={{ ja: "ホームに戻る", en: "Back to home" }} />
  </a>
</section>
