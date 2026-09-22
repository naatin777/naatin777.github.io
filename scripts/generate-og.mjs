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
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const card = page.locator(".og-card");

mkdirSync(OUT_DIR, { recursive: true });
for (const slug of slugs) {
  await page.goto(`http://localhost:${PORT}/og/${slug}/`, { waitUntil: "networkidle" });
  // element screenshot clips out the site header/footer around the OG card
  await card.screenshot({ path: `${OUT_DIR}/${slug}.png` });
  console.log(`[og] ${slug}.png`);
}

await browser.close();
server.httpServer.close();
