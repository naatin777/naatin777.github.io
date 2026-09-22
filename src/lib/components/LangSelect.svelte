<script lang="ts">
  import { browser } from "$app/environment";
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { defaultLang, langNames, langs, type Lang } from "$lib/config/i18n";
  import { onMount } from "svelte";

  let lang = $state<Lang>(
    browser ? (langs.find((l) => l === document.documentElement.lang) ?? defaultLang) : defaultLang,
  );

  // SSR renders the select with the default lang; hide it until
  // hydration applies the real preference to avoid a flash of 日本語.
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });

  function onChange(event: Event & { currentTarget: HTMLSelectElement }): void {
    const next = langs.find((l) => l === event.currentTarget.value) ?? defaultLang;
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
</script>

<select
  aria-label="言語 / Language"
  bind:value={lang}
  onchange={onChange}
  class="border-border bg-surface text-muted hover:text-foreground cursor-pointer rounded-md border px-1.5 py-1 text-xs transition-all {hydrated
    ? 'opacity-100'
    : 'opacity-0'}"
>
  {#each langs as option (option)}
    <option value={option}>{langNames[option]}</option>
  {/each}
</select>
