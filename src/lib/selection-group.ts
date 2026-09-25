// Shared arrow-key navigation for single-selection groups — ARIA radios
// (radiogroup/radio) and tabs (tablist/tab) behave identically: one tab
// stop for the group, arrow keys move focus and select, Home/End jump to
// the first/last option. Components attach this on the group container;
// the post page delegates it at the article level for generated markup,
// so the group is found via closest() rather than currentTarget. The
// roving tabindex itself lives in each component's markup.
export function selectionGroupKeydown(event: KeyboardEvent): void {
  const { target } = event;
  if (!(target instanceof HTMLElement)) return;
  const group = target.closest<HTMLElement>('[role="radiogroup"], [role="tablist"]');
  if (!group) return;
  const items = Array.from(group.querySelectorAll<HTMLElement>('[role="radio"], [role="tab"]'));
  const index = items.indexOf(target);
  if (index === -1) return;
  let next: HTMLElement | undefined;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = items[(index + 1) % items.length];
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
    next = items[(index - 1 + items.length) % items.length];
  else if (event.key === "Home") next = items[0];
  else if (event.key === "End") next = items.at(-1);
  if (!next) return;
  event.preventDefault();
  next.focus();
  next.click();
}
