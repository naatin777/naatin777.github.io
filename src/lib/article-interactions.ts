import { selectionGroupKeydown } from "#lib/selection-group.js";

function activateMermaidTab(tab: HTMLButtonElement): void {
  const block = tab.closest(".mermaid-block");
  if (!block) return;
  block.querySelectorAll<HTMLButtonElement>(".mermaid-tab").forEach((button) => {
    const active = button === tab;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  block.querySelectorAll<HTMLElement>(".mermaid-pane").forEach((pane) => {
    pane.hidden = pane.dataset.pane !== tab.dataset.tab;
  });
}

function toggleCodeWrap(button: HTMLButtonElement): void {
  const wrapped = button.closest(".code-block")?.classList.toggle("wrap") ?? false;
  button.setAttribute("aria-pressed", String(wrapped));
}

async function copyCode(button: HTMLButtonElement): Promise<void> {
  const block = button.closest(".code-block, .mermaid-block");
  // SVG labels can contain <code>, so Mermaid must copy its source pane.
  const code = block?.classList.contains("mermaid-block")
    ? block.querySelector('[data-pane="source"] code')?.textContent
    : block?.querySelector("code")?.textContent;
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code.trimEnd());
    button.classList.add("copied");
    button.setAttribute("aria-label", "コピーしました");
    setTimeout(() => {
      button.classList.remove("copied");
      button.setAttribute("aria-label", "コードをコピー");
    }, 1500);
  } catch {
    // Clipboard access can be unavailable; keep the article usable.
  }
}

// Markdown injects these buttons as HTML; delegation keeps their behavior
// independent of how many blocks a post renders.
export async function handleArticleClick(event: MouseEvent): Promise<void> {
  if (!(event.target instanceof Element)) return;
  const target = event.target;
  const unfocus = target.closest<HTMLButtonElement>(".code-unfocus");
  if (unfocus) {
    // :target is reevaluated on real fragment navigation, not on shallow
    // goto writes.
    const id = unfocus.closest(".code-block")?.id;
    if (id) location.hash = id;
    return;
  }
  const tab = target.closest<HTMLButtonElement>(".mermaid-tab");
  if (tab) {
    activateMermaidTab(tab);
    return;
  }
  const wrapButton = target.closest<HTMLButtonElement>(".code-wrap");
  if (wrapButton) {
    toggleCodeWrap(wrapButton);
    return;
  }
  const copyButton = target.closest<HTMLButtonElement>(".code-copy");
  if (copyButton) await copyCode(copyButton);
}

export function handleArticleKeydown(event: KeyboardEvent): void {
  selectionGroupKeydown(event);
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("table-wrap")) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  // WebKit doesn't scroll a focusable div with arrow keys by default.
  // Prevent the native action so other browsers don't scroll twice.
  event.preventDefault();
  target.scrollBy({ left: event.key === "ArrowRight" ? 40 : -40 });
}
