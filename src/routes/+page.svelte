<script lang="ts">
  import icon from "$lib/assets/icon.png";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import { author, site } from "$lib/config/site";
  import { socialLinks } from "$lib/config/social";

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.displayName,
    url: site.url,
    sameAs: socialLinks.map((link) => link.url),
  });
</script>

<Seo title="{author.displayName}'s Portfolio" {jsonLd} />

<section class="flex flex-col items-center justify-center gap-6 text-center">
  <img src={icon} alt={`${author.displayName}'s icon`} width="120" height="120" class="rounded-full" />
  <h1 class="text-3xl font-bold tracking-tight">
    <LangText texts={{ ja: "Naatinです 👋", en: "Hey, I'm Naatin 👋" }} />
  </h1>
  <p class="text-muted max-w-xl">
    <LangText
      texts={{
        ja: "趣味で開発している初学者です。試したこと・作ったものを少しずつ積み上げていく場所です。",
        en: "A hobbyist developer still learning the ropes. This is my playground — a place to try things out, tinker with whatever catches my eye, and slowly stack up what I make.",
      }}
    />
  </p>
</section>
