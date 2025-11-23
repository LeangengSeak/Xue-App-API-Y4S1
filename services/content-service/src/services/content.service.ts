import { Content } from "../models/content.model";
import { Types } from "mongoose";

export class ContentService {
  constructor() {}

  public async list(query: any) {
    const { ids, featured, q, page = 0, limit = 20 } = query;

    const filter: any = { status: "published" };

    if (ids) {
      const idArray = (ids as string)
        .split(",")
        .map((s) => new Types.ObjectId(s));
      filter._id = { $in: idArray };
    }

    if (featured) filter.starred = true;

    let cursor = Content.find(filter).select(
      "title coverImageUrl difficulty readTimeMins access requiredPlanSlug"
    );

    if (q) {
      cursor = Content.find({ $text: { $search: q }, ...filter }).select(
        "title coverImageUrl difficulty readTimeMins access requiredPlanSlug"
      );
    }

    const total = await Content.countDocuments(filter);
    const data = await cursor
      .skip(page * limit)
      .limit(limit)
      .lean();

    return { data, meta: { total, page, limit } };
  }

  public async getById(contentId: string) {
    const content = await Content.findById(contentId).lean();
    return content;
  }

  public async create(payload: any) {
    // compute wordsCount/characters and readTime for lessons
    const lessons = (payload.lessons || []).map((lesson: any) => {
      const body = lesson.body || "";
      const words = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
      const chars = body.length || 0;
      const estimatedReadTimeMins = Math.max(1, Math.round(words / 200));
      return {
        ...lesson,
        wordsCount: words,
        charactersCount: chars,
        estimatedReadTimeMins,
      };
    });

    const readTimeMins = lessons.reduce(
      (acc: number, l: any) => acc + (l.estimatedReadTimeMins || 0),
      0
    );

    const created = await Content.create({ ...payload, lessons, readTimeMins });
    return created;
  }

  public async increment(contentId: string, field: string, by = 1) {
    const allowed = [
      "bookmarksCount",
      "downloadsCount",
      "views",
      "completionsCount",
    ];
    if (!allowed.includes(field)) throw new Error("invalid_field");

    const updated = await Content.findByIdAndUpdate(
      contentId,
      { $inc: { [field]: by } },
      { new: true }
    ).lean();

    return updated;
  }

  public async batch(ids: string[], fields?: string[]) {
    const projection: any = {};
    if (fields && fields.length > 0) {
      fields.forEach((f) => (projection[f] = 1));
    }

    const objectIds = ids.map((s) => new Types.ObjectId(s));
    const data = await Content.find({ _id: { $in: objectIds } })
      .select(projection)
      .lean();
    return data;
  }

  public async update(contentId: string, payload: any) {
    // If lessons provided, recompute words/characters and read time for those lessons
    let updatePayload: any = { ...payload };

    if (payload.lessons) {
      const lessons = (payload.lessons || []).map((lesson: any) => {
        const body = lesson.body || "";
        const words = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
        const chars = body.length || 0;
        const estimatedReadTimeMins = Math.max(1, Math.round(words / 200));
        return {
          ...lesson,
          wordsCount: words,
          charactersCount: chars,
          estimatedReadTimeMins,
        };
      });

      const readTimeMins = lessons.reduce(
        (acc: number, l: any) => acc + (l.estimatedReadTimeMins || 0),
        0
      );

      updatePayload = { ...updatePayload, lessons, readTimeMins };
    }

    const updated = await Content.findByIdAndUpdate(
      contentId,
      { $set: updatePayload },
      { new: true }
    ).lean();

    return updated;
  }

  /**
   * Soft-delete or hard-delete a content item.
   * If force is true, performs a hard delete from DB. Otherwise marks status = 'archived'.
   */
  public async delete(contentId: string, force = false) {
    if (force) {
      const res = await Content.findByIdAndDelete(contentId).lean();
      return res;
    }

    const updated = await Content.findByIdAndUpdate(
      contentId,
      { $set: { status: "archived" } },
      { new: true }
    ).lean();

    return updated;
  }
}

export default ContentService;
