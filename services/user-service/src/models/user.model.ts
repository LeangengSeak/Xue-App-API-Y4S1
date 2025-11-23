import { Schema, model, Document, Types } from "mongoose";

/**
 * Profile model (User service)
 * - cached aggregates & preferences used by profile UI
 * - entitlements: cached subscription info (set by Subscription service on webhook)
 * - optional recent* arrays: small capped caches for fast UI
 */

export interface IEntitlements {
  active: boolean;
  planSlug?: string | null;
  expiresAt?: Date | null;
}

export interface IProfile extends Document {
  authUserId: Types.ObjectId;
  languageLevel?: "Beginner" | "Novice" | "Intermediate" | "Advanced";
  lessonsCompleted?: number;
  wordsLearned?: number;
  charactersLearned?: number;
  bookmarkedCount?: number;
  markedReadCount?: number;
  downloadedCount?: number;
  preferences?: {
    theme?: "dark" | "light";
    notifications?: { email?: boolean; push?: boolean };
  };
  subscriptionId?: Types.ObjectId; // optional mirror to Subscription._id
  entitlements?: IEntitlements;
  recentBookmarked?: Types.ObjectId[]; // capped cache
  recentDownloaded?: Types.ObjectId[];
  recentMarkedRead?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    authUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    languageLevel: {
      type: String,
      enum: ["Beginner", "Novice", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    lessonsCompleted: { type: Number, default: 0 },
    wordsLearned: { type: Number, default: 0 },
    charactersLearned: { type: Number, default: 0 },
    bookmarkedCount: { type: Number, default: 0 },
    markedReadCount: { type: Number, default: 0 },
    downloadedCount: { type: Number, default: 0 },
    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },
    subscriptionId: { type: Schema.Types.ObjectId },
    entitlements: {
      active: { type: Boolean, default: false },
      planSlug: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
    recentBookmarked: [{ type: Schema.Types.ObjectId, ref: "Content" }],
    recentDownloaded: [{ type: Schema.Types.ObjectId, ref: "Content" }],
    recentMarkedRead: [{ type: Schema.Types.ObjectId, ref: "Content" }],
  },
  { timestamps: true }
);

// Optionally add schema methods/helpers in future to manage capped recent lists

export const Profile = model<IProfile>("Profile", ProfileSchema);
