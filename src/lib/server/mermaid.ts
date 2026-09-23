import { createMermaidRenderer } from "mermaid-isomorphic";

const renderer = createMermaidRenderer();

// Concurrent renderer() calls fail under vite prerender — serialize all renders.
let queue: Promise<unknown> = Promise.resolve();
let seq = 0;

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
  // Both variants land in one document: give each render a unique id prefix or
  // the <style> blocks (scoped by #mermaid-0) collide across diagrams and the
  // dark theme leaks into the light one.
  const id = seq++;
  const [light] = await renderer([source], { mermaidConfig: { theme: "default" }, prefix: `light-${id}` });
  const [dark] = await renderer([source], { mermaidConfig: { theme: "dark" }, prefix: `dark-${id}` });
  if (light?.status !== "fulfilled" || dark?.status !== "fulfilled") {
    const failure = light?.status === "rejected" ? light : dark?.status === "rejected" ? dark : undefined;
    console.warn("[posts] mermaid render failed:", failure?.reason ?? "no result returned");
    return null;
  }
  return { light: light.value.svg, dark: dark.value.svg };
}
