import { describe, expect, it } from "vitest";
import { services } from "../lib/content";
import { PERSON_ID } from "../lib/head-tags";
import { overviewPageMeta, servicePageMeta } from "./meta";

type Node = Record<string, unknown> & { "@type": string };

function graph(jsonLd: Record<string, unknown>): Node[] {
  return jsonLd["@graph"] as Node[];
}

function byType(nodes: Node[], type: string): Node {
  const node = nodes.find((n) => n["@type"] === type);
  if (!node) throw new Error(`no ${type} node`);
  return node;
}

describe("servicePageMeta", () => {
  const uxp = services.services[0]!;
  const meta = servicePageMeta(uxp);

  it("uses the service's meta title, description and path", () => {
    expect(meta.path).toBe("/services/adobe-uxp-plugins/");
    expect(meta.title).toBe(uxp.metaTitle);
    expect(meta.description).toBe(uxp.metaDescription);
  });

  it("describes a Service provided by the Person", () => {
    const nodes = graph(meta.jsonLd);
    expect(meta.jsonLd["@context"]).toBe("https://schema.org");
    expect(byType(nodes, "Person")["@id"]).toBe(PERSON_ID);
    expect(byType(nodes, "Service")).toMatchObject({
      name: uxp.title,
      serviceType: uxp.name,
      url: "https://primor.me/services/adobe-uxp-plugins/",
      provider: { "@id": PERSON_ID },
    });
  });

  it("turns the FAQ into a FAQPage", () => {
    const faq = byType(graph(meta.jsonLd), "FAQPage");
    expect(faq.mainEntity).toEqual(
      uxp.faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    );
  });

  it("has a three-level breadcrumb", () => {
    const crumbs = byType(graph(meta.jsonLd), "BreadcrumbList").itemListElement as Node[];
    expect(crumbs.map((c) => c.item)).toEqual([
      "https://primor.me/",
      "https://primor.me/services/",
      "https://primor.me/services/adobe-uxp-plugins/",
    ]);
    expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3]);
  });
});

describe("overviewPageMeta", () => {
  it("lists every service in an ItemList", () => {
    const meta = overviewPageMeta(services);
    expect(meta.path).toBe("/services/");
    const list = byType(graph(meta.jsonLd), "ItemList").itemListElement as Node[];
    expect(list.map((item) => item.url)).toEqual(
      services.services.map((s) => `https://primor.me/services/${s.slug}/`),
    );
  });
});
