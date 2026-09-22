<script lang="ts">
  import { Moon, Sun } from "lucide-svelte";
  import { onMount } from "svelte";
  import { hydrated } from "$lib/hydrated.svelte";
  import { themeState } from "$lib/theme.svelte";

  const theme = themeState();
  const ready = hydrated();

  // Two-state flip: the button toggles light ↔ dark. "System" remains
  // the implicit default until the user picks a side explicitly.
  function toggle(): void {
    theme.set(theme.resolved === "dark" ? "light" : "dark");
  }

  onMount(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => theme.reapply();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  });

  const Icon = $derived(theme.resolved === "dark" ? Sun : Moon);
</script>

<button
  type="button"
  onclick={toggle}
  aria-label="テーマ切替 / Toggle theme"
  title="テーマ切替 / Toggle theme"
  class="text-muted hover:bg-surface hover:text-foreground flex size-8 items-center justify-center rounded-md transition-all {ready.value
    ? 'opacity-100'
    : 'opacity-0'}"
>
  <Icon class="size-5" aria-hidden="true" />
</button>
