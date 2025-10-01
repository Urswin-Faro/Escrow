// src/models/passwordResetModel.js
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

// Create OTP token for user
exports.createOtpForUser = async (userId, otp, expiresAt) => {
  try {
    // Delete any existing tokens for this user
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
    
    // Hash the OTP
    const otpHash = await bcrypt.hash(otp, 10);
    
    // Insert new token
    const result = await pool.query(
      'INSERT INTO password_reset_tokens (user_id, otp_hash, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, otpHash, expiresAt]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('createOtpForUser error:', error.message);
    throw error;
  }
};

// Find active token for user
exports.findActiveToken = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE user_id = $1 AND expires_at > NOW()',
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('findActiveToken error:', error.message);
    throw error;
  }
};

// Mark token as used
exports.markTokenUsed = async (tokenId) => {
  try {
    // Since is_used column doesn't exist, we'll delete the token instead
    await pool.query('DELETE FROM password_reset_tokens WHERE id = $1', [tokenId]);
  } catch (error) {
    console.error('markTokenUsed error:', error.message);
    throw error;
  }
};

// FIXED: Use only the columns that exist in your table
exports.createPasswordReset = async (resetData) => {
  const { userId, token, expiresAt } = resetData;
  
  try {
    // Delete any existing reset tokens for this user
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
    
    // Insert new reset token - only use columns that exist
    const result = await pool.query(
      'INSERT INTO password_reset_tokens (user_id, otp_hash, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('createPasswordReset error:', error.message);
    throw error;
  }
};

exports.findValidPasswordReset = async (token) => {
  try {
    // Look for the token in the otp_hash column, only check expiry
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE otp_hash = $1 AND expires_at > NOW()',
      [token]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('findValidPasswordReset error:', error.message);
    throw error;
  }
};

exports.deletePasswordReset = async (userId) => {
  try {
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
  } catch (error) {
    console.error('deletePasswordReset error:', error.message);
    throw error;
  }
};