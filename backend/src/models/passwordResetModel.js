// src/models/passwordResetModel.js
const bcrypt = require('bcryptjs'); // ✅ Change from 'bcrypt' to 'bcryptjs'
const { pool } = require('../db');

// Create OTP token for user
exports.createOtpForUser = async (userId, otp, expiresAt) => {
  try {
    // Delete any existing tokens for this user
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);

    // Hash the OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // Insert new token
    const query = `
      INSERT INTO password_reset_tokens (user_id, otp_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const values = [userId, otpHash, expiresAt];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('createOtpForUser error:', error.message);
    throw error;
  }
};

// Find active token for user
exports.findActiveToken = async (userId) => {
  try {
    const query = `
      SELECT * FROM password_reset_tokens 
      WHERE user_id = $1 AND used = FALSE 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('findActiveToken error:', error.message);
    throw error;
  }
};

// Mark token as used
exports.markTokenUsed = async (tokenId) => {
  try {
    const query = 'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1';
    await pool.query(query, [tokenId]);
  } catch (error) {
    console.error('markTokenUsed error:', error.message);
    throw error;
  }
};