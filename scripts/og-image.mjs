// Renders public/images/og.png from the running site.
// Usage: npm run dev, then `node scripts/og-image.mjs [url]` (needs playwright and Google Chrome).
import { chromium } from "playwright";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public/images/og.png");
const url = process.argv[2] ?? "http://localhost:5173/";

// Render a small desktop at high density so the text survives being shown as a thumbnail.
const OG = { width: 1200, height: 630 };
const VIEWPORT = { width: 680, height: 357 };

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: VIEWPORT,
  deviceScaleFactor: OG.width / VIEWPORT.width,
  colorScheme: "dark",
});
await page.goto(url, { waitUntil: "networkidle" });
// A fixed clock, so re-running the script only changes the image when the site does.
await page.locator("nav[aria-label=Panel] time").evaluate((el) => (el.textContent = "09:00"));
await page.locator("#terminal-input").evaluate((el) => el.blur());
const png = await page.screenshot({ clip: { x: 0, y: 0, ...VIEWPORT } });
await browser.close();

await sharp(png).resize(OG.width, OG.height).png({ compressionLevel: 9, palette: true }).toFile(out);
console.log(`Wrote ${path.relative(root, out)} (${OG.width}x${OG.height}) from ${url}`);
