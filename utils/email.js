// src/utils/email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail", // or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};



export { sendEmail, sendInvoiceEmail };
