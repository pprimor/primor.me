import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/images");
const WIDTH = 880;
const HEIGHT = 660;

async function capturePrimor(page, mode, filename) {
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  await page.goto("https://primor.me/", { waitUntil: "networkidle" });
  await page.evaluate((m) => {
    localStorage.setItem("theme", m);
    if (m === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, mode);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, filename) });
}

async function captureIgcp(page, mode, filename) {
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  await page.goto("https://igcp-aforro.primor.me/", { waitUntil: "networkidle" });
  await page.evaluate((m) => localStorage.setItem("starlight-theme", m), mode);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("h1");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, filename) });
}

const browser = await chromium.launch();
const lightPage = await browser.newPage({ colorScheme: "light" });
const darkPage = await browser.newPage({ colorScheme: "dark" });

await capturePrimor(lightPage, "light", "website-light.png");
await capturePrimor(darkPage, "dark", "website-dark.png");
await captureIgcp(lightPage, "light", "igcp-aforro-light.png");
await captureIgcp(darkPage, "dark", "igcp-aforro-dark.png");

await browser.close();
console.log(`Captured 4 screenshots at ${WIDTH}x${HEIGHT}`);

const { optimizeImages } = await import("./optimize-images.mjs");
await optimizeImages();
