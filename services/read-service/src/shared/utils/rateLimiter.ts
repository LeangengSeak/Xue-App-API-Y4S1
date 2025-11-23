import createRateLimiter from "../../middlewares/rateLimiter";

// Login
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

// Verify email
export const verifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const email = (req.body && (req.body as any).email) || "";
    return `${req.ip || "no-ip"}:${email.toLowerCase()}`;
  },
});

// Password reset verify
export const passwordVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const email = (req.body && (req.body as any).email) || "";
    return `${req.ip || "no-ip"}:pwreset:${email.toLowerCase()}`;
  },
});
