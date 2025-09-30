// src/services/emailService.js
require('dotenv').config();

let sendOtpEmail;

if (process.env.USE_EMAIL === 'true') {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  sendOtpEmail = async (to, otp, ttlSeconds) => {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `Escrow <no-reply@localhost>`,
      to,
      subject: 'Your OTP for Escrow Service',
      text: `Your OTP is ${otp}. It is valid for ${ttlSeconds} seconds.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. Valid for ${ttlSeconds} seconds.</p>`
    };
    return transporter.sendMail(mailOptions);
  };
} else {
  // DEV fallback — logs OTP and returns it in response (do NOT use in production)
  sendOtpEmail = async (to, otp, ttlSeconds) => {
    console.log(`[DEV OTP] ${to} -> ${otp} (valid ${ttlSeconds}s)`);
    return { dev: true, otp };
  };
}

module.exports = { sendOtpEmail };
