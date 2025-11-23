import passport, { PassportStatic } from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptionsWithRequest,
} from "passport-jwt";
import { UnauthorizedException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";
import { config } from "../../config/app.config";
import { UserService } from "../../services/user.service";
import { NextFunction, Request, Response } from "express";
import SessionModel from "../../models/session.model";

const userService = new UserService();

interface JwtPayload {
  userId: string;
  sessionId: string;
}

type PassportAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT.SECRET,
  // audience: ["user"],
  algorithms: ["HS256"],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
      try {
        const user = await userService.getUserById(payload.userId);
        if (!user) return done(null, false);

        // Verify the session still exists and is not expired. This ensures logout
        // (which deletes the session) immediately invalidates access tokens.
        const session = await SessionModel.findById(payload.sessionId).lean();
        if (!session) return done(null, false);

        if (session.expiredAt && session.expiredAt.getTime() < Date.now()) {
          // Optionally cleanup expired session
          try {
            await SessionModel.findByIdAndDelete(payload.sessionId as any);
          } catch (e) {
            // ignore cleanup errors
          }
          return done(null, false);
        }

        req.sessionId = payload.sessionId;

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export const authenticateJWT: PassportAuthCallback = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: Error | null, user: Express.User | null | false, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(
          new UnauthorizedException(
            "Invalid or missing access token",
            ErrorCode.AUTH_TOKEN_NOT_FOUND
          )
        );
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};
