import { readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import type { renderServicePages } from "../services/render";
import { parseExperienceYaml, parseServicesYaml } from "./content/parse";
import { sitePaths } from "./service-paths";
import { buildSitemap } from "./sitemap";
import { siteMetadata } from "./site-metadata";

const ISLAND_ENTRY = "/src/services/island.tsx";

function readServiceSlugs(root: string): string[] {
  const read = (name: string) => readFileSync(path.join(root, "content", `${name}.yaml`), "utf8");
  const plugins = parseExperienceYaml(read("experience")).flatMap((entry) => entry.plugins ?? []);
  return parseServicesYaml(read("services"), plugins).services.map((service) => service.slug);
}

/** Serves the pre-rendered service pages in dev and emits sitemap.xml in the client build. */
export function servicePagesPlugin(): Plugin {
  let root = process.cwd();
  let isSsrBuild = false;

  return {
    name: "service-pages",
    configResolved(config) {
      root = config.root;
      isSsrBuild = Boolean(config.build.ssr);
    },
    generateBundle() {
      if (isSsrBuild) return;
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: buildSitemap(siteMetadata.siteUrl, sitePaths(readServiceSlugs(root))),
      });
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/services")) return next();
        const wanted = url.endsWith("/") ? url : `${url}/`;
        try {
          const mod = (await server.ssrLoadModule("/src/services/render.tsx")) as {
            renderServicePages: typeof renderServicePages;
          };
          const page = mod
            .renderServicePages({ assets: { css: [], js: [ISLAND_ENTRY] } })
            .find((candidate) => candidate.path === wanted);
          if (!page) return next();
          const html = await server.transformIndexHtml(url, page.html);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          next(error);
        }
      });
    },
  };
}
