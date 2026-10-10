import { describe, expect, it } from "vitest";
import {
  PERSON_ID,
  analyticsTag,
  buildHeadTags,
  homePageMeta,
  renderHeadTags,
  safeJson,
  type HeadTag,
} from "./head-tags";
import { siteMetadata } from "./site-metadata";

const og = "https://primor.me/images/og.png";

describe("buildHeadTags", () => {
  it("produces the homepage tag set unchanged from the old site-meta plugin", () => {
    const tags = buildHeadTags(homePageMeta);
    const withoutJsonLd = tags.slice(0, -1);
    expect(withoutJsonLd).toEqual<HeadTag[]>([
      { tag: "title", children: siteMetadata.title },
      { tag: "meta", attrs: { name: "description", content: siteMetadata.description } },
      { tag: "meta", attrs: { name: "author", content: "Pedro Primor" } },
      { tag: "link", attrs: { rel: "canonical", href: "https://primor.me/" } },
      { tag: "meta", attrs: { property: "og:title", content: siteMetadata.title } },
      { tag: "meta", attrs: { property: "og:description", content: siteMetadata.description } },
      { tag: "meta", attrs: { property: "og:url", content: "https://primor.me/" } },
      { tag: "meta", attrs: { property: "og:type", content: "website" } },
      { tag: "meta", attrs: { property: "og:locale", content: "en" } },
      { tag: "meta", attrs: { property: "og:image", content: og } },
      { tag: "meta", attrs: { property: "og:image:alt", content: siteMetadata.ogImageAlt } },
      { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
      { tag: "meta", attrs: { name: "twitter:title", content: siteMetadata.title } },
      { tag: "meta", attrs: { name: "twitter:description", content: siteMetadata.description } },
      { tag: "meta", attrs: { name: "twitter:image", content: og } },
    ]);

    const jsonLd = tags.at(-1)!;
    expect(jsonLd.attrs).toEqual({ type: "application/ld+json" });
    expect(JSON.parse(jsonLd.children!)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Pedro Primor",
      url: "https://primor.me",
      jobTitle: siteMetadata.jobTitle,
      description: siteMetadata.description,
      image: og,
      worksFor: { "@type": "Organization", name: "PageProof", url: "https://pageproof.com" },
      sameAs: ["https://github.com/pprimor", "https://www.linkedin.com/in/primor/"],
    });
  });

  it("uses the page path for canonical and og:url", () => {
    const tags = buildHeadTags({ ...homePageMeta, path: "/services/canva-apps/" });
    expect(tags).toContainEqual({
      tag: "link",
      attrs: { rel: "canonical", href: "https://primor.me/services/canva-apps/" },
    });
    expect(tags).toContainEqual({
      tag: "meta",
      attrs: { property: "og:url", content: "https://primor.me/services/canva-apps/" },
    });
  });
});

describe("safeJson", () => {
  it("cannot close a script tag or open a comment", () => {
    const out = safeJson({ a: "</script><!-- & >" });
    expect(out).not.toMatch(/[<>&]/);
    expect(JSON.parse(out)).toEqual({ a: "</script><!-- & >" });
  });
});

describe("renderHeadTags", () => {
  it("serialises void, text and boolean-attribute tags with escaping", () => {
    const html = renderHeadTags([
      { tag: "title", children: "A & B <c>" },
      { tag: "meta", attrs: { name: "description", content: 'Say "hi"' } },
      analyticsTag("tok"),
    ]);
    expect(html).toContain("<title>A &amp; B &lt;c&gt;</title>");
    expect(html).toContain('<meta name="description" content="Say &quot;hi&quot;">');
    expect(html).toContain(
      '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;:&quot;tok&quot;}"></script>',
    );
  });
});
