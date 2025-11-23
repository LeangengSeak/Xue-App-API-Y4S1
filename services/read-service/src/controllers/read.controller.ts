import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import ReadService from "../services/read.service";
import { HTTPSTATUS } from "../config/http.config";
import {
  progressSchema,
  bookmarkSchema,
  downloadSchema,
} from "../shared/validators/read.validator";
import { UnauthorizedException } from "../shared/utils/catch-errors";

const readService = new ReadService();

export class ReadController {
  public getProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing or invalid token");
    const contentId = req.params.contentId as string;
    const data = await readService.getProgress(userId!, contentId);
    return res.status(HTTPSTATUS.OK).json({ data });
  });

  public upsertProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing or invalid token");
    const contentId = req.params.contentId as string;
    const body = progressSchema.parse(req.body);
    const data = await readService.upsertProgress(userId!, contentId, body);
    return res.status(HTTPSTATUS.OK).json({ data });
  });

  public addBookmark = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing or invalid token");
    const body = bookmarkSchema.parse(req.body);
    const data = await readService.addBookmark(
      userId!,
      body.contentId,
      // normalize nullable field to undefined for the service signature
      body.note ?? undefined
    );
    return res.status(HTTPSTATUS.CREATED).json({ data });
  });

  public removeBookmark = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing or invalid token");
    const contentId = req.params.contentId as string;
    const data = await readService.removeBookmark(userId!, contentId);
    return res.status(HTTPSTATUS.OK).json({ data });
  });

  public listBookmarks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing or invalid token");
    const data = await readService.listBookmarks(userId!);
    return res.status(HTTPSTATUS.OK).json({ data });
  });

  public recordDownload = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("Missing or invalid token");
    const body = downloadSchema.parse(req.body);
    const data = await readService.recordDownload(
      userId!,
      body.contentId,
      body.filePath,
      body.deviceInfo ?? undefined
    );
    return res.status(HTTPSTATUS.CREATED).json({ data });
  });
}

export default ReadController;
