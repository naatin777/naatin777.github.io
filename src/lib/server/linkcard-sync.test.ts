import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { cardSchema, type Linkcard } from "./markdown/linkcards";

const scriptUrl = new URL("../../../scripts/sync-linkcards.ts", import.meta.url).href;

// Exercise the real CLI in an isolated content directory, without network
// access or changes to the repository's generated metadata.
function syncFixture(
  urls: string[],
  existing: Record<string, Linkcard>,
  pages: Record<string, string>,
): Record<string, Linkcard> {
  const directory = mkdtempSync(join(tmpdir(), "linkcard-sync-test-"));
  try {
    mkdirSync(join(directory, "content/posts/2026/test"), { recursive: true });
    mkdirSync(join(directory, "content/generated"), { recursive: true });
    writeFileSync(join(directory, "content/posts/2026/test/index.md"), urls.join("\n\n"));
    const output = join(directory, "content/generated/linkcards.json");
    writeFileSync(output, JSON.stringify(existing));
    execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `const pages = ${JSON.stringify(pages)};
        globalThis.fetch = async (url) => {
          if (!(url in pages)) throw new Error('Simulated timeout');
          const response = new Response(pages[url]);
          Object.defineProperty(response, 'url', { value: 'https://redirect.test/final/page' });
          return response;
        };
        await import(${JSON.stringify(scriptUrl)});`,
      ],
      { cwd: directory, stdio: "pipe", timeout: 15000 },
    );
    return z.record(z.string(), cardSchema).parse(JSON.parse(readFileSync(output, "utf8")));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe("linkcard sync", () => {
  it("preserves failed URLs, refreshes successful ones, and prunes removed URLs", () => {
    const failed = "https://example.test/failed";
    const success = "https://example.test/success";
    const old = { title: "Cached", description: "Keep me" };
    expect(
      syncFixture(
        [failed, success],
        { [failed]: old, [success]: old, "https://removed.test/": old },
        {
          [success]: "<title>Updated</title>",
        },
      ),
    ).toEqual({
      [failed]: old,
      [success]: { title: "Updated", description: "" },
    });
  });

  it("keeps all cached cards when every fetch fails", () => {
    const url = "https://example.test/failed";
    const existing = { [url]: { title: "Cached", description: "Still available" } };
    expect(syncFixture([url], existing, {})).toEqual(existing);
    expect(syncFixture([], existing, {})).toEqual({});
  });

  it("parses quoted attributes and entities, and resolves images after redirects", () => {
    const url = "https://example.test/page";
    const pages = {
      [url]: `<meta content="Developer's &quot;guide&quot; &amp;lt;" property="og:title">
        <meta name='description' content='A "quoted" description &amp; more'>
        <meta property="og:image" content="./card.png">`,
    };
    expect(syncFixture([url], {}, pages)[url]).toEqual({
      title: 'Developer\'s "guide" &lt;',
      description: 'A "quoted" description & more',
      image: "https://redirect.test/final/card.png",
    });
  });
});
