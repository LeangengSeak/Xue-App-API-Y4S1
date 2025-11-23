import { z } from "zod";

export const listQuerySchema = z.object({
  ids: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const createContentSchema = z
  .object({
    type: z.enum(["story", "article", "course"]),
    title: z.string().min(1),
    subtitle: z.string().nullable().optional(),
    description: z.string().optional(),
    coverImageUrl: z.string().url().optional(),
    difficulty: z
      .enum(["Beginner", "Novice", "Intermediate", "Advanced"])
      .optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    access: z.enum(["free", "premium"]).optional(),
    requiredPlanSlug: z.string().nullable().optional(),
    lessons: z
      .array(
        z.object({
          lessonIndex: z.number().int(),
          title: z.string().optional(),
          body: z.string().optional(),
          media: z.array(z.any()).optional(),
          audio: z
            .object({
              url: z.string().optional(),
              durationSecs: z.number().optional(),
            })
            .optional(),
        })
      )
      .optional(),
  })
  .strict();

export const incrementSchema = z
  .object({
    field: z.enum([
      "bookmarksCount",
      "downloadsCount",
      "views",
      "completionsCount",
    ]),
    by: z.coerce.number().int().optional(),
  })
  .strict();

export const batchSchema = z.object({
  ids: z.array(z.string()).min(1),
  fields: z.array(z.string()).optional(),
});

// Partial schema for updates: allow any subset of create fields
export const updateContentSchema = createContentSchema.partial();

export default {
  listQuerySchema,
  createContentSchema,
  incrementSchema,
  batchSchema,
};
