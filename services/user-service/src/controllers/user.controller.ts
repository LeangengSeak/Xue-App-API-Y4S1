import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { UserService } from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import {
  createProfileSchema,
  updateProfileSchema,
  updatePreferencesSchema,
  updateEntitlementsSchema,
  incrementSchema,
  markReadSchema,
} from "../shared/validators/user.validator";

export class UserController {
  constructor(private userService: UserService) {
    this.userService = userService;
  }
  public getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        status: "error",
        message: "User not found",
      });
    }

    const profile = await this.userService.getProfileByAuthUserId(userId);

    return res.status(HTTPSTATUS.OK).json({
      profile: {
        authUserId: profile?.authUserId,
        lessonsCompleted: profile?.lessonsCompleted || 0,
        wordsLearned: profile?.wordsLearned || 0,
        bookmarkedCount: profile?.bookmarkedCount || 0,
        downloadedCount: profile?.downloadedCount || 0,
        entitlements: profile?.entitlements || { active: false },
      },
    });
  });

  public getMyEntitlements = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id || (req.user as any)?._id;
      if (!userId) {
        return res.status(HTTPSTATUS.NOT_FOUND).json({
          status: "error",
          message: "User not found",
        });
      }

      const profile = await this.userService.getProfileByAuthUserId(userId);

      return res.status(HTTPSTATUS.OK).json({
        entitlements: profile?.entitlements || {
          active: false,
          planSlug: null,
          expiresAt: null,
        },
      });
    }
  );
  public createProfile = asyncHandler(async (req: Request, res: Response) => {
    const body = createProfileSchema.parse({ ...req.body });
    const profile = await this.userService.createProfile(body);
    return res.status(HTTPSTATUS.CREATED).json({
      status: "success",
      message: "Profile created",
      data: profile,
    });
  });

  public updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        status: "error",
        message: "User not found",
      });
    }

    const body = updateProfileSchema.parse({ ...req.body });
    const updated = await this.userService.updateProfile(
      userId as string,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      status: "success",
      message: "Profile updated",
      data: updated,
    });
  });

  public updatePreferences = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id || (req.user as any)?._id;
      if (!userId) {
        return res.status(HTTPSTATUS.NOT_FOUND).json({
          status: "error",
          message: "User not found",
        });
      }

      const prefs = updatePreferencesSchema.parse({ ...req.body });
      const updated = await this.userService.updatePreferences(
        userId as string,
        prefs
      );

      return res.status(HTTPSTATUS.OK).json({
        status: "success",
        message: "Preferences updated",
        data: updated,
      });
    }
  );

  public getProfileSummary = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.userId as string;

      const profile = await this.userService.getProfileByAuthUserId(userId);

      return res.status(HTTPSTATUS.OK).json({
        profile: {
          authUserId: profile?.authUserId,
          lessonsCompleted: profile?.lessonsCompleted || 0,
          wordsLearned: profile?.wordsLearned || 0,
          bookmarkedCount: profile?.bookmarkedCount || 0,
          downloadedCount: profile?.downloadedCount || 0,
          entitlements: profile?.entitlements || { active: false },
        },
      });
    }
  );

  public getEntitlements = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const profile = await this.userService.getProfileByAuthUserId(userId);

    return res.status(HTTPSTATUS.OK).json({
      entitlements: profile?.entitlements || {
        active: false,
        planSlug: null,
        expiresAt: null,
      },
    });
  });

  public updateEntitlements = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.userId as string;
      const parsed = updateEntitlementsSchema.parse(req.body);

      const updated = await this.userService.updateEntitlements(
        userId,
        parsed.subscriptionId,
        parsed.entitlements
      );

      return res.status(HTTPSTATUS.OK).json({ profile: updated });
    }
  );

  public bookmarkIncrement = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.userId as string;
      const { contentId, decrement } = incrementSchema.parse(req.body);

      const updated = await this.userService.incrementBookmark(
        userId,
        contentId,
        !!decrement
      );

      return res.status(HTTPSTATUS.OK).json({ profile: updated });
    }
  );

  public downloadIncrement = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.userId as string;
      const { contentId, decrement } = incrementSchema.parse(req.body);

      const updated = await this.userService.incrementDownload(
        userId,
        contentId,
        !!decrement
      );

      return res.status(HTTPSTATUS.OK).json({ profile: updated });
    }
  );

  public markreadIncrement = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.userId as string;
      const { contentId } = markReadSchema.parse(req.body);

      const updated = await this.userService.incrementMarkRead(
        userId,
        contentId
      );

      return res.status(HTTPSTATUS.OK).json({ profile: updated });
    }
  );
}
