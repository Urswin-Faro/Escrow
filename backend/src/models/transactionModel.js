// src/models/transactionModel.js
const { pool } = require('../db');

exports.createTransaction = async (buyer_id, seller_id, amount, description) => {
  const query = `
    INSERT INTO transactions (buyer_id, seller_id, amount, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [buyer_id, seller_id, amount, description];

  const result = await pool.query(query, values);
  return result.rows[0]; // return the created transaction
};
