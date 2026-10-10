import { describe, expect, it } from "vitest";
import { parse as parseYaml, stringify } from "yaml";
import { ZodError } from "zod";
import { PANEL_IDS } from "../../hosts/ids";
import {
  parseExperienceYaml,
  parseIntegrationsYaml,
  parseProjectsYaml,
  parseServicesYaml,
  parseSkillsYaml,
} from "./parse";

const contentYaml = import.meta.glob("/content/*.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const invalidExperienceYaml = import.meta.glob(
  "/content/__fixtures__/invalid-experience.yaml",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

function readContent(name: string): string {
  const raw = contentYaml[`/content/${name}.yaml`];
  if (!raw) {
    throw new Error(`Missing test fixture: /content/${name}.yaml`);
  }
  return raw;
}

describe("parseProjectsYaml", () => {
  it("parses production projects.yaml with expected count", () => {
    const projects = parseProjectsYaml(readContent("projects"));
    expect(projects).toHaveLength(2);
    expect(projects[0]?.title).toBe("primor.me");
    expect(projects[1]?.tags).toContain("Git");
  });
});

describe("parseExperienceYaml", () => {
  it("parses production experience.yaml with expected count and dates", () => {
    const experience = parseExperienceYaml(readContent("experience"));
    expect(experience).toHaveLength(6);
    expect(experience[0]?.company).toBe("PageProof");
    expect(experience[0]?.endDate).toBeNull();
    expect(experience[0]?.startDate).toEqual(new Date(2023, 2, 1));
  });

  it("throws ZodError for invalid fixture", () => {
    const raw = Object.values(invalidExperienceYaml)[0];
    expect(raw).toBeDefined();
    expect(() => parseExperienceYaml(raw!)).toThrow(ZodError);
  });
});

describe("parseSkillsYaml", () => {
  it("parses production skills.yaml into categories and additional skills", () => {
    const { categories, additional } = parseSkillsYaml(readContent("skills"));
    expect(categories).toHaveLength(5);
    const backend = categories.find((c) => c.category === "Backend & Cloud");
    expect(backend?.skills).toContain("Azure Functions");
    expect(additional).toContain("JavaScript");
  });
});

describe("parseIntegrationsYaml", () => {
  const plugins = parseExperienceYaml(readContent("experience")).flatMap(
    (e) => e.plugins ?? [],
  );
  const base = () =>
    parseYaml(readContent("integrations")) as Record<string, unknown>[];

  it("parses production integrations.yaml, resolving listing URLs from experience.yaml", () => {
    const integrations = parseIntegrationsYaml(readContent("integrations"), plugins);
    expect(integrations).toHaveLength(9);
    const jira = integrations.find((i) => i.id === "jira");
    expect(jira?.listing.url).toBe(
      plugins.find((p) => p.name === "PageProof for Jira")?.url,
    );
    const windowed = integrations.filter((i) => i.window).map((i) => i.id);
    expect([...windowed].sort()).toEqual([...PANEL_IDS].sort());
  });

  it("links each host window, and InDesign, to a service page that exists", () => {
    const integrations = parseIntegrationsYaml(readContent("integrations"), plugins);
    const slugs = parseServicesYaml(readContent("services"), plugins).services.map((s) => s.slug);
    const linked = integrations.filter((i) => i.service);
    expect(linked.map((i) => i.id).sort()).toEqual([...PANEL_IDS, "indesign"].sort());
    for (const i of linked) expect(slugs).toContain(i.service);
  });

  it("rejects a plugin name experience.yaml doesn't have", () => {
    const entries = base();
    entries[0]!.plugin = "PageProof for Nothing";
    expect(() => parseIntegrationsYaml(stringify(entries), plugins)).toThrow(
      /unknown plugin/,
    );
  });

  it("rejects duplicate ids", () => {
    const entries = base();
    entries.push({ ...entries.at(-1)! });
    expect(() => parseIntegrationsYaml(stringify(entries), plugins)).toThrow(ZodError);
  });

  it("rejects a window on an integration that has no panel", () => {
    const entries = base();
    const indesign = entries.find((e) => e.id === "indesign")!;
    indesign.window = { title: "InDesign", caption: "x" };
    expect(() => parseIntegrationsYaml(stringify(entries), plugins)).toThrow(ZodError);
  });

  it("rejects a panel integration without its window", () => {
    const entries = base();
    delete entries.find((e) => e.id === "jira")!.window;
    expect(() => parseIntegrationsYaml(stringify(entries), plugins)).toThrow(ZodError);
  });
});

const plugins = [
  { name: "PageProof for Canva", url: "https://example.com/canva", description: "Canva app" },
  { name: "PageProof for Jira", url: "https://example.com/jira" },
];

function validServicesFile() {
  return {
    overview: {
      title: "Plugin & integration development",
      metaTitle: "Plugin & Integration Developer · Pedro Primor",
      metaDescription: "I build plugins and integrations for Adobe, Canva, Microsoft Office and Jira.",
      pitch: "Pitch.",
      also: [{ name: "QuarkXPress XTensions", description: "Native extensions." }],
    },
    process: ["Call", "Quote"],
    services: [
      {
        slug: "canva-apps",
        name: "Canva Apps",
        title: "Canva app development",
        metaTitle: "Canva App Developer · Pedro Primor",
        metaDescription: "I build Canva Apps with React, TypeScript and the Canva Apps SDK for your product.",
        summary: "Summary.",
        pitch: "Pitch.",
        shipped: ["PageProof for Canva"],
        handles: ["App UI"],
        faq: [{ q: "Q?", a: "A." }],
      },
    ],
  };
}

describe("parseServicesYaml", () => {
  it("parses production services.yaml against production plugins", () => {
    const allPlugins = parseExperienceYaml(readContent("experience")).flatMap((e) => e.plugins ?? []);
    const { services } = parseServicesYaml(readContent("services"), allPlugins);
    expect(services.map((s) => s.slug)).toEqual([
      "adobe-uxp-plugins",
      "canva-apps",
      "atlassian-forge-apps",
      "office-add-ins",
    ]);
    const uxp = services[0]!;
    expect(uxp.shipped.map((p) => p.name)).toEqual([
      "PageProof for Adobe Photoshop",
      "PageProof for Adobe InDesign",
    ]);
    expect(uxp.shipped[0]?.url).toMatch(/^https:\/\/exchange\.adobe\.com\//);
  });

  it("resolves shipped names to the full plugin record", () => {
    const { services } = parseServicesYaml(stringify(validServicesFile()), plugins);
    expect(services[0]?.shipped).toEqual([plugins[0]]);
  });

  it("rejects a shipped plugin missing from experience.yaml, naming both", () => {
    const file = validServicesFile();
    file.services[0]!.shipped = ["PageProof for Nothing"];
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(
      /canva-apps.*PageProof for Nothing/,
    );
  });

  it("rejects duplicate slugs", () => {
    const file = validServicesFile();
    file.services.push({ ...file.services[0]! });
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(/Duplicate slug.*canva-apps/);
  });

  it("rejects a metaDescription over 160 characters", () => {
    const file = validServicesFile();
    file.services[0]!.metaDescription = "x".repeat(161);
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(ZodError);
  });

  it("rejects a metaTitle over 60 characters", () => {
    const file = validServicesFile();
    file.services[0]!.metaTitle = "x".repeat(61);
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(ZodError);
  });

  it("rejects a non-kebab-case slug", () => {
    const file = validServicesFile();
    file.services[0]!.slug = "Canva Apps";
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(ZodError);
  });

  it("rejects a service with no FAQ", () => {
    const file = validServicesFile();
    file.services[0]!.faq = [];
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(ZodError);
  });
});
