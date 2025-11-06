import { getEnv } from "../shared/utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  APP_ORIGIN: getEnv("APP_ORIGIN", "http://localhost:3000"),
  SERVICE: {
    AUTH_URL: getEnv("AUTH_URL", "http://localhost:4001"),
    USER_URL: getEnv("USER_URL", "http://localhost:4002"),
  },
  PORT: getEnv("PORT", "4000"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  // JWT: {
  //   SECRET: getEnv("JWT_SECRET"),
  //   EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"),
  //   REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  //   REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  // },
  // MAILER_SENDER: getEnv("MAILER_SENDER"),
  // SENDING_EMAIL_ADDRESS: getEnv("SENDING_EMAIL_ADDRESS"),
  // SENDING_EMAIL_PASSWORD: getEnv("SENDING_EMAIL_PASSWORD"),
  // CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  // CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  // CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
});

export const config = appConfig();
