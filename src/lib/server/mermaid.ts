import { createMermaidRenderer } from "mermaid-isomorphic";

const renderer = createMermaidRenderer();

// Concurrent renderer() calls fail under vite prerender — serialize all renders.
let queue: Promise<unknown> = Promise.resolve();

export interface MermaidDiagrams {
  light: string;
  dark: string;
}

export function renderMermaid(source: string): Promise<MermaidDiagrams | null> {
  const task = queue.then(() => renderBothThemes(source));
  queue = task.catch(() => {});
  return task;
}

async function renderBothThemes(source: string): Promise<MermaidDiagrams | null> {
  const [light] = await renderer([source], { mermaidConfig: { theme: "default" } });
  const [dark] = await renderer([source], { mermaidConfig: { theme: "dark" } });
  if (light.status !== "fulfilled" || dark.status !== "fulfilled") {
    const failure = light.status === "rejected" ? light : dark;
    console.warn("[posts] mermaid render failed:", (failure as PromiseRejectedResult).reason);
    return null;
  }
  return { light: light.value.svg, dark: dark.value.svg };
}
