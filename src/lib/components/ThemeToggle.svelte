<script lang="ts">
  import { Moon, Sun, SunMoon } from "@lucide/svelte";
  import { tick } from "svelte";
  import { hydrated } from "$lib/hydrated.svelte";
  import { themeState } from "$lib/theme.svelte";
  import { withViewTransition } from "$lib/view-transition";
  import LangText from "./LangText.svelte";

  const theme = themeState();
  const isHydrated = hydrated();
  const labelId = $props.id();

  // Three-state cycle: light → dark → system. The icon shows the current
  // preference rather than the resolved theme, so "system" is visible.
  const order = { light: "dark", dark: "system", system: "light" } as const;
  function toggle(): void {
    // Crossfade the whole page into the new theme; tick() lets the
    // $effect that writes data-theme land inside the "new" snapshot.
    withViewTransition(async () => {
      theme.set(order[theme.preference]);
      await tick();
    });
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
  class="text-muted hover:bg-surface hover:text-foreground flex size-8 items-center justify-center rounded-md transition-[color,background-color,opacity] {isHydrated.value
    ? 'opacity-100'
    : 'invisible opacity-0'}"
>
  <span id={labelId} class="sr-only"><LangText texts={labels[theme.preference]} /></span>
  <Icon class="size-5" aria-hidden="true" />
</button>
