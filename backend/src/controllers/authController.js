// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userModel = require('../models/userModel');
const passwordResetModel = require('../models/passwordResetModel');
const { createOtpForUser, findActiveToken, markTokenUsed } = require('../models/passwordResetModel');
const { sendOtpEmail } = require('../services/emailService');

const OTP_TTL_SECONDS = parseInt(process.env.OTP_TTL_SECONDS || '60');

// helper: numeric OTP generator
function generateNumericOtp(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// ----------------- REGISTER -----------------
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create user
    const user = await userModel.createUser(email, password, username);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- LOGIN -----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------- REQUEST PASSWORD RESET -----------------
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(200).json({ 
        message: 'If the email exists, a reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await passwordResetModel.createPasswordReset({
      userId: user.id,
      token: resetToken,
      expiresAt
    });

    // For development - log the reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset URL: http://localhost:5173/reset-password?token=${resetToken}`);

    res.status(200).json({ 
      message: 'If the email exists, a reset link has been sent',
      token: resetToken // Include token in development
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
};

// ----------------- RESET PASSWORD -----------------
exports.resetPassword = async (req, res) => {
  try {
    console.log('Reset password request received:', { 
      body: { 
        token: req.body.token?.substring(0, 10) + '...', 
        hasPassword: !!req.body.newPassword,
        passwordLength: req.body.newPassword?.length 
      } 
    }); // Debug log

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      console.log('Missing required fields:', { hasToken: !!token, hasPassword: !!newPassword }); // Debug log
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Verify token and get user
    console.log('Looking up token in database...'); // Debug log
    const resetRecord = await passwordResetModel.findValidPasswordReset(token);
    console.log('Reset record found:', !!resetRecord); // Debug log
    
    if (!resetRecord) {
      console.log('No valid reset record found for token'); // Debug log
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    console.log('Hashing new password...'); // Debug log
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    console.log('Updating user password for user ID:', resetRecord.user_id); // Debug log
    await userModel.updateUserPassword(resetRecord.user_id, hashedPassword);

    // Delete the reset token
    console.log('Deleting reset token...'); // Debug log
    await passwordResetModel.deletePasswordReset(resetRecord.user_id);

    console.log('Password reset completed successfully'); // Debug log
    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

const registerAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        // Check if admin user already exists
        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create admin user using existing userModel
        const user = await userModel.createUser(email, password, username, 'admin');

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin user'
        });
    }
};

module.exports = {
  register: exports.register,
  login: exports.login,
  requestPasswordReset: exports.requestPasswordReset,
  resetPassword: exports.resetPassword,
  registerAdmin
};