import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  parseExperienceYaml,
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
