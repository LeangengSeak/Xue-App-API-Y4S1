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

// Hash the verification code before saving so only the hash is stored in DB.
verificationCodeSchema.pre("save", async function (next) {
  // `this` is the document being saved
  // Only hash if the code field was set/modified and doesn't look already hashed
  if (this.isModified("code")) {
    // Use a reasonable saltRounds default from the bcrypt helper (it uses 12)
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
