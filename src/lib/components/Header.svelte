<script lang="ts">
  import { page } from "$app/state";
  import LangSelect from "./LangSelect.svelte";
  import LangText from "./LangText.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  const navItems = [
    { href: "/changelog/", match: ["/changelog/"], texts: { ja: "更新履歴", en: "Changelog" } },
    { href: "/articles/", match: ["/articles/", "/posts/"], texts: { ja: "記事", en: "Articles" } },
  ] as const;

  const isActive = (item: (typeof navItems)[number]): boolean =>
    item.match.some((prefix) => page.url.pathname.startsWith(prefix));
</script>

<header class="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
  <div class="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
    <a href="/" class="font-bold tracking-tight">naatin777.dev</a>

    <div class="ml-auto flex items-center gap-2">
      <LangSelect />
      <ThemeToggle />
    </div>

    <nav aria-label="Primary" class="w-full sm:w-auto">
      <ul class="flex gap-4">
        {#each navItems as item (item.href)}
          <li>
            <a
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              class="text-muted hover:text-foreground aria-[current=page]:text-foreground text-sm transition-colors aria-[current=page]:font-semibold"
            >
              <LangText texts={item.texts} />
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</header>
