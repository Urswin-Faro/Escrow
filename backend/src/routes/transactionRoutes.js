// src/routes/transactionRoutes.js
const express = require('express');
const { createTransaction } = require('../controllers/transactionController');
const router = express.Router();

// Create a new transaction
router.post('/create', createTransaction);

// You can add more transaction routes later, e.g., GET /all, GET /:id, etc.

module.exports = router;
