// Shared gate for the View Transitions API: available only where the
// browser supports it and the user hasn't asked for reduced motion.
// Navigations (+layout.svelte) check this directly; in-place DOM updates
// (theme/language toggles) go through withViewTransition instead.
export function viewTransitionAllowed(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Run a DOM mutation inside a same-document view transition (the same
// crossfade used for navigations). The callback's promise delays the
// "new" snapshot, so awaiting tick() inside it flushes Svelte's DOM
// updates into the transition. Without support or under reduced motion
// the update just applies instantly.
export function withViewTransition(update: () => void | Promise<unknown>): void {
  if (!viewTransitionAllowed()) {
    void update();
    return;
  }
  document.startViewTransition(update);
}
