// src/models/userModel.js
const { pool } = require('../db');

exports.createUser = async (email, password, username, role) => {
  const query = `
    INSERT INTO users (email, password, username, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const values = [email, password, username, role];

  const result = await pool.query(query, values);
  return { id: result.rows[0].id };
};

exports.findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

// ✅ Add this function to check if a user exists by ID
exports.findUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
