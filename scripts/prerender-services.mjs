// Renders the service pages to static HTML after `vite build` and the SSR build.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const ISLAND = "src/services/island.tsx";

const manifest = JSON.parse(await readFile(path.join(dist, ".vite/manifest.json"), "utf8"));

/** CSS for a manifest entry and every chunk it imports. */
function collectCss(key, seen = new Set()) {
  if (seen.has(key)) return [];
  seen.add(key);
  const chunk = manifest[key];
  if (!chunk) throw new Error(`prerender: ${key} is missing from the Vite manifest`);
  return [...(chunk.css ?? []), ...(chunk.imports ?? []).flatMap((dep) => collectCss(dep, seen))];
}

const island = manifest[ISLAND];
if (!island) throw new Error(`prerender: ${ISLAND} is missing from the Vite manifest`);
const assets = {
  css: [...new Set(collectCss(ISLAND))].map((file) => `/${file}`),
  js: [`/${island.file}`],
};

const { renderServicePages } = await import(pathToFileURL(path.join(root, "dist-ssr/render.js")).href);
const pages = renderServicePages({ assets });

for (const page of pages) {
  const file = path.join(dist, page.path, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, page.html);
}

// The manifest is only needed here; don't deploy it.
await rm(path.join(dist, ".vite"), { recursive: true, force: true });

console.log(`prerendered ${pages.length} service pages`);
