const pool = require('../db');

async function createUser(email, hashedPassword) {
  const query = 'INSERT INTO users(email, password) VALUES(?, ?)';
  const values = [email, hashedPassword];
  const [result] = await pool.query(query, values);
  // MySQL returns an object with insertId, not result.rows
  return { id: result.insertId, email: email };
}

async function findUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = ?';
  const [[user]] = await pool.query(query, [email]);
  // The mysql2/promise pool.query returns an array with the rows as the first element
  return user;
}

module.exports = {
  createUser,
  findUserByEmail,
};