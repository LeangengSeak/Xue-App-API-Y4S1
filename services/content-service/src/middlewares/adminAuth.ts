import { Request, Response, NextFunction } from "express";
import { config } from "../config/app.config";
import { UnauthorizedException } from "../shared/utils/catch-errors";

export const requireAdminApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = (req.headers["x-admin-token"] || req.headers["x-api-key"]) as
    | string
    | undefined;
  if (token && config.ADMIN_API_KEY && token === config.ADMIN_API_KEY)
    return next();

  return next(new UnauthorizedException("Invalid admin token"));
};

export default requireAdminApiKey;
