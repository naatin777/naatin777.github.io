<script lang="ts">
  import { langs, type Lang } from "$lib/i18n";

  interface Props {
    texts: Record<Lang, string>;
  }

  let { texts }: Props = $props();
</script>

{#each langs as lang (lang)}
  <span class="lang-text lang-{lang}" {lang}>{texts[lang]}</span>
{/each}
