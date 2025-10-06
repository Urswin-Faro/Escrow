// src/routes/transactionRoutes.js
const express = require("express");
const {
  createTransaction,
  getBuyerTransactions, // New Import
  getSellerTransactions, // New Import
  getTransactionDetails, // New Import
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware"); // NEW REQUIREMENT

const router = express.Router();

// All routes here should be protected (require a valid JWT)
// Create a new transaction (POST /api/transactions/create)
router.post("/create", protect, createTransaction);

// Get all transactions where user is the buyer (GET /api/transactions/buyer)
router.get("/buyer", protect, getBuyerTransactions);

// Get all transactions where user is the seller (GET /api/transactions/seller)
router.get("/seller", protect, getSellerTransactions);

// Get details for a specific transaction (GET /api/transactions/:id)
router.get("/:id", protect, getTransactionDetails);

module.exports = router;
