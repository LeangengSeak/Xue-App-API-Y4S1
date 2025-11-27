import { ReadProgress, Bookmark, Download } from "../models/read.model";
import { Types } from "mongoose";
import {
  BadRequestException,
  UnauthorizedException,
} from "../shared/utils/catch-errors";
import { config } from "../config/app.config";

const CONTENT_SERVICE_URL =
  config.CONTENT_SERVICE_URL || "http://content-service:4003";
const USER_SERVICE_URL = config.USER_SERVICE_URL || "http://user-service:4002";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || "";
const fetch = require("node-fetch");

export class ReadService {
  constructor() {}

  public async getProgress(userId: string, contentId: string) {
    if (!userId || !Types.ObjectId.isValid(userId))
      throw new UnauthorizedException("Invalid user id");
    if (!contentId || !Types.ObjectId.isValid(contentId))
      throw new BadRequestException("Invalid content id");

    const doc = await ReadProgress.findOne({
      userId: new Types.ObjectId(userId),
      contentId: new Types.ObjectId(contentId),
    }).lean();
    return doc;
  }

  public async upsertProgress(userId: string, contentId: string, payload: any) {
    if (!userId || !Types.ObjectId.isValid(userId))
      throw new UnauthorizedException("Invalid user id");
    if (!contentId || !Types.ObjectId.isValid(contentId))
      throw new BadRequestException("Invalid content id");
    const update: any = {};
    if (typeof payload.progressPercent === "number")
      update.progressPercent = payload.progressPercent;
    if (payload.lessonProgress) update.lessonProgress = payload.lessonProgress;
    if (typeof payload.markedRead === "boolean")
      update.markedRead = payload.markedRead;
    update.lastReadAt = new Date();

    const opts = { upsert: true, new: true, setDefaultsOnInsert: true } as any;

    // read existing doc to detect state changes (to avoid double counting)
    const existing = await ReadProgress.findOne({
      userId: new Types.ObjectId(userId),
      contentId: new Types.ObjectId(contentId),
    }).lean();

    // Calculate words/characters read delta from provided lessonProgress
    let totalWordsFromPayload = 0;
    let totalCharsFromPayload = 0;
    if (Array.isArray(payload.lessonProgress)) {
      for (const lp of payload.lessonProgress) {
        if (typeof lp.wordsRead === "number") totalWordsFromPayload += lp.wordsRead;
        if (typeof lp.charactersRead === "number") totalCharsFromPayload += lp.charactersRead;
      }
      // persist totals on the ReadProgress document
      update.wordsRead = totalWordsFromPayload;
      update.charactersRead = totalCharsFromPayload;
    }

    const res = await ReadProgress.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        contentId: new Types.ObjectId(contentId),
      },
      { $set: update },
      opts
    ).lean();

    // If the client marked the content as read now, and it wasn't previously marked,
    // notify user-service to increment marked-read aggregate (which will also increment lessonsCompleted).
    try {
      if (
        typeof payload.markedRead === "boolean" &&
        payload.markedRead === true
      ) {
        if (!existing || existing.markedRead !== true) {
          // best-effort call to user-service
          try {
            await fetch(
              `${USER_SERVICE_URL}/${userId}/profile/markread-increment`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "x-service-token": SERVICE_TOKEN,
                },
                body: JSON.stringify({ contentId }),
              }
            );
          } catch (err) {
            // ignore
          }
        }
      }
    } catch (err) {}

    // After updating progress, inform user-service about words/characters learned
    try {
      const prevWords = existing?.wordsRead || 0;
      const prevChars = existing?.charactersRead || 0;
      const deltaWords = Math.max(0, (update.wordsRead || prevWords) - prevWords);
      const deltaChars = Math.max(0, (update.charactersRead || prevChars) - prevChars);
      if (deltaWords > 0 || deltaChars > 0) {
        try {
          await fetch(`${USER_SERVICE_URL}/${userId}/profile/words-increment`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-service-token": SERVICE_TOKEN,
            },
            body: JSON.stringify({ contentId, words: deltaWords, characters: deltaChars }),
          });
        } catch (err) {
          // ignore user-service increment failure for now
        }
      }
    } catch (err) {}

    return res;
  }

  public async addBookmark(userId: string, contentId: string, note?: string) {
    if (!userId || !Types.ObjectId.isValid(userId))
      throw new UnauthorizedException("Invalid user id");
    if (!contentId || !Types.ObjectId.isValid(contentId))
      throw new BadRequestException("Invalid content id");

    const obj = {
      userId: new Types.ObjectId(userId),
      contentId: new Types.ObjectId(contentId),
      note: note || null,
    };
    try {
      const created = await Bookmark.create(obj);
      // notify content service
      try {
        await fetch(
          `${CONTENT_SERVICE_URL}/internal/contents/${contentId}/increment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-service-token": SERVICE_TOKEN,
            },
            body: JSON.stringify({ field: "bookmarksCount", by: 1 }),
          }
        );
        // notify user-service to increment user's bookmark aggregate
        try {
          await fetch(
            `${USER_SERVICE_URL}/${userId}/profile/bookmark-increment`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "x-service-token": SERVICE_TOKEN,
              },
              body: JSON.stringify({ contentId, decrement: false }),
            }
          );
        } catch (err) {
          // ignore user-service increment failure for now
        }
      } catch (err) {
        // ignore increment failure for now
      }
      return created;
    } catch (err: any) {
      // duplicate key -> already bookmarked
      if (err.code === 11000) {
        return await Bookmark.findOne({
          userId: obj.userId,
          contentId: obj.contentId,
        }).lean();
      }
      throw err;
    }
  }

  public async removeBookmark(userId: string, contentId: string) {
    if (!userId || !Types.ObjectId.isValid(userId))
      throw new UnauthorizedException("Invalid user id");
    if (!contentId || !Types.ObjectId.isValid(contentId))
      throw new BadRequestException("Invalid content id");

    const res = await Bookmark.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      contentId: new Types.ObjectId(contentId),
    }).lean();
    if (res) {
      try {
        await fetch(
          `${CONTENT_SERVICE_URL}/internal/contents/${contentId}/increment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-service-token": SERVICE_TOKEN,
            },
            body: JSON.stringify({ field: "bookmarksCount", by: -1 }),
          }
        );
        // notify user-service to decrement user's bookmark aggregate
        try {
          await fetch(
            `${USER_SERVICE_URL}/${userId}/profile/bookmark-increment`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "x-service-token": SERVICE_TOKEN,
              },
              body: JSON.stringify({ contentId, decrement: true }),
            }
          );
        } catch (err) {}
      } catch (err) {}
    }
    return res;
  }

  public async listBookmarks(userId: string) {
    if (!userId || !Types.ObjectId.isValid(userId))
      throw new UnauthorizedException("Invalid user id");

    const data = await Bookmark.find({
      userId: new Types.ObjectId(userId),
    }).lean();
    return data;
  }

  public async recordDownload(
    userId: string,
    contentId: string,
    filePath: string,
    deviceInfo?: any
  ) {
    if (!userId || !Types.ObjectId.isValid(userId))
      throw new UnauthorizedException("Invalid user id");
    if (!contentId || !Types.ObjectId.isValid(contentId))
      throw new BadRequestException("Invalid content id");

    const obj = {
      userId: new Types.ObjectId(userId),
      contentId: new Types.ObjectId(contentId),
      filePath,
      deviceInfo: deviceInfo || null,
    };
    try {
      const created = await Download.create(obj);
      try {
        await fetch(
          `${CONTENT_SERVICE_URL}/internal/contents/${contentId}/increment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-service-token": SERVICE_TOKEN,
            },
            body: JSON.stringify({ field: "downloadsCount", by: 1 }),
          }
        );
        // notify user-service to increment user's download aggregate
        try {
          await fetch(
            `${USER_SERVICE_URL}/${userId}/profile/download-increment`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "x-service-token": SERVICE_TOKEN,
              },
              body: JSON.stringify({ contentId, decrement: false }),
            }
          );
        } catch (err) {}
      } catch (err) {}
      return created;
    } catch (err: any) {
      if (err.code === 11000) {
        return await Download.findOne({
          userId: obj.userId,
          contentId: obj.contentId,
        }).lean();
      }
      throw err;
    }
  }
}

export default ReadService;
