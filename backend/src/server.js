require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const payfastRoutes = require('./routes/payfastRoutes');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:3000'], 
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- required for PayFast ITN

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Escrow API Server is running!' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payfast', payfastRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ FIXED: Removed the problematic app.all('*', ...) route
// Express will handle 404s automatically for undefined routes

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
});