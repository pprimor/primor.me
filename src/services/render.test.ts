import { describe, expect, it } from "vitest";
import { services } from "../lib/content";
import { siteMetadata } from "../lib/site-metadata";
import { renderServicePages } from "./render";

const assets = { css: ["/assets/island.css"], js: ["/assets/island.js"] };
const pages = renderServicePages({ assets, turnstileSiteKey: "site-key", analyticsToken: "tok" });
const page = (path: string) => {
  const found = pages.find((p) => p.path === path);
  if (!found) throw new Error(`no page ${path}`);
  return found.html;
};

function embeddedProps(html: string): unknown {
  const match = html.match(/<script type="application\/json" id="contact-form-props">(.*?)<\/script>/s);
  if (!match) throw new Error("no props script");
  return JSON.parse(match[1]!);
}

describe("renderServicePages", () => {
  it("renders the overview and every service, each at a trailing-slash path", () => {
    expect(pages.map((p) => p.path)).toEqual([
      "/services/",
      "/services/adobe-uxp-plugins/",
      "/services/canva-apps/",
      "/services/atlassian-forge-apps/",
      "/services/office-add-ins/",
    ]);
  });

  it("writes a complete document with head tags, assets and analytics", () => {
    const html = page("/services/adobe-uxp-plugins/");
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('<html lang="en"');
    expect(html).toContain("<title>Adobe UXP Plugin Developer · Pedro Primor</title>");
    expect(html).toContain('<link rel="canonical" href="https://primor.me/services/adobe-uxp-plugins/">');
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('<link rel="stylesheet" href="/assets/island.css" />');
    expect(html).toContain('<script type="module" src="/assets/island.js"></script>');
    expect(html).toContain("static.cloudflareinsights.com");
  });

  it("puts the content in the HTML, with one h1", () => {
    const uxp = services.services[0]!;
    const html = page("/services/adobe-uxp-plugins/");
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain(uxp.title);
    for (const plugin of uxp.shipped) expect(html).toContain(`href="${plugin.url}"`);
    for (const { q } of uxp.faq) expect(html).toContain(q.replace(/'/g, "&#x27;"));
    expect(html).toContain("<form");
    expect(html).toContain('aria-label="Breadcrumb"');
  });

  it("embeds exactly the props the form was rendered with", () => {
    expect(embeddedProps(page("/services/canva-apps/"))).toEqual({
      services: services.services.map((s) => s.name),
      selected: "Canva Apps",
      turnstileSiteKey: "site-key",
      contactEmail: siteMetadata.contactEmail,
    });
    expect(embeddedProps(page("/services/"))).toEqual({
      services: services.services.map((s) => s.name),
      turnstileSiteKey: "site-key",
      contactEmail: siteMetadata.contactEmail,
    });
  });

  it("links every service from the overview", () => {
    const html = page("/services/");
    for (const s of services.services) expect(html).toContain(`href="/services/${s.slug}/"`);
    for (const item of services.overview.also) expect(html).toContain(item.name);
  });

  it("keeps framed navigation sane: off-site links open a tab, home links leave the frame", () => {
    const html = page("/services/adobe-uxp-plugins/");
    for (const plugin of services.services[0]!.shipped) {
      expect(html).toMatch(new RegExp(`href="${plugin.url}"[^>]*target="_blank"`));
    }
    expect(html).toMatch(/href="https:\/\/github\.com\/pprimor"[^>]*target="_blank"/);
    const homeLinks = html.match(/<a href="\/"[^>]*>/g) ?? [];
    expect(homeLinks.length).toBeGreaterThan(0);
    for (const a of homeLinks) expect(a).toContain('target="_top"');
  });

  it("omits analytics without a token", () => {
    const [overview] = renderServicePages({ assets, turnstileSiteKey: null });
    expect(overview!.html).not.toContain("cloudflareinsights");
  });
});
