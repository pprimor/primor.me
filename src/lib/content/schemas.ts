import { z } from "zod";

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

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const metaTitleSchema = z.string().min(1).max(60);
const metaDescriptionSchema = z.string().min(50).max(160);

export const serviceSchema = z.object({
  slug: z.string().regex(slugRegex, "Expected a lowercase kebab-case slug"),
  name: z.string().min(1),
  title: z.string().min(1),
  metaTitle: metaTitleSchema,
  metaDescription: metaDescriptionSchema,
  summary: z.string().min(1),
  pitch: z.string().min(1),
  shipped: z.array(z.string().min(1)).min(1),
  handles: z.array(z.string().min(1)).min(1),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(1),
});

export const servicesFileSchema = z
  .object({
    overview: z.object({
      title: z.string().min(1),
      metaTitle: metaTitleSchema,
      metaDescription: metaDescriptionSchema,
      pitch: z.string().min(1),
      also: z
        .array(z.object({ name: z.string().min(1), description: z.string().min(1) }))
        .min(1),
    }),
    process: z.array(z.string().min(1)).min(1),
    services: z.array(serviceSchema).min(1),
  })
  .superRefine((file, ctx) => {
    const seen = new Set<string>();
    file.services.forEach((service, index) => {
      if (seen.has(service.slug)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate slug "${service.slug}"`,
          path: ["services", index, "slug"],
        });
      }
      seen.add(service.slug);
    });
  });

export type ProjectYaml = z.infer<typeof projectSchema>;
export type ExperienceEntryYaml = z.infer<typeof experienceEntrySchema>;
export type SkillsFileYaml = z.infer<typeof skillsFileSchema>;
export type ExperiencePluginYaml = z.infer<typeof experiencePluginSchema>;
