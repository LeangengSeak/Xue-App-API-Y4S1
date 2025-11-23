import { getEnv } from "../shared/utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "4001"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  AUTH_SERVICE_URL: getEnv("AUTH_SERVICE_URL", "http://auth-service:4001"),
  MONGO_URI: getEnv("MONGO_URI"),
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
  SERVICE_TOKEN: getEnv("SERVICE_TOKEN"),
  ADMIN_API_KEY: getEnv("ADMIN_API_KEY"),
});

export const config = appConfig();
