<script lang="ts">
  import { browser } from "$app/environment";
  import { defaultLang, langNames, langs, type Lang } from "$lib/config/i18n";
  import { hydrated } from "$lib/hydrated.svelte";
  import { radioGroupKeydown } from "$lib/radio-group";
  import LangText from "./LangText.svelte";

  const isHydrated = hydrated();
  const groupLabelId = $props.id();

  let lang = $state<Lang>(
    browser ? (langs.find((l) => l === document.documentElement.lang) ?? defaultLang) : defaultLang,
  );

  // ?lang= stays honored for incoming shared links (read in app.html),
  // but toggling only persists to localStorage — URLs stay clean.
  function setLang(next: Lang): void {
    lang = next;
    document.documentElement.lang = next;
    try {
      localStorage.setItem("lang", next);
    } catch {
      // storage disabled — preference still applies for this session
    }
  }
</script>

<div
  role="radiogroup"
  aria-labelledby={groupLabelId}
  tabindex="-1"
  onkeydown={radioGroupKeydown}
  class="flex items-center gap-0.5 text-xs transition-opacity {isHydrated.value
    ? 'opacity-100'
    : 'invisible opacity-0'}"
>
  <span id={groupLabelId} class="sr-only"><LangText texts={{ ja: "言語", en: "Language" }} /></span>
  {#each langs as option (option)}
    <button
      type="button"
      role="radio"
      tabindex={lang === option ? 0 : -1}
      onclick={() => setLang(option)}
      aria-checked={lang === option}
      class="aria-checked:text-foreground text-muted hover:text-foreground rounded-md px-1 whitespace-nowrap transition-colors aria-checked:font-semibold"
    >
      {langNames[option]}
    </button>
  {/each}
</div>
