import { sendEmail } from "../mailers/mailer";
import UserModel from "../models/auth.model";
import { ErrorCode } from "../shared/enums/error-code.enum";
import { VerificationEnum } from "../shared/enums/verification-code.enum";
import { RegisterDto } from "../shared/interfaces/auth.interface";
import {
  BadRequestException,
  InternalServerExecption,
} from "../shared/utils/catch-errors";
import {
  fortyFiveMinutesFromNow,
  oneMinuteAgo,
} from "../shared/utils/date-time";
import verificationCodeModel from "../models/verification.model";
import { generateUniqueCode } from "../shared/utils/uuid";
import { verifyEmailTemplate } from "../mailers/templates/template";

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
        "Too many requests, please try again later in 1 minute",
        ErrorCode.AUTH_TOO_MANY_ATTEMPS
      );

    // generate the plain code to send to the user, and store the hashed code in DB
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

      //   logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      //   logger.error("Error sending verification email:", error);
      throw new InternalServerExecption("Could not send verification email.");
    }
  }
  public async register(registerData: RegisterDto) {
    const { email, password } = registerData;

    const existingUser = await UserModel.exists({ email });

    if (existingUser) {
      throw new BadRequestException(
        "User with this email already exists",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = new UserModel({ email, password });
    await newUser.save();

    await this.sendEmailVerification(newUser.id, newUser.email);
    return { user: newUser };
  }
}
