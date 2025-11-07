import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthService } from "../services/auth.service";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifictaionEmailSchema,
  passwordVerificationSchema,
  forgotPasswordSchema,
  resendEmailSchema,
} from "../shared/validators/auth.validator";
import { LoginDto } from "../shared/interfaces/auth.interface";
import { HTTPSTATUS } from "../config/http.config";
import { sendError } from "../shared/utils/response";
import { UserService } from "../services/user.service";
import {
  NotFoundException,
  UnauthorizedException,
} from "../shared/utils/catch-errors";

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    this.authService = authService;
    this.userService = userService;
  }
  public register = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = registerSchema.parse({ ...req.body });
      const user = await this.authService.register(body);

      return res.status(HTTPSTATUS.CREATED).json({
        status: "success",
        message: "Registration successful",
        data: user,
      });
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userAgent = req.headers["user-agent"];
      const body = loginSchema.parse({ ...req.body, userAgent }) as LoginDto;

      const { user, accessToken, refreshToken } = await this.authService.login(
        body
      );

      if (!accessToken || !refreshToken)
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          status: "success",
          message: "Invalid credentials",
        });

      return res.status(HTTPSTATUS.OK).json({
        status: "success",
        message: "Login successful",
        data: { user, tokens: { accessToken, refreshToken } },
      });
    }
  );

  public verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { email, code } = verifictaionEmailSchema.parse(req.body);

      await this.authService.verifyEmail(email, code);

      return res
        .status(HTTPSTATUS.OK)
        .json({ status: "success", message: "Email verified" });
    }
  );

  public verifyResetCode = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { email, code } = passwordVerificationSchema.parse(req.body);

      await this.authService.verifyPasswordResetCode(email, code);

      return res
        .status(HTTPSTATUS.OK)
        .json({ status: "success", message: "Verification code is valid" });
    }
  );

  public resendVerification = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { email } = resendEmailSchema.parse(req.body);

      await this.authService.resendVerification(email);

      return res
        .status(HTTPSTATUS.OK)
        .json({ status: "success", message: "Verification email sent" });
    }
  );

  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const refreshToken = req.headers["x-refresh-token"] as string | undefined;

      if (!refreshToken)
        throw new UnauthorizedException("Refresh token is missing");

      const { accessToken, newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      return res.status(HTTPSTATUS.OK).json({
        status: "success",
        message: "Tokens refreshed successfully",
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
          },
        },
        hint: "rotate",
      });
    }
  );

  public forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { email } = forgotPasswordSchema.parse(req.body);

      await this.authService.forgotPassword(email);

      return res
        .status(HTTPSTATUS.OK)
        .json({ status: "success", message: "OTP sent to your email" });
    }
  );

  public resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = resetPasswordSchema.parse(req.body);

      await this.authService.resetPassword(body);

      return res
        .status(HTTPSTATUS.OK)
        .json({ status: "success", message: "Password reset successful" });
    }
  );

  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId;

      if (!sessionId) throw new NotFoundException("Session is invalid.");

      await this.authService.logout(sessionId);

      return res
        .status(HTTPSTATUS.OK)
        .json({ status: "success", message: "Logout successful" });
    }
  );

  public getMe = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req.user?.id;

      if (!userId) throw new NotFoundException("User not found");

      const user = await this.userService.getUserById(userId);

      return res
        .status(HTTPSTATUS.OK)
        .json({ status: "success", message: "User retrieved", data: user });
    }
  );
}
