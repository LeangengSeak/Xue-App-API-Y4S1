import { Schema, model, Document, Types } from "mongoose";

/**
 * Read service: owns bookmarks, read progress, downloads.
 * - One document per userId+contentId for ReadProgress (fast queries by user).
 * - When bookmarks/downloads/completions occur, this service performs the canonical write and then synchronously calls Content service
 *   to increment the corresponding counter on the Content document (no event system).
 */

export interface ILessonProgress {
  lessonIndex: number;
  progressPercent: number; // 0-100
  wordsRead?: number;
  charactersRead?: number;
  lastReadAt?: Date;
}

export interface IReadProgress extends Document {
  userId: Types.ObjectId;
  contentId: Types.ObjectId;
  progressPercent: number;
  lessonProgress: ILessonProgress[];
  markedRead: boolean;
  lastReadAt?: Date;
  totalLessons?: number;
  totalWords?: number;
  totalCharacters?: number;
  wordsRead?: number;
  charactersRead?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    lessonIndex: { type: Number, required: true },
    progressPercent: { type: Number, default: 0 },
    wordsRead: { type: Number, default: 0 },
    charactersRead: { type: Number, default: 0 },
    lastReadAt: { type: Date },
  },
  { _id: false }
);

const ReadProgressSchema = new Schema<IReadProgress>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    contentId: { type: Schema.Types.ObjectId, required: true, index: true },
    progressPercent: { type: Number, default: 0, index: true },
    lessonProgress: { type: [LessonProgressSchema], default: [] },
    markedRead: { type: Boolean, default: false, index: true },
    lastReadAt: { type: Date },
    totalLessons: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    totalCharacters: { type: Number, default: 0 },
    wordsRead: { type: Number, default: 0 },
    charactersRead: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReadProgressSchema.index({ userId: 1, lastReadAt: -1 });
ReadProgressSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const ReadProgress = model<IReadProgress>(
  "ReadProgress",
  ReadProgressSchema
);

/* Bookmark model */
export interface IBookmark extends Document {
  userId: Types.ObjectId;
  contentId: Types.ObjectId;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    contentId: { type: Schema.Types.ObjectId, required: true, index: true }, // single ObjectId (fixed)
    note: { type: String, default: null },
  },
  { timestamps: true }
);

// ensure one bookmark per user+content
BookmarkSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const Bookmark = model<IBookmark>("Bookmark", BookmarkSchema);

/* Download model */
export interface IDownload extends Document {
  userId: Types.ObjectId;
  contentId: Types.ObjectId;
  filePath: string;
  deviceInfo?: any;
  createdAt: Date;
  updatedAt: Date;
}

const DownloadSchema = new Schema<IDownload>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    contentId: { type: Schema.Types.ObjectId, required: true, index: true },
    filePath: { type: String, required: true },
    deviceInfo: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

DownloadSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const Download = model<IDownload>("Download", DownloadSchema);
