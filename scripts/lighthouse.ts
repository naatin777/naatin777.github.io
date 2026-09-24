// Runs Lighthouse against the built site and enforces category score
// thresholds — the replacement for `lhci autorun` (dropped because its
// dependency chain pinned a vulnerable extract-zip).
//
// Requires `pnpm build` first and a local Chrome install (present on
// GitHub-hosted runners). Reports land in output/lighthouse/.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

const PORT = 4199;
// Audit one real post page (richest markup: prose, code, images) without
// hardcoding a slug that rots when the post is renamed or deleted.
const firstPost = existsSync("build/posts")
  ? readdirSync("build/posts", { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(`build/posts/${d.name}/index.html`))
      .map((d) => `/posts/${d.name}/`)
      .toSorted()[0]
  : undefined;
const PATHS = ["/", "/articles/", "/about/", ...(firstPost ? [firstPost] : [])];
// [level, minScore] — "warn" reports without failing, "error" fails the run
const THRESHOLDS: Record<string, readonly ["warn" | "error", number]> = {
  performance: ["warn", 0.9],
  accessibility: ["error", 0.95],
  "best-practices": ["warn", 0.9],
  seo: ["error", 0.95],
};

const server = spawn(process.execPath, ["scripts/serve-build.ts"], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: "ignore",
});

try {
  const deadline = Date.now() + 10_000;
  /* oxlint-disable no-await-in-loop -- readiness poll is sequential by nature */
  for (;;) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) throw new Error("preview server did not start");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  /* oxlint-enable no-await-in-loop */

  const reportDir = "output/lighthouse";
  mkdirSync(reportDir, { recursive: true });
  let failures = 0;

  for (const path of PATHS) {
    const url = `http://localhost:${PORT}${path}`;
    const name = path === "/" ? "index" : path.replaceAll("/", "_").replace(/^_|_$/g, "");
    const reportPath = `${reportDir}/${name}.json`;
    try {
      execFileSync(
        "pnpm",
        [
          "exec",
          "lighthouse",
          url,
          "--output=json",
          `--output-path=${reportPath}`,
          "--quiet",
          '--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"',
        ],
        { stdio: ["ignore", "ignore", "inherit"], timeout: 180_000 },
      );
    } catch (error) {
      failures++;
      console.error(`[lighthouse] ${path}: run failed`, error instanceof Error ? error.message : error);
      continue;
    }

    const { categories } = JSON.parse(readFileSync(reportPath, "utf8")) as {
      categories: Record<string, { score: number | null } | undefined>;
    };
    const scores = Object.entries(THRESHOLDS).map(([category, [level, min]]) => {
      const score = categories[category]?.score ?? 0;
      const ok = score >= min;
      if (!ok && level === "error") failures++;
      const mark = ok ? "ok" : level === "error" ? "FAIL" : "warn";
      return `${category} ${(score * 100).toFixed(0)} (${mark}, min ${min * 100})`;
    });
    console.log(`[lighthouse] ${path}: ${scores.join(", ")}`);
  }

  if (failures > 0) {
    console.error(`[lighthouse] ${failures} error-level failure(s)`);
    process.exitCode = 1;
  }
} finally {
  server.kill();
}
