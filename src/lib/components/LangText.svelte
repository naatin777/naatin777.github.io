<script lang="ts">
  import { langs, type LocalizedText } from "$lib/config/i18n";

  interface Props {
    texts: LocalizedText;
  }

  let { texts }: Props = $props();
</script>

{#each langs as lang (lang)}
  <span class="lang-text lang-{lang}" {lang}>{texts[lang]}</span>
{/each}
