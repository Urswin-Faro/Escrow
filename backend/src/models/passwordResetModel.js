// src/models/passwordResetModel.js
const { pool } = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

exports.createOtpForUser = async (userId, otpPlain, expiresAt) => {
  const otpHash = await bcrypt.hash(otpPlain, SALT_ROUNDS);
  const query = `
    INSERT INTO password_reset_tokens (user_id, otp_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, created_at, expires_at
  `;
  const values = [userId, otpHash, expiresAt];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.findActiveToken = async (userId) => {
  const query = `
    SELECT id, otp_hash, expires_at, used
    FROM password_reset_tokens
    WHERE user_id = $1 AND used = false
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

exports.markTokenUsed = async (tokenId) => {
  const query = `UPDATE password_reset_tokens SET used = true WHERE id = $1`;
  await pool.query(query, [tokenId]);
};