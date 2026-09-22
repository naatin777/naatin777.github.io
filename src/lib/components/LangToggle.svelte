<script lang="ts">
  import { browser } from "$app/environment";
  import { defaultLang, langNames, langs, type Lang } from "$lib/config/i18n";
  import { hydrated } from "$lib/hydrated.svelte";

  const ready = hydrated();

  let lang = $state<Lang>(
    browser ? (langs.find((l) => l === document.documentElement.lang) ?? defaultLang) : defaultLang,
  );

  // ?lang= stays honored for incoming shared links (read in app.html),
  // but toggling only persists to localStorage — URLs stay clean.
  function setLang(next: Lang): void {
    lang = next;
    document.documentElement.lang = next;
    localStorage.setItem("lang", next);
  }
</script>

<div
  role="group"
  aria-label="言語 / Language"
  class="flex items-center gap-0.5 text-xs transition-opacity {ready.value ? 'opacity-100' : 'opacity-0'}"
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
