import { Profile } from "../models/user.model";
import { Types } from "mongoose";

export class UserService {
  constructor() {}

  public async getUserById(authUserId: string) {
    // authUserId is stored in profile.authUserId
    return await Profile.findOne({
      authUserId: new Types.ObjectId(authUserId),
    });
  }

  public async createProfile(data: any) {
    const created = await Profile.create(data);
    return created;
  }

  public async updateProfile(authUserId: string, data: any) {
    const updated = await Profile.findOneAndUpdate(
      { authUserId: new Types.ObjectId(authUserId) },
      { $set: data },
      { new: true, upsert: false }
    );
    return updated;
  }

  public async updatePreferences(authUserId: string, prefs: any) {
    const updated = await Profile.findOneAndUpdate(
      { authUserId: new Types.ObjectId(authUserId) },
      { $set: { preferences: prefs } },
      { new: true }
    );
    return updated;
  }

  // New helpers for endpoints requested
  public async getProfileByAuthUserId(authUserId: string) {
    return await Profile.findOne({
      authUserId: new Types.ObjectId(authUserId),
    }).lean();
  }

  public async updateEntitlements(
    authUserId: string,
    subscriptionId: string | undefined,
    entitlements: any
  ) {
    const update: any = {};
    if (subscriptionId)
      update.subscriptionId = new Types.ObjectId(subscriptionId);
    if (entitlements) update.entitlements = entitlements;

    const updated = await Profile.findOneAndUpdate(
      { authUserId: new Types.ObjectId(authUserId) },
      { $set: update },
      { new: true, upsert: true }
    ).lean();

    return updated;
  }

  private capAndUnique(arr: string[] = [], id: string, cap = 20) {
    // remove existing
    const filtered = arr.filter((x) => x !== id);
    filtered.unshift(id);
    if (filtered.length > cap) filtered.length = cap;
    return filtered;
  }

  public async incrementBookmark(
    authUserId: string,
    contentId: string,
    decrement = false
  ) {
    let profile = await Profile.findOne({
      authUserId: new Types.ObjectId(authUserId),
    });
    if (!profile) {
      // create minimal profile if not exists, then continue to apply increment
      profile = await Profile.create({
        authUserId: new Types.ObjectId(authUserId),
      });
    }

    if (decrement) {
      profile.bookmarkedCount = Math.max(0, (profile.bookmarkedCount || 0) - 1);
      profile.recentBookmarked = (profile.recentBookmarked || []).filter(
        (x: any) => x.toString() !== contentId
      );
    } else {
      profile.bookmarkedCount = (profile.bookmarkedCount || 0) + 1;
      profile.recentBookmarked = this.capAndUnique(
        (profile.recentBookmarked || []).map((x: any) => x.toString()),
        contentId
      ).map((s) => new Types.ObjectId(s));
    }

    await profile.save();
    return profile.toObject();
  }

  public async incrementDownload(
    authUserId: string,
    contentId: string,
    decrement = false
  ) {
    let profile = await Profile.findOne({
      authUserId: new Types.ObjectId(authUserId),
    });
    if (!profile) {
      profile = await Profile.create({
        authUserId: new Types.ObjectId(authUserId),
      });
    }

    if (decrement) {
      profile.downloadedCount = Math.max(0, (profile.downloadedCount || 0) - 1);
      profile.recentDownloaded = (profile.recentDownloaded || []).filter(
        (x: any) => x.toString() !== contentId
      );
    } else {
      profile.downloadedCount = (profile.downloadedCount || 0) + 1;
      profile.recentDownloaded = this.capAndUnique(
        (profile.recentDownloaded || []).map((x: any) => x.toString()),
        contentId
      ).map((s) => new Types.ObjectId(s));
    }

    await profile.save();
    return profile.toObject();
  }

  public async incrementMarkRead(authUserId: string, contentId: string) {
    let profile = await Profile.findOne({
      authUserId: new Types.ObjectId(authUserId),
    });
    if (!profile) {
      profile = await Profile.create({
        authUserId: new Types.ObjectId(authUserId),
      });
    }

    // Increment marked read count and also consider this as a completed lesson.
    profile.markedReadCount = (profile.markedReadCount || 0) + 1;
    profile.lessonsCompleted = (profile.lessonsCompleted || 0) + 1;
    profile.recentMarkedRead = this.capAndUnique(
      (profile.recentMarkedRead || []).map((x: any) => x.toString()),
      contentId
    ).map((s) => new Types.ObjectId(s));

    await profile.save();
    return profile.toObject();
  }

  public async incrementWords(
    authUserId: string,
    contentId: string,
    words = 0,
    characters = 0
  ) {
    let profile = await Profile.findOne({
      authUserId: new Types.ObjectId(authUserId),
    });
    if (!profile) {
      profile = await Profile.create({
        authUserId: new Types.ObjectId(authUserId),
      });
    }

    if (typeof words === "number" && words > 0) {
      profile.wordsLearned = (profile.wordsLearned || 0) + words;
    }
    if (typeof characters === "number" && characters > 0) {
      profile.charactersLearned = (profile.charactersLearned || 0) + characters;
    }

    await profile.save();
    return profile.toObject();
  }
}

export default UserService;
