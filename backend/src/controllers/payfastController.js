const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();
const transactionModel = require("../models/transactionModel");

// --------------------
//  Initiate Payment
// --------------------
exports.initiatePayment = async (req, res) => {
  try {
    const { transactionId, buyer_email } = req.body;

    // Fetch existing transaction
    const transaction = await transactionModel.findTransactionById(transactionId);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });
    // Build PayFast payload
    const data = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY,
        return_url: process.env.PAYFAST_RETURN_URL,
        cancel_url: process.env.PAYFAST_CANCEL_URL,
        notify_url: process.env.PAYFAST_NOTIFY_URL,
        name_first: "Buyer",
        email_address: buyer_email || "test@sandbox.payfast.co.za",
        m_payment_id: transaction.id, // Link PayFast to your DB record
        amount: parseFloat(transaction.amount).toFixed(2),  // <-- use existing transaction
        item_name: transaction.description,                // <-- use existing transaction
    };
    // --- Build signature string correctly ---
    const sortedKeys = Object.keys(data).sort();
    const pfParts = sortedKeys
      .filter((key) => data[key] !== undefined && data[key] !== null && data[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(String(data[key]).trim()).replace(/%20/g, "+")}`);

    let pfString = pfParts.join("&");

    if (process.env.PAYFAST_PASSPHRASE) {
      pfString += `&passphrase=${encodeURIComponent(String(process.env.PAYFAST_PASSPHRASE).trim()).replace(/%20/g, "+")}`;
    }

    const signature = crypto.createHash("md5").update(pfString).digest("hex");

    // Build final URL
    const paymentUrl = `${process.env.PAYFAST_URL}?${pfString}&signature=${signature}`;

    res.json({
      message: "Transaction created successfully",
      transaction_id: transaction.id,
      redirectUrl: paymentUrl,
    });

  } catch (error) {
    console.error("Error creating PayFast transaction:", error);
    res.status(500).json({ message: "Payment setup failed" });
  }
};

// --------------------
//  Verify ITN
// --------------------
const verifyITN = async (pfData) => {
  try {
    const response = await axios.post(
      "https://sandbox.payfast.co.za/eng/query/validate",
      new URLSearchParams(pfData).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data === "VALID";
  } catch (err) {
    console.error("Error verifying PayFast ITN:", err);
    return false;
  }
};

// --------------------
//  Handle ITN (notify) from PayFast
// --------------------
exports.handleNotify = async (req, res) => {
  try {
    const pfData = req.body;
    const transactionId = pfData.m_payment_id;
    const paymentStatus = pfData.payment_status;

    const valid = await verifyITN(pfData);
    if (!valid) {
      console.warn(`PayFast ITN verification failed for transaction ${transactionId}`);
      return res.status(400).send("Invalid ITN");
    }

    if (paymentStatus === "COMPLETE") {
      await transactionModel.updateTransactionStatus(transactionId, "completed");
      console.log(`Transaction ${transactionId} marked as COMPLETED`);
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      await transactionModel.updateTransactionStatus(transactionId, "failed");
      console.log(`Transaction ${transactionId} marked as FAILED`);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling PayFast notify:", error);
    res.status(500).send("Internal Server Error");
  }
};
