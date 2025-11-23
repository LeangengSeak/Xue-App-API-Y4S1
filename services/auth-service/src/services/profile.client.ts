import axios, { AxiosInstance } from "axios";
import { config } from "../config/app.config";

export class ProfileClient {
  private client: AxiosInstance;

  constructor(baseUrl?: string, serviceToken?: string) {
    this.client = axios.create({
      baseURL: baseUrl || config.USER_SERVICE_URL,
      timeout: 5000,
    });

    // attach x-service-token header for internal calls if available
    if (serviceToken || config.SERVICE_TOKEN) {
      this.client.defaults.headers.common["x-service-token"] =
        serviceToken || config.SERVICE_TOKEN;
    }
  }

  public async getProfileSummary(userId: string) {
    const res = await this.client.get(`/users/${userId}/profile-summary`);
    return res.data?.profile ?? null;
  }
}

export default ProfileClient;
