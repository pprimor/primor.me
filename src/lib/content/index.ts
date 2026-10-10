import {
  parseExperienceYaml,
  parseProjectsYaml,
  parseServicesYaml,
  parseSkillsYaml,
} from "./parse";

const yamlModules = import.meta.glob("/content/*.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function getContentYaml(basename: string): string {
  const key = `/content/${basename}.yaml`;
  const raw = yamlModules[key];
  if (raw === undefined) {
    throw new Error(`Missing content file: ${key}`);
  }
  return raw;
}

export const projects = parseProjectsYaml(getContentYaml("projects"));
export const experienceData = parseExperienceYaml(getContentYaml("experience"));
export const skills = parseSkillsYaml(getContentYaml("skills"));
export const services = parseServicesYaml(
  getContentYaml("services"),
  experienceData.flatMap((entry) => entry.plugins ?? []),
);

export type { Project, ExperienceEntry, SkillCategory, Skills, Service, ServicesContent } from "./parse";
export type { ProjectYaml, ExperienceEntryYaml, SkillsFileYaml } from "./schemas";
