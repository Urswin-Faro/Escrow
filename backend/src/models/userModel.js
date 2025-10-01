// src/models/userModel.js
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

exports.createUser = async (email, password, username, role = 'user') => {
  try {
    const hashed = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, password, username, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, username, role
    `;
    const values = [email, hashed, username, role];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('createUser error:', error.message);
    if (error.code === '23505') {
      throw new Error('Email or username already exists');
    }
    throw error;
  }
};

exports.findUserByEmail = async (email) => {
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('findUserByEmail error:', error.message);
    throw error;
  }
};

exports.findUserById = async (id) => {
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('findUserById error:', error.message);
    throw error;
  }
};

exports.updateUserPassword = async (userId, hashedPassword) => {
  try {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username, email',
    [hashedPassword, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  return result.rows[0];
} catch (error) {
  console.error('updateUserPassword error:', error.message);
  throw error;
  }
};

