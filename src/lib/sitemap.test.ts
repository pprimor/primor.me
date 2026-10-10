import { describe, expect, it } from "vitest";
import { SERVICES_PATH, servicePath, sitePaths } from "./service-paths";
import { buildSitemap } from "./sitemap";

describe("service paths", () => {
  it("always ends with a slash", () => {
    expect(SERVICES_PATH).toBe("/services/");
    expect(servicePath("canva-apps")).toBe("/services/canva-apps/");
  });

  it("lists the homepage, the overview and every service", () => {
    expect(sitePaths(["a", "b"])).toEqual(["/", "/services/", "/services/a/", "/services/b/"]);
  });
});

describe("buildSitemap", () => {
  it("writes one <url> per path", () => {
    const xml = buildSitemap("https://primor.me", ["/", "/services/"]);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).toContain("<loc>https://primor.me/services/</loc>");
  });
});
