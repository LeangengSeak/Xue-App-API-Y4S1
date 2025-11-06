import mongoose, { Document, Schema } from "mongoose";
import { comparePassword, hashValue } from "../shared/utils/bcrypt";

export interface UserDocument extends Document {
  email: string;
  password: string;
  isEmailVerified: boolean;
  roles: string;
  createdAt: Date;
  updatedAt: Date;
  // Method
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {},
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashValue(this.password);
  }
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return await comparePassword(password, this.password);
};

userSchema.set("toJSON", {
  transform: (doc: Document, ret: any) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
