export interface RegisterDto {
  email: string;
  password: string;
  userAgent?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  userAgent?: string;
}

export interface resetPasswordDto {
  password: string;
  verificationCode: string;
}
