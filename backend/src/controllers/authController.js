// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userModel = require('../models/userModel');
const { createOtpForUser, findActiveToken, markTokenUsed } = require('../models/passwordResetModel');
const { sendOtpEmail } = require('../services/emailService');

const OTP_TTL_SECONDS = parseInt(process.env.OTP_TTL_SECONDS || '60');

// helper: numeric OTP generator
function generateNumericOtp(length = 6) {
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(length, '0');
}

// ----------------- REGISTER -----------------
exports.register = async (req, res) => {
  // Use 'username' if provided, otherwise fallback to 'name', otherwise fallback to email prefix
  const { username, name, email, password, role } = req.body;
  const finalUsername = username || name || (email ? email.split('@')[0] : 'user');

  try {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.createUser(email, hashedPassword, finalUsername, role);

    const payload = { user: { id: newUser.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).send('Server Error');
  }
};

// ----------------- LOGIN -----------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).send('Server Error');
  }
};

// ----------------- REQUEST PASSWORD RESET (send OTP) -----------------
// POST /auth/forgot-password
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      // matches your spec: show red error "email not valid"
      return res.status(404).json({ error: 'Email not found. Please register or try logging in.' });
    }

    const otp = generateNumericOtp(6);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    // store hashed OTP
    await createOtpForUser(user.id, otp, expiresAt);

    // send OTP via email or dev fallback
    const mailResult = await sendOtpEmail(user.email, otp, OTP_TTL_SECONDS);

    // DEV fallback: returns OTP so local testing is immediate (only when USE_EMAIL !== 'true')
    if (process.env.USE_EMAIL !== 'true' && mailResult && mailResult.dev) {
      return res.json({ message: 'OTP generated (dev). Check server console or response.', devOtp: mailResult.otp, ttl: OTP_TTL_SECONDS });
    }

    return res.json({ message: 'OTP sent to your email', ttl: OTP_TTL_SECONDS });
  } catch (err) {
    console.error('requestPasswordReset error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ----------------- RESET PASSWORD (verify OTP & change password) -----------------
// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    if (!email || !newPassword || !otp) return res.status(400).json({ error: 'Email, OTP and new password are required' });

    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Invalid request' });

    const tokenRow = await findActiveToken(user.id);
    if (!tokenRow) return res.status(400).json({ error: 'No active OTP. Request a new one.' });

    if (new Date(tokenRow.expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Request a new one.' });
    }

    const match = await bcrypt.compare(otp, tokenRow.otp_hash);
    if (!match) return res.status(401).json({ error: 'Invalid OTP' });

    // mark used and update password (userModel.updateUserPassword hashes it)
    await markTokenUsed(tokenRow.id);
    await userModel.updateUserPassword(user.id, newPassword);

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};