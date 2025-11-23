// import passport, { PassportStatic } from "passport";
// import {
//   Strategy as JwtStrategy,
//   ExtractJwt,
//   StrategyOptionsWithRequest,
// } from "passport-jwt";
// import { UnauthorizedException } from "../utils/catch-errors";
// import { ErrorCode } from "../enums/error-code.enum";
// import { config } from "../../config/app.config";
// import { UserService } from "../../services/user.service";
// import { NextFunction, Request, Response } from "express";

// const userService = new UserService();

// interface JwtPayload {
//   userId: string;
//   sessionId: string;
// }

// type PassportAuthCallback = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => void;

// const options: StrategyOptionsWithRequest = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: config.JWT.SECRET,
//   // audience: ["user"],
//   algorithms: ["HS256"],
//   passReqToCallback: true,
// };

// export const setupJwtStrategy = (passport: PassportStatic) => {
//   passport.use(
//     new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
//       try {
//         const user = await userService.getUserById(payload.userId);
//         if (!user) return done(null, false);

//         req.sessionId = payload.sessionId;

//         return done(null, user);
//       } catch (error) {
//         return done(error, false);
//       }
//     })
//   );
// };

// export const authenticateJWT: PassportAuthCallback = (req, res, next) => {
//   passport.authenticate(
//     "jwt",
//     { session: false },
//     (err: Error | null, user: Express.User | null | false, info: any) => {
//       if (err) {
//         return next(err);
//       }

//       if (!user) {
//         return next(
//           new UnauthorizedException(
//             "Invalid or missing access token",
//             ErrorCode.AUTH_TOKEN_NOT_FOUND
//           )
//         );
//       }

//       req.user = user;
//       next();
//     }
//   )(req, res, next);
// };
