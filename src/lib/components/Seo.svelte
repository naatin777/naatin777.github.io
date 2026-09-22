<script lang="ts">
  import { page } from "$app/state";
  import { site } from "$lib/config/site";

  interface Props {
    title: string;
    description?: string;
    type?: "website" | "article";
    image?: string;
    publishedTime?: Date;
    modifiedTime?: Date | undefined;
    tags?: string[];
    jsonLd?: string;
  }

  let {
    title,
    description = site.description,
    type = "website",
    image = "/og-image.png",
    publishedTime,
    modifiedTime,
    tags = [],
    jsonLd,
  }: Props = $props();

  const canonical = $derived(new URL(page.url.pathname, site.url).href);
  const imageUrl = $derived(image.startsWith("http") ? image : `${site.url}${image}`);
  const imageAlt = $derived(`${title} — ${site.title}`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:site_name" content={site.title} />
  <meta property="og:locale" content="ja_JP" />
  <meta property="og:locale:alternate" content="en_US" />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={imageAlt} />
  {#if type === "article" && publishedTime}
    <meta property="article:published_time" content={publishedTime.toISOString()} />
    {#if modifiedTime}
      <meta property="article:modified_time" content={modifiedTime.toISOString()} />
    {/if}
    {#each tags as tag (tag)}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={imageUrl} />
  <meta name="twitter:image:alt" content={imageAlt} />
  {#if jsonLd}
    {@html `<script type="application/ld+json">${jsonLd}<\/script>`}
  {/if}
</svelte:head>
