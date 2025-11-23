import { z } from "zod";

export const lessonProgressSchema = z.object({
  lessonIndex: z.number().int(),
  progressPercent: z.number().min(0).max(100).optional(),
  wordsRead: z.number().int().nonnegative().optional(),
  charactersRead: z.number().int().nonnegative().optional(),
});

export const progressSchema = z.object({
  progressPercent: z.number().min(0).max(100).optional(),
  lessonProgress: z.array(lessonProgressSchema).optional(),
  markedRead: z.boolean().optional(),
});

export const bookmarkSchema = z.object({
  contentId: z.string(),
  note: z.string().nullable().optional(),
});

export const downloadSchema = z.object({
  contentId: z.string(),
  filePath: z.string(),
  deviceInfo: z.any().optional(),
});

export default {
  progressSchema,
  bookmarkSchema,
  downloadSchema,
};
