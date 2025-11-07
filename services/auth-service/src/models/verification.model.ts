import mongoose, { Schema, Document } from "mongoose";
import { VerificationEnum } from "../shared/enums/verification-code.enum";
import { hashValue } from "../shared/utils/bcrypt";

interface VerificationCodeDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  code: string;
  type: VerificationEnum;
  createdAt: Date;
  expiresAt: Date;
}

const verificationCodeSchema = new Schema<VerificationCodeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    index: true,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

verificationCodeSchema.pre("save", async function (next) {
  if (this.isModified("code")) {
    (this as any).code = await hashValue((this as any).code as string);
  }
  next();
});

const verificationCodeModel = mongoose.model<VerificationCodeDocument>(
  "verificationCode",
  verificationCodeSchema,
  "verification_codes"
);

export default verificationCodeModel;
