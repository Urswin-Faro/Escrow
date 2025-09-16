// Update the file to include the new login route
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login); // Add this line

module.exports = router;