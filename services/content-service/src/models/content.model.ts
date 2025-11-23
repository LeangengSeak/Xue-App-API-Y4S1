import { Schema, model, Document, Types } from "mongoose";

/**
 * Content service model
 * - owns content and lessons
 * - includes access control fields and aggregates for synchronous Top-Picks queries
 */

export type ContentType = "story" | "article" | "course";
export type Difficulty = "Beginner" | "Novice" | "Intermediate" | "Advanced";
export type AccessLevel = "free" | "premium";

export interface ILesson {
  lessonIndex: number;
  title?: string;
  body?: string;
  media?: Array<{
    type: "image" | "audio" | "video";
    url: string;
    durationSecs?: number;
  }>;
  wordsCount?: number;
  charactersCount?: number;
  estimatedReadTimeMins?: number;
  audio?: { url?: string; durationSecs?: number };
}

export interface IContent extends Document {
  type: ContentType;
  title: string;
  subtitle?: string | null;
  description?: string;
  coverImageUrl?: string;
  difficulty?: Difficulty;
  category?: string;
  tags?: string[];
  readTimeMins?: number;
  author?: string;
  starred?: boolean;
  status?: "draft" | "published" | "archived";
  publishedAt?: Date;
  lessons?: ILesson[];
  metadata?: Record<string, any>;
  // Access control
  access?: AccessLevel;
  requiredPlanSlug?: string | null;
  // Aggregates kept on content doc for synchronous queries
  views?: number;
  bookmarksCount?: number;
  completionsCount?: number;
  downloadsCount?: number;
  avgRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    lessonIndex: { type: Number, required: true },
    title: { type: String },
    body: { type: String },
    media: [{ type: Schema.Types.Mixed }],
    wordsCount: { type: Number, default: 0 },
    charactersCount: { type: Number, default: 0 },
    estimatedReadTimeMins: { type: Number, default: 0 },
    audio: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ContentSchema = new Schema<IContent>(
  {
    type: {
      type: String,
      enum: ["story", "article", "course"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: null },
    description: { type: String },
    coverImageUrl: { type: String },
    difficulty: {
      type: String,
      enum: ["Beginner", "Novice", "Intermediate", "Advanced"],
      default: "Beginner",
      index: true,
    },
    category: { type: String, index: true },
    tags: { type: [String], index: true },
    readTimeMins: { type: Number },
    author: { type: String },
    starred: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    access: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
      index: true,
    },
    requiredPlanSlug: { type: String, default: null, index: true },
    publishedAt: { type: Date, index: true },
    lessons: { type: [LessonSchema], default: [] },
    metadata: { type: Schema.Types.Mixed },
    views: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    completionsCount: { type: Number, default: 0 },
    downloadsCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// text index for search across title, description and lesson text
ContentSchema.index({
  title: "text",
  description: "text",
  "lessons.body": "text",
});

export const Content = model<IContent>("Content", ContentSchema);
