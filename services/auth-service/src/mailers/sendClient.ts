import { createTransport } from "nodemailer";
import { config } from "../config/app.config";

export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});
