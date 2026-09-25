// ARIA radio pattern for single-select groups: one tab stop for the group,
// arrow keys move focus and select, Home/End jump to the first/last option.
// Attach on the radiogroup container; the roving tabindex itself lives in
// each component's markup.
export function radioGroupKeydown(event: KeyboardEvent): void {
  const { currentTarget, target } = event;
  if (!(currentTarget instanceof HTMLElement) || !(target instanceof HTMLElement)) return;
  const radios = Array.from(currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const index = radios.indexOf(target);
  if (index === -1) return;
  let next: HTMLElement | undefined;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = radios[(index + 1) % radios.length];
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
    next = radios[(index - 1 + radios.length) % radios.length];
  else if (event.key === "Home") next = radios[0];
  else if (event.key === "End") next = radios.at(-1);
  if (!next) return;
  event.preventDefault();
  next.focus();
  next.click();
}
