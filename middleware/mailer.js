import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

export const sendOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Auth System" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "OTP Verification",
    html: `
      <h2>Your OTP</h2>
      <p><b>${otp}</b></p>
      <p>Valid for 10 minutes</p>
    `,
  });
};
