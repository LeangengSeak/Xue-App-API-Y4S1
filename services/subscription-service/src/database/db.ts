import mongoose from "mongoose";
import { config } from "../config/app.config";

const connectionDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectionDatabase;
