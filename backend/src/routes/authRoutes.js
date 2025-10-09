// routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();
const authController = require('../controllers/authController');
const {sendOtpEmail} = require('../services/emailService');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/register-admin', authController.registerAdmin);

module.exports = router;
