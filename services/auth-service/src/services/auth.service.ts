import { sendEmail } from "../mailers/mailer";
import UserModel from "../models/auth.model";
import { ErrorCode } from "../shared/enums/error-code.enum";
import { VerificationEnum } from "../shared/enums/verification-code.enum";
import {
  LoginDto,
  RegisterDto,
  resetPasswordDto,
} from "../shared/interfaces/auth.interface";
import {
  BadRequestException,
  InternalServerExecption,
  NotFoundException,
  UnauthorizedException,
} from "../shared/utils/catch-errors";
import {
  anHourFromNow,
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
  oneMinuteAgo,
  threeMinutesAgo,
} from "../shared/utils/date-time";
import verificationCodeModel from "../models/verification.model";
import { comparePassword, hashValue } from "../shared/utils/bcrypt";
import { generateUniqueCode } from "../shared/utils/uuid";
import {
  passwordResetTemplate,
  verifyEmailTemplate,
} from "../mailers/templates/template";
import SessionModel from "../models/session.model";
import {
  refreshTokenSignOptions,
  RefreshTPayload,
  signJwtToken,
  verifyJwtToken,
} from "../shared/utils/jwt";
import { config } from "../config/app.config";

export class AuthService {
  private async sendEmailVerification(userId: string, email: string) {
    const timeAgo = oneMinuteAgo();
    const maxAttempts = 1;

    const count = await verificationCodeModel.countDocuments({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      createdAt: { $gt: timeAgo },
    });

    if (count >= maxAttempts)
      throw new BadRequestException(
        "Too many requests. Please try again in 1 minute.",
        ErrorCode.AUTH_TOO_MANY_ATTEMPS
      );

    const plainCode = generateUniqueCode();
    await verificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
      code: plainCode,
    });

    try {
      const result = await sendEmail({
        to: email,
        ...verifyEmailTemplate(plainCode),
      });

      if (!result.messageId) {
        throw new InternalServerExecption(
          `Failed to send verification email to ${email}`
        );
      }
    } catch (error) {
      throw new InternalServerExecption(
        "Unable to send verification email. Please try again later."
      );
    }
  }
  public async register(registerData: RegisterDto) {
    const { email, password } = registerData;

    const existingUser = await UserModel.exists({ email });

    if (existingUser) {
      throw new BadRequestException(
        "A user with this email already exists.",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = new UserModel({ email, password });
    await newUser.save();

    await this.sendEmailVerification(newUser.id, newUser.email);
    return { user: newUser };
  }

  public async login(loginData: LoginDto) {
    const { email, password, userAgent } = loginData;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new BadRequestException(
        "Invalid email or password.",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new BadRequestException(
        "Invalid email or password.",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        "Email address is not verified.",
        ErrorCode.AUTH_EMAIL_NOT_VERIFIED
      );
    }

    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id,
    });

    const refreshToken = signJwtToken(
      { sessionId: session._id },
      refreshTokenSignOptions
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async verifyEmail(email: string, code: string) {
    const user = await UserModel.findOne({ email });
    if (!user)
      throw new BadRequestException(
        "Invalid or expired verification code",
        ErrorCode.AUTH_USER_NOT_FOUND
      );

    const candidates = await verificationCodeModel.find({
      userId: user._id,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: { $gt: new Date() },
    });

    if (!candidates || candidates.length === 0)
      throw new BadRequestException(
        "Invalid or expired verification code.",
        ErrorCode.VALIDATION_ERROR
      );
    console.log(candidates);

    let matched: any = null;
    for (const candidate of candidates) {
      const isMatch = await comparePassword(code, candidate.code);
      if (isMatch) {
        matched = candidate;
        break;
      }
    }

    if (!matched)
      throw new BadRequestException(
        "Invalid or expired verification code.",
        ErrorCode.VALIDATION_ERROR
      );

    const updatedUser = await UserModel.findByIdAndUpdate(
      matched.userId,
      {
        isEmailVerified: true,
      },
      { new: true }
    );

    if (!updatedUser)
      throw new BadRequestException(
        "Unable to verify email.",
        ErrorCode.VALIDATION_ERROR
      );

    await matched.deleteOne();
    return {
      message: "Email verified successfully",
      data: { updatedUser },
    };
  }

  public async resendVerification(email: string) {
    const user = await UserModel.findOne({ email });

    if (!user) throw new BadRequestException("User not found.");

    if (user.isEmailVerified) {
      throw new BadRequestException(
        "Email is already verified",
        ErrorCode.AUTH_EMAIL_VERIFIED
      );
    }

    await this.sendEmailVerification(user.id, user.email);
  }

  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) throw new UnauthorizedException("Invalid refresh token");

    const session = await SessionModel.findById(payload.sessionId);
    const now = Date.now();

    if (!session) throw new UnauthorizedException("Session not found");

    if (session.expiredAt.getTime() < now)
      throw new UnauthorizedException("Session expired");

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      session.expiredAt = calculateExpirationDate(
        config.JWT.REFRESH_EXPIRES_IN
      );
      await session.save();
    }

    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken({ sessionId: session._id }, refreshTokenSignOptions)
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session._id,
    });

    return { accessToken, newRefreshToken };
  }

  public async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });

    if (!user) throw new BadRequestException("user not found");

    const timeAgo = threeMinutesAgo();
    const maxAttempts = 5;

    const count = await verificationCodeModel.countDocuments({
      userId: user._id,
      type: VerificationEnum.PASSWORD_RESET,
      createdAt: { $gt: timeAgo },
    });

    if (count >= maxAttempts)
      throw new BadRequestException(
        "Too many requests. Please try again later.",
        ErrorCode.AUTH_TOO_MANY_ATTEMPS
      );

    const plainCode = generateUniqueCode();
    const expiresAt = anHourFromNow();
    await verificationCodeModel.create({
      userId: user._id,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt,
      code: plainCode,
    });

    const result = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(plainCode),
    });

    if (!result.messageId)
      throw new InternalServerExecption(
        "Failed to send email. Please try again later."
      );

    return;
  }

  public async verifyPasswordResetCode(email: string, code: string) {
    const user = await UserModel.findOne({ email });
    if (!user)
      throw new NotFoundException("Invalid or expired verification code.");

    const candidates = await verificationCodeModel.find({
      userId: user._id,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt: { $gt: new Date() },
    });

    if (!candidates || candidates.length === 0)
      throw new NotFoundException("Invalid or expired verification code.");

    for (const candidate of candidates) {
      const isMatch = await comparePassword(code, candidate.code);
      if (isMatch) {
        return { valid: true };
      }
    }

    throw new NotFoundException("Invalid or expired verification code.");
  }
  public async resetPassword({
    email,
    password,
    verificationCode,
  }: resetPasswordDto) {
    const user = await UserModel.findOne({ email });
    if (!user)
      throw new NotFoundException("Invalid or expired verification code.");

    const candidates = await verificationCodeModel.find({
      userId: user._id,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt: { $gt: new Date() },
    });

    if (!candidates || candidates.length === 0)
      throw new NotFoundException("Invalid or expired verification code.");

    let matched: any = null;
    for (const candidate of candidates) {
      const isMatch = await comparePassword(verificationCode, candidate.code);
      if (isMatch) {
        matched = candidate;
        break;
      }
    }

    if (!matched)
      throw new NotFoundException("Invalid or expired verification code.");

    const hashedPassword = await hashValue(password);

    const updatedUser = await UserModel.findByIdAndUpdate(matched.userId, {
      password: hashedPassword,
    });

    if (!updatedUser)
      throw new BadRequestException("Failed to reset password.");

    await matched.deleteOne();

    await SessionModel.deleteMany({
      userId: updatedUser._id,
    });

    return {
      user: updatedUser,
    };
  }

  public async logout(sessionId: string): Promise<any> {
    if (!sessionId)
      throw new BadRequestException("Session ID is required for logout");

    return await SessionModel.findByIdAndDelete(sessionId);
  }
}
