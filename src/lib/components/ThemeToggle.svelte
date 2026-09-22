<script lang="ts">
  import { onMount } from "svelte";
  import { themeState, type ThemePreference } from "$lib/theme.svelte";

  const theme = themeState();

  const order: ThemePreference[] = ["system", "light", "dark"];
  const labels: Record<ThemePreference, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
  };

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
</script>

<button
  type="button"
  onclick={cycleTheme}
  aria-label={`Theme: ${labels[theme.preference]}`}
  title={`Theme: ${labels[theme.preference]}`}
  class="text-muted hover:bg-surface hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors"
>
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-5">
    {#if theme.preference === "light"}
      <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2V4 M12 20V22 M4 12H2 M22 12H20" />
        <path d="M12 2V4 M12 20V22 M4 12H2 M22 12H20" transform="rotate(45 12 12)" />
      </g>
    {:else if theme.preference === "dark"}
      <path
        d="M21 12.79 A9 9 0 1 1 11.21 3 A5 5 0 0 0 21 12.79 Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    {:else}
      <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </g>
    {/if}
  </svg>
</button>
