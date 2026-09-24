<script lang="ts">
  import { Moon, Sun, SunMoon } from "@lucide/svelte";
  import { hydrated } from "$lib/hydrated.svelte";
  import { themeState } from "$lib/theme.svelte";
  import LangText from "./LangText.svelte";

  const theme = themeState();
  const isHydrated = hydrated();
  const labelId = $props.id();

  // Three-state cycle: light → dark → system. The icon shows the current
  // preference rather than the resolved theme, so "system" is visible.
  const order = { light: "dark", dark: "system", system: "light" } as const;
  function toggle(): void {
    theme.set(order[theme.preference]);
  }

  const icons = { light: Sun, dark: Moon, system: SunMoon } as const;
  const Icon = $derived(icons[theme.preference]);

  const labels = {
    light: { ja: "テーマ: ライト", en: "Theme: light" },
    dark: { ja: "テーマ: ダーク", en: "Theme: dark" },
    system: { ja: "テーマ: システム", en: "Theme: system" },
  } as const;
</script>

<button
  type="button"
  onclick={toggle}
  aria-labelledby={labelId}
  title="テーマ切替 / Toggle theme"
  class="text-muted hover:bg-surface hover:text-foreground flex size-8 items-center justify-center rounded-md transition-[color,background-color,opacity] {isHydrated.value
    ? 'opacity-100'
    : 'invisible opacity-0'}"
>
  <span id={labelId} class="sr-only"><LangText texts={labels[theme.preference]} /></span>
  <Icon class="size-5" aria-hidden="true" />
</button>
