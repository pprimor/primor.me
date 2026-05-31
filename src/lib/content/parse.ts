import type { ReactElement } from "react";
import { parse as parseYaml } from "yaml";
import { getExperienceIcon, getSkillIcon } from "../icons";
import {
  experienceFileSchema,
  projectsFileSchema,
  skillsFileSchema,
  type ExperienceEntryYaml,
  type SkillsFileYaml,
} from "./schemas";

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function requireSkillIcon(name: string): ReactElement {
  const icon = getSkillIcon(name);
  if (!icon) {
    throw new Error(`No icon registered for skill "${name}" in icons.ts`);
  }
  return icon;
}

export function parseProjectsYaml(raw: string) {
  const parsed = parseYaml(raw);
  const projects = projectsFileSchema.parse(parsed);
  return projects.map((project) => ({
    ...project,
    tags: [...project.tags],
  }));
}

export type Project = ReturnType<typeof parseProjectsYaml>[number];

export function parseExperienceYaml(raw: string) {
  const parsed = parseYaml(raw);
  const entries = experienceFileSchema.parse(parsed);
  return entries.map(transformExperienceEntry);
}

export type ExperienceEntry = ReturnType<typeof parseExperienceYaml>[number];

function transformExperienceEntry(entry: ExperienceEntryYaml) {
  return {
    title: entry.title,
    company: entry.company,
    companyUrl: entry.companyUrl,
    employmentType: entry.employmentType,
    location: entry.location,
    startDate: parseIsoDate(entry.startDate),
    endDate: entry.endDate ? parseIsoDate(entry.endDate) : null,
    icon: getExperienceIcon(entry.icon),
    description: [...entry.description] as readonly string[],
    skills: [...entry.skills] as readonly string[],
    links: entry.links ? [...entry.links] : [],
    plugins: entry.plugins ? [...entry.plugins] : undefined,
  };
}

export type SkillWithIcon = {
  name: string;
  icon: ReactElement;
};

export type SkillCategory = {
  category: string;
  skills: readonly SkillWithIcon[];
};

export function buildSkillsByCategory(file: SkillsFileYaml): readonly SkillCategory[] {
  for (const name of file.additionalSkills) {
    requireSkillIcon(name);
  }

  return file.categories.map((category) => ({
    category: category.category,
    skills: category.skills.map((skill) => ({
      name: skill.name,
      icon: requireSkillIcon(skill.name),
    })),
  }));
}

export function parseSkillsYaml(raw: string) {
  const parsed = parseYaml(raw);
  const file = skillsFileSchema.parse(parsed);
  return buildSkillsByCategory(file);
}

export function getExperienceSkillIcons(skillNames: readonly string[]) {
  return skillNames.map((name) => ({
    name,
    icon: getSkillIcon(name),
  }));
}
