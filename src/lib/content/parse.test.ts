import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { parse as parseYaml, stringify } from "yaml";
import { PANEL_IDS } from "../../hosts/ids";
import {
  parseExperienceYaml,
  parseIntegrationsYaml,
  parseProjectsYaml,
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
