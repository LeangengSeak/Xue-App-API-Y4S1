import { getEnv } from "../shared/utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "4001"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  MONGO_URI: getEnv("MONGO_URI"),
  AUTH_SERVICE_URL: getEnv("AUTH_SERVICE_URL", "http://auth-service:4001"),
  USER_SERVICE_URL: getEnv("USER_SERVICE_URL", "http://user-service:4002"),
  CONTENT_SERVICE_URL: getEnv("CONTENT_SERVICE_URL", "http://content-service:4003"),
  SERVICE_TOKEN: getEnv("SERVICE_TOKEN"),

});

export const config = appConfig();
