import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
// import { authenticateJWT } from "../shared/strategies/jwt.strategy";
// import { UserService } from "../services/user.service";

const authService = new AuthService();
// const userService = new UserService();
const authController = new AuthController(authService);

const authRoutes = Router();

authRoutes.post("/register", authController.register);
// authRoutes.post("/login", authController.login);
// authRoutes.post("/verify/email", authController.verifyEmail);
// authRoutes.post("/resend-verification", authController.resendVerification);
// authRoutes.post("/password/forgot", authController.forgotPassword);
// authRoutes.post("/password/reset", authController.resetPassword);
// authRoutes.post("/logout", authenticateJWT, authController.logout);

// authRoutes.get("/me", authenticateJWT, authController.getMe);
// authRoutes.post("/refresh", authController.refreshToken);

export default authRoutes;
