import { Request, Response, NextFunction } from "express";
import fetch from "node-fetch";
import { UnauthorizedException } from "../shared/utils/catch-errors";
import { config } from "../config/app.config";

// auth service url (when running inside docker-compose the service name resolves)
const AUTH_SERVICE_URL = config.AUTH_SERVICE_URL || "http://auth-service:4001";

export const requireAdminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = (req.headers["authorization"] ||
    req.headers["Authorization"]) as string | undefined;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedException("Missing or invalid Authorization header")
    );
  }

  try {
    const resp = await fetch(`${AUTH_SERVICE_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) {
      return next(new UnauthorizedException("Invalid or expired token"));
    }

    const payload = await resp.json();
    const user = payload?.data?.user;

    if (!user) return next(new UnauthorizedException("User not found"));

    if (user.roles !== "admin")
      return next(new UnauthorizedException("Admin role required"));

    // attach user to request for downstream handlers
    req.user = user;
    return next();
  } catch (err: any) {
    return next(new UnauthorizedException("Failed to validate token"));
  }
};

export default requireAdminAuth;
