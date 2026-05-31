import { z } from "zod";
import { experienceIconKeys } from "../icons";

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
  icon: z.enum(experienceIconKeys),
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
