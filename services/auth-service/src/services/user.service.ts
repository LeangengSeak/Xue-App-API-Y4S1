import UserModel from "../models/auth.model";
import { BadRequestException } from "../shared/utils/catch-errors";

export class UserService {
  public async getUserById(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }
    return user || null;
  }
}
