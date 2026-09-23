<script lang="ts">
  import { Moon, Sun } from "@lucide/svelte";
  import { hydrated } from "$lib/hydrated.svelte";
  import { themeState } from "$lib/theme.svelte";
  import LangText from "./LangText.svelte";

  const theme = themeState();
  const isHydrated = hydrated();
  const labelId = $props.id();

  // Two-state flip: the button toggles light ↔ dark. "System" remains
  // the implicit default until the user picks a side explicitly.
  function toggle(): void {
    theme.set(theme.resolved === "dark" ? "light" : "dark");
  }

  const Icon = $derived(theme.resolved === "dark" ? Sun : Moon);
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
  <span id={labelId} class="sr-only"><LangText texts={{ ja: "テーマ切替", en: "Toggle theme" }} /></span>
  <Icon class="size-5" aria-hidden="true" />
</button>
