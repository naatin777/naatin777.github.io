import { createMermaidRenderer } from "mermaid-isomorphic";

const renderer = createMermaidRenderer();

// Concurrent renderer() calls fail under vite prerender — serialize all renders.
let queue: Promise<unknown> = Promise.resolve();
let seq = 0;

export interface MermaidDiagrams {
  light: string;
  dark: string;
}

export function renderMermaid(source: string): Promise<MermaidDiagrams> {
  const task = queue.then(() => renderBothThemes(source));
  queue = task.catch(() => {});
  return task;
}

async function renderBothThemes(source: string): Promise<MermaidDiagrams> {
  // Both variants land in one document: give each render a unique id prefix or
  // the <style> blocks (scoped by #mermaid-0) collide across diagrams and the
  // dark theme leaks into the light one.
  const id = seq++;
  // antiscript keeps HTML labels (e.g. <img> nodes) but strips scripts —
  // the rendered SVG is post-sanitize generated markup anyway.
  const [light] = await renderer([source], {
    mermaidConfig: { theme: "default", securityLevel: "antiscript" },
    prefix: `light-${id}`,
  });
  const [dark] = await renderer([source], {
    mermaidConfig: {
      theme: "dark",
      securityLevel: "antiscript",
      // Mermaid's default #585858 makes #ccc edge labels miss 4.5:1.
      themeVariables: { edgeLabelBackground: "#333333" },
    },
    prefix: `dark-${id}`,
  });
  if (light?.status !== "fulfilled" || dark?.status !== "fulfilled") {
    throw new Error("mermaid render failed");
  }
  return { light: light.value.svg, dark: dark.value.svg };
}
