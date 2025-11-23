import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { ProfileClient } from "../services/profile.client";
import {
  loginLimiter,
  verifyLimiter,
  passwordVerifyLimiter,
} from "../shared/utils/rateLimiter";
import { authenticateJWT } from "../shared/strategies/jwt.strategy";

const authService = new AuthService();
const userService = new UserService();
const profileClient = new ProfileClient();
const authController = new AuthController(
  authService,
  userService,
  profileClient
);

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", loginLimiter, authController.login);
authRoutes.post("/verify/email", verifyLimiter, authController.verifyEmail);
authRoutes.post("/resend-verification", authController.resendVerification);
authRoutes.post("/password/forgot", authController.forgotPassword);
authRoutes.post(
  "/password/verify",
  passwordVerifyLimiter,
  authController.verifyResetCode
);
authRoutes.put("/password/reset", authController.resetPassword);
authRoutes.delete("/logout", authenticateJWT, authController.logout);

authRoutes.get("/me", authenticateJWT, authController.getMe);
authRoutes.post("/refresh", authController.refreshToken);

export default authRoutes;
