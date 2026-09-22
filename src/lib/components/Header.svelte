<script lang="ts">
  import { page } from "$app/state";
  import LangToggle from "./LangToggle.svelte";
  import LangText from "./LangText.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  const navItems = [
    { href: "/articles/", match: ["/articles/", "/posts/"], texts: { ja: "記事", en: "Articles" } },
    { href: "/projects/", match: ["/projects/"], texts: { ja: "プロジェクト", en: "Projects" } },
    { href: "/changelog/", match: ["/changelog/"], texts: { ja: "更新履歴", en: "Changelog" } },
    { href: "/about/", match: ["/about/"], texts: { ja: "自己紹介", en: "About" } },
  ] as const;

  const isActive = (item: (typeof navItems)[number]): boolean =>
    item.match.some((prefix) => page.url.pathname.startsWith(prefix));
</script>

<header class="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
  <div class="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
    <div class="flex-1">
      <a href="/" class="font-bold tracking-tight">naatin777.dev</a>
    </div>

    <nav aria-label="Primary" class="order-last w-full sm:order-none sm:w-auto">
      <ul class="flex justify-center gap-4">
        {#each navItems as item (item.href)}
          <li>
            <a
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              class="text-muted hover:text-foreground aria-[current=page]:text-foreground text-sm whitespace-nowrap transition-colors aria-[current=page]:font-semibold"
            >
              <LangText texts={item.texts} />
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="flex flex-1 items-center justify-end gap-2">
      <LangToggle />
      <ThemeToggle />
    </div>
  </div>
</header>
