// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('../src/routes/authRoutes');
const transactionRoutes = require('../src/routes/transactionRoutes');
const { pool } = require('../src/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
