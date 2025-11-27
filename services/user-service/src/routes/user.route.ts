import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import requireAuth, { requireAuthOptional } from "../middlewares/requireAuth";
import { requireServiceToken } from "../middlewares/xServiceAuth";

const userService = new UserService();
const userController = new UserController(userService);

const userRoutes = Router();

// Create profile (could be used by other services)
userRoutes.post("/profile", userController.createProfile);

// Public / client-facing endpoints (token-based, do NOT accept userId param)
// GET current authenticated user's profile summary
userRoutes.get("/profile", requireAuth, userController.getMyProfile);

// PATCH current authenticated user's profile (update own profile)
userRoutes.patch("/profile", requireAuth, userController.updateProfile);

// GET entitlements for current user (optional auth)
userRoutes.get(
  "/profile/entitlements",
  requireAuthOptional,
  userController.getMyEntitlements
);

// Internal endpoints (protected by x-service-token)
userRoutes.patch(
  "/:userId/profile/entitlements",
  requireServiceToken,
  userController.updateEntitlements
);

userRoutes.patch(
  "/:userId/profile/bookmark-increment",
  requireServiceToken,
  userController.bookmarkIncrement
);

userRoutes.patch(
  "/:userId/profile/download-increment",
  requireServiceToken,
  userController.downloadIncrement
);

userRoutes.patch(
  "/:userId/profile/markread-increment",
  requireServiceToken,
  userController.markreadIncrement
);

userRoutes.patch(
  "/:userId/profile/words-increment",
  requireServiceToken,
  userController.wordsIncrement
);

export default userRoutes;
