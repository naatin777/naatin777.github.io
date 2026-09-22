<script lang="ts">
  import { Monitor, Moon, Sun } from "lucide-svelte";
  import { onMount } from "svelte";
  import { themeState, type ThemePreference } from "$lib/theme.svelte";

  const theme = themeState();

  const order: ThemePreference[] = ["system", "light", "dark"];
  const labels: Record<ThemePreference, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
  };
  const icons = { light: Sun, dark: Moon, system: Monitor };

  function cycleTheme(): void {
    const next = order[(order.indexOf(theme.preference) + 1) % order.length];
    theme.set(next);
  }

  onMount(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => theme.reapply();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  });

  const Icon = $derived(icons[theme.preference]);
</script>

<button
  type="button"
  onclick={cycleTheme}
  aria-label={`Theme: ${labels[theme.preference]}`}
  title={`Theme: ${labels[theme.preference]}`}
  class="text-muted hover:bg-surface hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors"
>
  <Icon class="size-5" aria-hidden="true" />
</button>
