import { onMount } from "svelte";

// SSR renders controls with default-state values (lang=ja, theme=light),
// which paints wrong for users with other preferences before hydration.
// Gate visibility on this so only the real preference is ever shown.
export function hydrated() {
  let value = $state(false);
  onMount(() => {
    value = true;
  });
  return {
    get value() {
      return value;
    },
  };
}
