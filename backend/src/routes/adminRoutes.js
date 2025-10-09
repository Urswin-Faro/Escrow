// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { getAllUsers, getAllTransactions, deleteUser, updateUserRole, getSystemStats } = require('../controllers/adminController');

// Apply authentication and admin check to all admin routes
router.use(protect);
router.use(requireAdmin);

// Admin routes
router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.get('/stats', getSystemStats);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

module.exports = router;