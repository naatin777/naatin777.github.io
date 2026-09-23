// Generates per-post OG images by screenshotting the prerendered /og/<slug>/ templates.
// Runs after `vite build` — see the "build" script in package.json.
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { chromium } from "playwright";
import { preview } from "vite";

const POSTS_DIR = "build/posts";
const OUT_DIR = "build/og";
const PORT = 4199;

if (!existsSync(POSTS_DIR)) {
  console.log("[og] no posts — skipping");
  process.exit(0);
}

const slugs = readdirSync(POSTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`${POSTS_DIR}/${d.name}/index.html`))
  .map((d) => d.name);

const server = await preview({ preview: { port: PORT, strictPort: true } });
let browser;
let failures = 0;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    // 2400x1260 output — OG cards stay readable when scaled down
    deviceScaleFactor: 2,
  });
  const card = page.locator(".og-card");

  mkdirSync(OUT_DIR, { recursive: true });
  /* oxlint-disable no-await-in-loop -- one page reused; parallel tabs unnecessary at this scale */
  for (const slug of slugs) {
    try {
      await page.goto(`http://localhost:${PORT}/og/${slug}/`, { waitUntil: "networkidle", timeout: 30_000 });
      // networkidle doesn't guarantee webfonts — a screenshot taken before
      // fonts swap in renders fallback text permanently.
      await page.evaluate(() => document.fonts.ready);
      // element screenshot clips out the site header/footer around the OG card
      await card.screenshot({ path: `${OUT_DIR}/${slug}.png`, timeout: 15_000 });
      console.log(`[og] ${slug}.png`);
    } catch (error) {
      failures++;
      console.error(`[og] failed ${slug}:`, error);
    }
  }
  /* oxlint-enable no-await-in-loop */
} finally {
  await browser?.close();
  server.httpServer.close();
}

if (failures > 0) {
  console.error(`[og] ${failures}/${slugs.length} image(s) failed`);
  process.exitCode = 1;
}
