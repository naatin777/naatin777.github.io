<script lang="ts">
  import { page } from "$app/state";
  import { site } from "$lib/config/site";

  interface Props {
    title: string;
    description?: string;
  }

  let { title, description = site.description }: Props = $props();

  const canonical = $derived(new URL(page.url.pathname, site.url).href);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:site_name" content={site.title} />
  <meta property="og:image" content="{site.url}/icon.png" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
</svelte:head>
