<script lang="ts">
  import icon from "$lib/assets/icon.png?enhanced";
  import LangText from "$lib/components/LangText.svelte";
  import Seo from "$lib/components/Seo.svelte";
  import SocialIcon from "$lib/components/SocialIcon.svelte";
  import type { LocalizedText } from "$lib/config/i18n";
  import { author, site } from "$lib/config/site";
  import { socialLinks } from "$lib/config/social";

  // edit freely — tools, hardware, apps, anything you use
  const gear: { texts: LocalizedText; items: string[] }[] = [
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

<Seo title={`About · ${site.title}`} description="Naatinについて — プロフィール、連絡先、使っているツールや機材。" />

<section class="flex flex-col gap-10">
  <h1 class="text-2xl font-bold tracking-tight"><LangText texts={{ ja: "自己紹介", en: "About" }} /></h1>

  <section class="flex items-center gap-4">
    <enhanced:img src={icon} alt="{author.displayName}'s icon" class="size-16 rounded-full" />
    <div>
      <p class="font-semibold">{author.displayName}</p>
      <p class="text-muted text-sm">
        <LangText
          texts={{
            ja: "趣味で開発している初学者です",
            en: "A hobbyist developer still learning the ropes",
          }}
        />
      </p>
    </div>
  </section>

  <section class="flex flex-col gap-3">
    <h2 class="text-lg font-semibold"><LangText texts={{ ja: "コンタクト", en: "Contact" }} /></h2>
    <p class="text-muted text-sm">
      <LangText texts={{ ja: "連絡はXが一番早いです", en: "X is the fastest way to reach me" }} />
    </p>
    <ul class="flex flex-col gap-2">
      {#each socialLinks as link (link.name)}
        <li>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer me"
            class="text-muted hover:text-foreground flex w-fit items-center gap-2 text-sm transition-colors"
          >
            <SocialIcon icon={link.icon} class="size-4" />
            {link.name}
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <section class="flex flex-col gap-3">
    <h2 class="text-lg font-semibold"><LangText texts={{ ja: "使ってるもの", en: "Gear" }} /></h2>
    {#each gear as section (section.texts.en)}
      <div class="flex flex-col gap-1">
        <h3 class="text-muted text-xs font-semibold tracking-wide uppercase">
          <LangText texts={section.texts} />
        </h3>
        <ul class="list-inside list-disc text-sm">
          {#each section.items as item (item)}
            <li>{item}</li>
          {/each}
        </ul>
      </div>
    {/each}
  </section>
</section>
