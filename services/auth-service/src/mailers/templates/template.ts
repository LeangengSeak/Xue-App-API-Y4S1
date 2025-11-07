export const verifyEmailTemplate = (
  code: string,
  brandColor: string = "#2563EB"
) => ({
  subject: "Confirm account",
  text: `Please verify your email address `,
  html: `
     <h1>${code}</h1>
    `,
});

export const passwordResetTemplate = (
  code: string,
  brandColor: string = "#2563EB"
) => ({
  subject: "Reset Your Password",
  text: `To reset your password, please use the following code`,
  html: `
    <h1>${code}</h1>
  `,
});
