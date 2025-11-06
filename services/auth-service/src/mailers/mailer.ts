import { transporter } from "./sendClient";

type Params = {
  to: string | string[];
  from?: string;
  subject: string;
  text: string;
  html: string;
};

export const sendEmail = async ({ to, from, subject, text, html }: Params) => {
  try {
    const info = await transporter.sendMail({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
