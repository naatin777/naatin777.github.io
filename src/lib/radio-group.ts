// ARIA radio pattern for single-select groups: one tab stop for the group,
// arrow keys move focus and select. Attach on the radiogroup container;
// the roving tabindex itself lives in each component's markup.
export function radioGroupKeydown(event: KeyboardEvent): void {
  const dir =
    event.key === "ArrowRight" || event.key === "ArrowDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;
  if (dir === 0) return;
  const radios = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="radio"]'));
  const index = radios.indexOf(event.target as HTMLElement);
  if (index === -1) return;
  event.preventDefault();
  const next = radios[(index + dir + radios.length) % radios.length];
  next?.focus();
  next?.click();
}
