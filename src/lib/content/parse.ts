import { parse as parseYaml } from "yaml";
import { PANEL_IDS, type PanelId } from "../../hosts/ids";
import {
  experienceFileSchema,
  integrationsFileSchema,
  projectsFileSchema,
  skillsFileSchema,
  type ExperienceEntryYaml,
} from "./schemas";

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
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
    description: [...entry.description] as readonly string[],
    skills: [...entry.skills] as readonly string[],
    links: entry.links ? [...entry.links] : [],
    plugins: entry.plugins ? [...entry.plugins] : undefined,
  };
}

export type SkillCategory = {
  category: string;
  skills: readonly string[];
};

export type Skills = {
  categories: readonly SkillCategory[];
  additional: readonly string[];
};

export function parseSkillsYaml(raw: string): Skills {
  const parsed = parseYaml(raw);
  const file = skillsFileSchema.parse(parsed);
  return {
    categories: file.categories.map((category) => ({
      category: category.category,
      skills: category.skills.map((skill) => skill.name),
    })),
    additional: [...file.additionalSkills],
  };
}

type PluginLink = { name: string; url: string };

export function parseIntegrationsYaml(raw: string, plugins: readonly PluginLink[]) {
  const entries = integrationsFileSchema.parse(parseYaml(raw));
  return entries.map((entry) => {
    const plugin = plugins.find((p) => p.name === entry.plugin);
    if (!plugin) {
      throw new Error(`integrations.yaml: ${entry.id} names unknown plugin "${entry.plugin}"`);
    }
    return {
      id: entry.id,
      host: entry.host,
      stack: entry.stack,
      icon: entry.icon,
      desktopIcon: entry.desktopIcon,
      listing: { label: entry.listing, url: plugin.url },
      service: entry.service,
      window: entry.window,
    };
  });
}

export type Integration = ReturnType<typeof parseIntegrationsYaml>[number];

export type WindowedIntegration = Integration & {
  id: PanelId;
  window: NonNullable<Integration["window"]>;
};

const panelIds: readonly string[] = PANEL_IDS;

export function isWindowed(integration: Integration): integration is WindowedIntegration {
  return integration.window !== undefined && panelIds.includes(integration.id);
}
