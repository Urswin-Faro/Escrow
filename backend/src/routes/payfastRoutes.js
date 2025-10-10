// src/routes/payfastRoutes.js
const express = require("express");
const { initiatePayment, handleNotify } = require("../controllers/payfastController");
const { protect } = require("../middleware/authMiddleware"); // optional for initiating payment

const router = express.Router();

// Initiate a PayFast payment (POST /api/payfast/initiate)
router.post("/initiate", protect, initiatePayment); // protect optional if you want only logged-in users to pay

// ITN notify URL (PayFast calls this automatically)
router.post("/notify", handleNotify); // no protect, PayFast will call this

// This handles the PayFast return (user is redirected here after payment)
router.get("/return", (req, res) => {
  // Optional: you can read m_payment_id from query string if PayFast sends it
  const { m_payment_id } = req.query;

  // Redirect user to your frontend success page
  res.redirect(`http://localhost:5173/success?transaction_id=${m_payment_id}`);
});

module.exports = router;
