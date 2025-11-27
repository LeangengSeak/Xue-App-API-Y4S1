import { z } from "zod";

const languageLevelEnum = z.enum([
  "Beginner",
  "Novice",
  "Intermediate",
  "Advanced",
]);

const preferencesSchema = z
  .object({
    theme: z.enum(["dark", "light"]).optional(),
    notifications: z
      .object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
      })
      .optional(),
  })
  .optional();

export const createProfileSchema = z
  .object({
    authUserId: z.string().min(1),
    languageLevel: languageLevelEnum.optional(),
    lessonsCompleted: z.number().int().nonnegative().optional(),
    wordsLearned: z.number().int().nonnegative().optional(),
    charactersLearned: z.number().int().nonnegative().optional(),
    preferences: preferencesSchema,
  })
  .strict();

export const updateProfileSchema = createProfileSchema.partial().strict();

export const updatePreferencesSchema = z
  .object({
    theme: z.enum(["dark", "light"]).optional(),
    notifications: z
      .object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

export const entitlementsSchema = z
  .object({
    active: z.boolean(),
    planSlug: z.string().nullable().optional(),
    expiresAt: z
      .union([z.string(), z.date()])
      .transform((val) => (typeof val === "string" ? new Date(val) : val))
      .nullable()
      .optional(),
  })
  .strict();

export const updateEntitlementsSchema = z
  .object({
    subscriptionId: z.string().optional(),
    entitlements: entitlementsSchema.optional(),
  })
  .strict();

export const incrementSchema = z
  .object({
    contentId: z.string().min(1),
    decrement: z.boolean().optional(),
  })
  .strict();

export const markReadSchema = z
  .object({
    contentId: z.string().min(1),
  })
  .strict();

export const wordsIncrementSchema = z
  .object({
    contentId: z.string().min(1),
    words: z.number().int().nonnegative().optional(),
    characters: z.number().int().nonnegative().optional(),
  })
  .strict();

export default {
  createProfileSchema,
  updateProfileSchema,
  updatePreferencesSchema,
  updateEntitlementsSchema,
  incrementSchema,
  markReadSchema,
  wordsIncrementSchema,
};
