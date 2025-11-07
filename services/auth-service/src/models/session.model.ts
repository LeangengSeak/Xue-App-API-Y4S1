import mongoose, { Document, Schema } from "mongoose";
import { thirtyDaysFromNow } from "../shared/utils/date-time";

export interface SessionDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  userAgent?: String;
  createdAt: Date;
  expiredAt: Date;
}

const sessionSchema = new Schema<SessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    index: true,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiredAt: {
    type: Date,
    required: true,
    default: thirtyDaysFromNow,
  },
});

const SessionModel = mongoose.model<SessionDocument>("session", sessionSchema);

export default SessionModel;
