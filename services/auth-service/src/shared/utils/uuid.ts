import { randomInt } from "crypto";

// Generate a cryptographically secure 6-digit numeric code as a string (leading zeros allowed)
export const generateUniqueCode = (): string => {
  const num = randomInt(0, 1_000_000); // 0 .. 999999 (randomInt upper bound is exclusive)
  return String(num).padStart(6, "0");
};
