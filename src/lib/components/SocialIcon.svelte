<script lang="ts">
  import type { SimpleIcon } from "simple-icons";

  interface Props {
    icon: SimpleIcon;
    class?: string;
  }

  let { icon, class: className = "size-6" }: Props = $props();
</script>

<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class={className}>
  <path d={icon.path} />
</svg>
