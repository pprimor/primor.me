import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const IMAGE_NAMES = [
  "website-light",
  "website-dark",
  "igcp-aforro-light",
  "igcp-aforro-dark",
  "me",
  "final-cut-pro-preview",
  "canva-preview",
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/images");

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export async function optimizeImages() {
  let processed = 0;

  for (const name of IMAGE_NAMES) {
    const pngPath = path.join(outDir, `${name}.png`);
    if (!fs.existsSync(pngPath)) {
      console.warn(`Skipping ${name}: ${pngPath} not found`);
      continue;
    }

    const pngSize = fs.statSync(pngPath).size;
    const webpPath = path.join(outDir, `${name}.webp`);
    const avifPath = path.join(outDir, `${name}.avif`);

    await sharp(pngPath).webp({ quality: 80 }).toFile(webpPath);
    await sharp(pngPath).avif({ quality: 50 }).toFile(avifPath);

    const webpSize = fs.statSync(webpPath).size;
    const avifSize = fs.statSync(avifPath).size;

    console.log(
      `${name}: PNG ${formatSize(pngSize)} → WebP ${formatSize(webpSize)}, AVIF ${formatSize(avifSize)}`,
    );
    processed++;
  }

  console.log(`Optimized ${processed} image(s) in ${outDir}`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  await optimizeImages();
}
