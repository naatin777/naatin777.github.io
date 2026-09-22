<script lang="ts">
  import { browser } from "$app/environment";
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { defaultLang, langNames, langs, type Lang } from "$lib/config/i18n";
  import { onMount } from "svelte";

  let lang = $state<Lang>(
    browser ? (langs.find((l) => l === document.documentElement.lang) ?? defaultLang) : defaultLang,
  );

  function setLang(next: Lang): void {
    lang = next;
    document.documentElement.lang = next;
    localStorage.setItem("lang", next);
    const url = new URL(window.location.href);
    if (next === defaultLang) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", next);
    }
    replaceState(url, page.state);
  }

  // SSR assumes the default lang; hide until hydration applies the
  // real preference so the wrong option never appears selected.
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });
</script>

<div
  role="group"
  aria-label="言語 / Language"
  class="flex items-center gap-0.5 text-xs transition-opacity {hydrated ? 'opacity-100' : 'opacity-0'}"
>
  {#each langs as option (option)}
    <button
      type="button"
      onclick={() => setLang(option)}
      aria-pressed={lang === option}
      class="aria-pressed:text-foreground text-muted hover:text-foreground rounded-md px-1 whitespace-nowrap transition-colors aria-pressed:font-semibold"
    >
      {langNames[option]}
    </button>
  {/each}
</div>
