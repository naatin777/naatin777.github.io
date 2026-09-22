<script lang="ts">
  import "@fontsource-variable/inter";
  import "@fontsource-variable/noto-sans-jp";
  import "../app.css";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import LangText from "$lib/components/LangText.svelte";
  import interWoff2 from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="preload" as="font" type="font/woff2" href={interWoff2} crossorigin="anonymous" />
</svelte:head>

<a href="#main" class="skip-link"><LangText texts={{ ja: "本文へスキップ", en: "Skip to content" }} /></a>
<Header />
<main id="main" class="mx-auto w-full max-w-3xl flex-1 px-4 py-10" tabindex="-1">
  {@render children()}
</main>
<Footer />
