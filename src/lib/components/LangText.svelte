<script lang="ts">
  import { defaultLang, langs, type LocalizedText } from "$lib/config/i18n";

  interface Props {
    texts: LocalizedText;
  }

  let { texts }: Props = $props();
</script>

<!-- Both languages sit in the DOM; CSS shows only the active one. Pagefind
     indexes raw DOM text regardless of display, so exclude the non-default
     span or search results show both languages concatenated. -->
{#each langs as lang (lang)}
  <span class="lang-text lang-{lang}" {lang} data-pagefind-ignore={lang === defaultLang ? undefined : ""}
    >{texts[lang]}</span
  >
{/each}
