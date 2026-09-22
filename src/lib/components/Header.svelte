<script lang="ts">
  import { page } from "$app/state";
  import LangSelect from "./LangSelect.svelte";
  import LangText from "./LangText.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  const navItems = [
    { href: "/changelog/", texts: { ja: "更新履歴", en: "Changelog" } },
    { href: "/articles/", texts: { ja: "記事", en: "Articles" } },
  ] as const;

  const isActive = (href: string): boolean => {
    if (href === "/articles/") {
      return page.url.pathname.startsWith("/articles/") || page.url.pathname.startsWith("/posts/");
    }
    return page.url.pathname.startsWith(href);
  };
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
              aria-current={isActive(item.href) ? "page" : undefined}
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
