<script lang="ts">
  import "@fontsource-variable/inter";
  import "@fontsource-variable/noto-sans-jp";
  import "../app.css";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";

  let { children } = $props();
</script>

<Header />
<main class="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
  {@render children()}
</main>
<Footer />
