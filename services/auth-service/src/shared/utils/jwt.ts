import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { SessionDocument } from "../../models/session.model";
import { UserDocument } from "../../models/auth.model";
import { config } from "../../config/app.config";

export type AccessTPayload = {
  userId: string;
  sessionId: string;
};

export type RefreshTPayload = {
  sessionId: string;
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};

export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT.EXPIRES_IN as `${number}${"m"}`,
  secret: config.JWT.SECRET,
};

export const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT.REFRESH_EXPIRES_IN as `${number}${"d"}`,
  secret: config.JWT.REFRESH_SECRET,
};

export const signJwtToken = (
  payload: AccessTPayload | RefreshTPayload,
  options?: SignOptsAndSecret
) => {
  const { secret, ...opts } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, opts);
};

export const verifyJwtToken = <TPayload extends object = AccessTPayload>(
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  try {
    const { secret = config.JWT.SECRET, ...opts } = options || {};
    const payload = jwt.verify(token, secret, opts) as TPayload;
    return { payload };
  } catch (err: any) {
    return {
      error: err.message,
    };
  }
};
