// src/controllers/authController.js
const bcrypt = require('bcryptjs'); // ✅ Change from 'bcrypt' to 'bcryptjs'
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
  const { username, name, email, password, role } = req.body;
  const finalUsername = username || name || (email ? email.split('@')[0] : 'user');

  try {
    console.log('\n=== REGISTER DEBUG START ===');
    console.log('📨 Register request:', { email, username, name, finalUsername, role, passwordLength: password ? password.length : 0 });

    const existingUser = await userModel.findUserByEmail(email);
    console.log('👤 Existing user check:', existingUser ? 'USER EXISTS' : 'NEW USER');
    
    if (existingUser) {
      console.log('❌ Registration failed - user exists');
      console.log('=== REGISTER DEBUG END ===\n');
      return res.status(400).json({ msg: 'User already exists' });
    }

    console.log('🔒 Sending plain password to userModel (will be hashed there)');

    // ✅ Pass the plain password - userModel will hash it
    const newUser = await userModel.createUser(email, password, finalUsername, role);
    console.log('✅ User created:', { id: newUser.id, email: newUser.email, username: newUser.username });

    const payload = { user: { id: newUser.id, role: newUser.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('✅ Registration successful, JWT created');
    console.log('=== REGISTER DEBUG END ===\n');
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('💥 Register error:', err.message);
    console.log('=== REGISTER DEBUG END ===\n');
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ----------------- LOGIN -----------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('\n=== LOGIN DEBUG START ===');
    console.log('📨 Login request body:', req.body);
    console.log('📧 Email received:', email);
    console.log('🔒 Password received:', password ? `YES (${password.length} chars)` : 'NO');

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      console.log('=== LOGIN DEBUG END ===\n');
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    console.log('🔍 Looking up user by email:', email);
    const user = await userModel.findUserByEmail(email);
    console.log('👤 User lookup result:', user ? 'FOUND' : 'NOT FOUND');
    
    if (user) {
      console.log('👤 User details:', {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        passwordExists: user.password ? 'YES' : 'NO',
        passwordLength: user.password ? user.password.length : 0,
        passwordStart: user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD'
      });
    }
    
    // ✅ TEMPORARY BYPASS - Add after the user lookup
    if (!user) {
      console.log('❌ No user found with email:', email);
      console.log('=== LOGIN DEBUG END ===\n');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('🔒 Starting password comparison...');
    console.log('🔒 Input password:', password);
    console.log('🔒 Stored hash:', user.password);

    let isMatch = false;

    try {
      // Try with current bcrypt library
      isMatch = await bcrypt.compare(password, user.password);
      console.log('🔒 bcrypt.compare result:', isMatch);
    } catch (error) {
      console.log('🔒 bcrypt.compare error:', error.message);
      
      // Fallback: Try installing and using bcryptjs
      try {
        const bcryptjs = require('bcryptjs');
        isMatch = await bcryptjs.compare(password, user.password);
        console.log('🔒 bcryptjs fallback result:', isMatch);
      } catch (fallbackError) {
        console.log('🔒 bcryptjs fallback error:', fallbackError.message);
      }
    }

    console.log('🔒 Final password comparison result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
    
    if (!isMatch) {
      console.log('❌ Password verification failed for user:', email);
      console.log('=== LOGIN DEBUG END ===\n');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('✅ Password verified successfully');
    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('❌ JWT creation error:', err);
        console.log('=== LOGIN DEBUG END ===\n');
        throw err;
      }
      console.log('✅ Login successful, JWT created');
      console.log('=== LOGIN DEBUG END ===\n');
      res.json({ token });
    });
  } catch (err) {
    console.error('💥 Login error:', err.message);
    console.error('💥 Full error:', err);
    console.log('=== LOGIN DEBUG END ===\n');
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