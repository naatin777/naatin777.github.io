<script lang="ts">
  import { browser } from "$app/environment";
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { defaultLang, langNames, langs, type Lang } from "$lib/config/i18n";

  let lang = $state<Lang>(
    browser ? (langs.find((l) => l === document.documentElement.lang) ?? defaultLang) : defaultLang,
  );

  function onChange(event: Event & { currentTarget: HTMLSelectElement }): void {
    const next = event.currentTarget.value as Lang;
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
  aria-label="Language"
  bind:value={lang}
  onchange={onChange}
  class="border-border bg-surface text-muted hover:text-foreground cursor-pointer rounded-md border px-1.5 py-1 text-xs transition-colors"
>
  {#each langs as option (option)}
    <option value={option}>{langNames[option]}</option>
  {/each}
</select>
