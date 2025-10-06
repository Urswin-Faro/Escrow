// src/models/transactionModel.js
const { pool } = require("../db");

exports.createTransaction = async (
  buyer_id,
  seller_id,
  amount,
  description
) => {
  const query = `
        INSERT INTO transactions (buyer_id, seller_id, amount, description, status)
        VALUES ($1, $2, $3, $4, 'pending_payment')
        RETURNING *;
    `;
  const values = [buyer_id, seller_id, amount, description];

  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.findTransactionsByBuyer = async (buyerId) => {
  const query = `
        SELECT * FROM transactions 
        WHERE buyer_id = $1 
        ORDER BY created_at DESC;
    `;
  const result = await pool.query(query, [buyerId]);
  return result.rows;
};

exports.findTransactionsBySeller = async (sellerId) => {
  const query = `
        SELECT * FROM transactions 
        WHERE seller_id = $1 
        ORDER BY created_at DESC;
    `;
  const result = await pool.query(query, [sellerId]);
  return result.rows;
};

exports.findTransactionById = async (transactionId) => {
  const query = "SELECT * FROM transactions WHERE id = $1;";
  const result = await pool.query(query, [transactionId]);
  return result.rows[0];
};
