import { getEnv } from "../shared/utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  APP_ORIGIN: getEnv("APP_ORIGIN", "http://localhost:3000"),
  SERVICE: {
    AUTH_URL: getEnv("AUTH_URL", "http://localhost:4001"),
    USER_URL: getEnv("USER_URL", "http://localhost:4002"),
    CONTENT_URL: getEnv("CONTENT_URL", "http://localhost:4003"),
    READ_URL: getEnv("READ_URL", "http://localhost:4004"),
    SUBSCRIPTION_URL: getEnv("SUBSCRIPTION_URL", "http://localhost:4005"),
    // PAYMENT_URL: getEnv("PAYMENT_URL", "http://localhost:4006"),
  },
  PORT: getEnv("PORT", "4000"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
});

export const config = appConfig();
