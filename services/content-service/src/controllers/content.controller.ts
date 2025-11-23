import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { ContentService } from "../services/content.service";
import { HTTPSTATUS } from "../config/http.config";
import {
  listQuerySchema,
  createContentSchema,
  updateContentSchema,
  incrementSchema,
  batchSchema,
} from "../shared/validators/content.validator";
import { uploadBufferToCloudinary } from "../shared/utils/cloudinary";
import extractAndValidateFile from "../shared/utils/extract-and-validate-file";
import { UploadedFile } from "express-fileupload";
import fs from "fs/promises";

export class ContentController {
  constructor(private contentService: ContentService) {
    this.contentService = contentService;
  }

  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const result = await this.contentService.list(query);
    return res.status(HTTPSTATUS.OK).json(result);
  });

  public getById = asyncHandler(async (req: Request, res: Response) => {
    const contentId = req.params.contentId as string;
    const content = await this.contentService.getById(contentId);
    if (!content)
      return res
        .status(HTTPSTATUS.NOT_FOUND)
        .json({ message: "content_not_found" });
    return res.status(HTTPSTATUS.OK).json({ content });
  });

  public create = asyncHandler(async (req: Request, res: Response) => {
    // Normalize multipart/form-data values which arrive as strings
    const raw: any = req.body || {};

    const parseMaybeJson = (v: any) => {
      if (typeof v !== "string") return v;
      // try to detect JSON arrays/objects
      const trimmed = v.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          return v;
        }
      }
      return v;
    };

    const normalized: any = {};
    Object.keys(raw).forEach((k) => {
      normalized[k] = parseMaybeJson(raw[k]);
    });

    // If a file was uploaded using express-fileupload, extract and upload to Cloudinary
    if ((req as any).files) {
      try {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        const file = extractAndValidateFile(
          "coverImage",
          (req as any).files,
          allowed
        ) as UploadedFile;

        let buffer: Buffer | undefined;
        if ((file as any).tempFilePath) {
          buffer = await fs.readFile((file as any).tempFilePath);
          // try to clean up temp file
          try {
            await fs.unlink((file as any).tempFilePath);
          } catch (e) {
            // ignore
          }
        } else if ((file as any).data) {
          buffer = (file as any).data as Buffer;
        }

        if (buffer) {
          const uploaded = await uploadBufferToCloudinary(buffer, file.name);
          normalized.coverImageUrl =
            uploaded?.secure_url || uploaded?.secureUrl || uploaded?.url;
        }
      } catch (err) {
        // bubble BadRequestException or other errors to global error handler
        throw err;
      }
    }

    const body = createContentSchema.parse(normalized);
    const created = await this.contentService.create(body);
    return res.status(HTTPSTATUS.CREATED).json({ data: created });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const contentId = req.params.contentId as string;

    // Normalize multipart/form-data values which arrive as strings
    const raw: any = req.body || {};

    const parseMaybeJson = (v: any) => {
      if (typeof v !== "string") return v;
      const trimmed = v.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          return v;
        }
      }
      return v;
    };

    const normalized: any = {};
    Object.keys(raw).forEach((k) => {
      normalized[k] = parseMaybeJson(raw[k]);
    });

    // Handle file upload for coverImage if present
    if ((req as any).files) {
      try {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        const file = extractAndValidateFile(
          "coverImage",
          (req as any).files,
          allowed
        ) as any;

        let buffer: Buffer | undefined;
        if ((file as any).tempFilePath) {
          buffer = await fs.readFile((file as any).tempFilePath);
          try {
            await fs.unlink((file as any).tempFilePath);
          } catch (e) {
            // ignore
          }
        } else if ((file as any).data) {
          buffer = (file as any).data as Buffer;
        }

        if (buffer) {
          const uploaded = await uploadBufferToCloudinary(buffer, file.name);
          normalized.coverImageUrl =
            uploaded?.secure_url || uploaded?.secureUrl || uploaded?.url;
        }
      } catch (err) {
        throw err;
      }
    }

    const body = updateContentSchema.parse(normalized);
    const updated = await this.contentService.update(contentId, body);
    return res.status(HTTPSTATUS.OK).json({ data: updated });
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    const contentId = req.params.contentId as string;
    // support query ?force=true for hard delete
    const force = (req.query.force as string) === "true";
    const result = await this.contentService.delete(contentId, force);
    return res.status(HTTPSTATUS.OK).json({ data: result });
  });

  public increment = asyncHandler(async (req: Request, res: Response) => {
    const contentId = req.params.contentId as string;
    const body = incrementSchema.parse(req.body);
    try {
      const updated = await this.contentService.increment(
        contentId,
        body.field,
        body.by || 1
      );
      return res.status(HTTPSTATUS.OK).json({ content: updated });
    } catch (err: any) {
      if (err.message === "invalid_field")
        return res
          .status(HTTPSTATUS.BAD_REQUEST)
          .json({ message: "invalid_field" });
      throw err;
    }
  });

  public batch = asyncHandler(async (req: Request, res: Response) => {
    const { ids, fields } = batchSchema.parse(req.body);
    const data = await this.contentService.batch(ids, fields);
    return res.status(HTTPSTATUS.OK).json({ data });
  });
}

export default ContentController;
