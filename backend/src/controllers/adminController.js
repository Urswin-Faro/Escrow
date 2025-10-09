// backend/src/controllers/adminController.js
const { pool } = require('../db');
const express = require('express');

// Get all users (admin only)
const getAllUsers = async(req, res) => {
    try {
        const query = "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC";
        const result = await pool.query(query);

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            users: result.rows
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users'
        });
    }
};

// Get all transactions (admin only)
const getAllTransactions = async(req, res) => {
    try {
        const query = `
            SELECT
            t.id, t.buyer_id, t.seller_id, t.amount, t.description, t.status, t.created_at,
            u1.username AS buyer_username,
            u2.username AS seller_username
            FROM transactions t
            LEFT JOIN users u1 ON t.buyer_id = u1.id
            LEFT JOIN users u2 ON t.seller_id = u2.id
            ORDER BY t.created_at DESC
        `;
        const result = await pool.query(query);

        res.json({
            success: true,
            message: 'Transactions retrieved successfully',
            transactions: result.rows
        });
    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve transactions'
        });
    }
};

// Delete user (admin only)
const deleteUser = async(req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const existingUser = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    
        // Delete user
        await pool.query("DELETE FROM users WHERE id = $1", [userId]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

// Update user role (admin only)
const updateUserRole = async(req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // Validate role
        const validRoles = ['user', 'seller', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be: user, seller, or admin'
            });
        }

        // Update user role
        const result = await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User role updated to ${role} successfully`
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role'
        });
    }
};

// Get system statistics (admin only)
const getSystemStats = async(req, res) => {
    try {
        // Get user count by role
        const userStats = await pool.query(`
            SELECT role, COUNT(*) AS count
            FROM users
            GROUP BY role
        `);

        // Get transaction count by status
        const transactionStats = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM transactions
            GROUP BY status
        `);

        // Get total transaction amount
        const totalAmount = await pool.query(`
            SELECT SUM(amount) AS total_amount
            FROM transactions
        `);

        res.json({
            success: true,
            message: 'System statistics retrieved successfully',
            stats: {
                users: userStats.rows,
                transactions: transactionStats.rows,
                totalAmount: totalAmount.rows[0]?.total_amount || 0
            }
        });
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system statistics'
        });
    }
};

module.exports = {
    getAllUsers,
    getAllTransactions,
    deleteUser,
    updateUserRole,
    getSystemStats
};