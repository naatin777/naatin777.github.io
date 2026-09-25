<script lang="ts">
  import { page } from "$app/state";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { site } from "$lib/config/site";
</script>

<Seo title={`${page.status} · ${site.title}`} noindex />

<section class="flex flex-col items-center gap-4 text-center">
  <h1 class="text-4xl font-bold tracking-tight">{page.status}</h1>
  <p class="text-muted">
    <LangText
      texts={{
        ja: page.status === 404 ? "ページが見つかりません" : "エラーが発生しました",
        en: page.status === 404 ? "Page not found." : "Something went wrong.",
      }}
    />
  </p>
  <div class="flex items-center gap-4">
    <a href="/" class="text-foreground underline underline-offset-2">
      <LangText texts={{ ja: "ホームに戻る", en: "Back to home" }} />
    </a>
    <a href="/articles/" class="text-muted hover:text-foreground underline underline-offset-2">
      <LangText texts={{ ja: "記事一覧へ", en: "Browse articles" }} />
    </a>
  </div>
</section>
