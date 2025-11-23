import { Request, Response, NextFunction } from "express";
import { config } from "../config/app.config";
import { UnauthorizedException } from "../shared/utils/catch-errors";

export const requireServiceToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["x-service-token"] as string | undefined;

  if (!token || token !== config.SERVICE_TOKEN) {
    return next(new UnauthorizedException("Invalid service token"));
  }

  return next();
};

export default requireServiceToken;
