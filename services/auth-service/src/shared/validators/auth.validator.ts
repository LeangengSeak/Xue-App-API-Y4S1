import { z } from "zod";

export const emailSchema = z.string().trim().email().min(1).max(255);
export const passwordSchema = z.string().trim().min(8).max(255);

export const verificationCodeSchema = z.string().trim().min(1).max(6);

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    userAgent: z.string().optional(),
  })
  .strict();

export const verifictaionEmailSchema = z
  .object({
    email: emailSchema,
    code: verificationCodeSchema,
  })
  .strict();
export const resendEmailSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const passwordVerificationSchema = z
  .object({
    email: emailSchema,
    code: verificationCodeSchema,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    verificationCode: verificationCodeSchema,
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .strict();
