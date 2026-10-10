import { z } from "zod";
import { PANEL_IDS } from "../../hosts/ids";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const isoDateSchema = z
  .string()
  .regex(isoDateRegex, "Expected ISO date YYYY-MM-DD");

export const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  images: z.object({
    light: z.string().min(1),
    dark: z.string().min(1),
  }),
  liveUrl: z.string().url(),
  repoUrl: z.string().url(),
});

export const projectsFileSchema = z.array(projectSchema).min(1);

export const experiencePluginSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const experienceLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

export const experienceEntrySchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  companyUrl: z.string().url().optional(),
  employmentType: z.string().min(1),
  location: z.string().optional(),
  startDate: isoDateSchema,
  endDate: isoDateSchema.nullable(),
  description: z.array(z.string()).min(1),
  skills: z.array(z.string()),
  links: z.array(experienceLinkSchema).optional(),
  plugins: z.array(experiencePluginSchema).optional(),
});

export const experienceFileSchema = z.array(experienceEntrySchema).min(1);

export const skillNameSchema = z.object({
  name: z.string().min(1),
});

export const skillCategorySchema = z.object({
  category: z.string().min(1),
  skills: z.array(skillNameSchema).min(1),
});

export const skillsFileSchema = z.object({
  categories: z.array(skillCategorySchema).min(1),
  additionalSkills: z.array(z.string().min(1)),
});

export type ProjectYaml = z.infer<typeof projectSchema>;
export type ExperienceEntryYaml = z.infer<typeof experienceEntrySchema>;
export type SkillsFileYaml = z.infer<typeof skillsFileSchema>;

export const integrationSchema = z.object({
  id: z.string().regex(/^[a-z]+$/),
  host: z.string().min(1),
  plugin: z.string().min(1),
  listing: z.string().min(1),
  stack: z.string().min(1),
  icon: z.string().regex(/^#[0-9a-f]{6}$/i),
  /** Windowless integrations get a desktop icon unless this is false. */
  desktopIcon: z.boolean().default(true),
  service: z.string().regex(/^[a-z0-9-]+$/).optional(),
  window: z
    .object({ title: z.string().min(1), caption: z.string().min(1) })
    .optional(),
});

const panelIds: readonly string[] = PANEL_IDS;

export const integrationsFileSchema = z
  .array(integrationSchema)
  .min(1)
  .superRefine((entries, ctx) => {
    const seen = new Set<string>();
    entries.forEach((entry, i) => {
      if (seen.has(entry.id)) {
        ctx.addIssue({ code: "custom", path: [i, "id"], message: `Duplicate id ${entry.id}` });
      }
      seen.add(entry.id);
      const isPanel = panelIds.includes(entry.id);
      if (isPanel !== Boolean(entry.window)) {
        ctx.addIssue({
          code: "custom",
          path: [i, "window"],
          message: isPanel ? `${entry.id} needs a window` : `${entry.id} has no panel, so no window`,
        });
      }
    });
    for (const id of PANEL_IDS) {
      if (!seen.has(id)) {
        ctx.addIssue({ code: "custom", path: [], message: `Missing integration for panel ${id}` });
      }
    }
  });

export type IntegrationYaml = z.infer<typeof integrationSchema>;
