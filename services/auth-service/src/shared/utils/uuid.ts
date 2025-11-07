import { randomInt } from "crypto";

export const generateUniqueCode = (): string => {
  const num = randomInt(0, 1_000_000);
  return String(num).padStart(6, "0");
};
