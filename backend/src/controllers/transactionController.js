// src/controllers/transactionController.js
const transactionModel = require("../models/transactionModel");
const userModel = require("../models/userModel");
const { NotificationService } = require("../services/notificationService"); // New Service

const notificationService = new NotificationService();

// Re-implementing your TransactionService logic into the Controller
exports.createTransaction = async (req, res) => {
  // We assume the user is authenticated and their ID is in req.user.id
  const buyer_id = req.user.id;
  const { sellerId, amount, description } = req.body;

  // Validate seller exists (buyer is validated by the auth middleware/token)
  try {
    const seller = await userModel.findUserById(sellerId);

    if (!seller) {
      return res.status(400).json({ msg: "Seller does not exist" });
    }

    // Create transaction using the postgres model
    const transaction = await transactionModel.createTransaction(
      buyer_id,
      sellerId,
      parseFloat(amount), // Ensure it's a number
      description
    );

    // Send notification (from your original logic)
    notificationService.sendDashboardNotification(
      sellerId,
      `A new transaction for $${amount} has been created for you.`
    );

    res.status(201).json({
      msg: "Transaction created successfully",
      transaction,
    });
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).send("Server error");
  }
};

// New function: Get transactions where the user is the buyer
exports.getBuyerTransactions = async (req, res) => {
  const buyerId = req.user.id; // User ID from the authenticated token
  try {
    const transactions = await transactionModel.findTransactionsByBuyer(
      buyerId
    );
    res.json(transactions);
  } catch (error) {
    console.error("Error getting buyer transactions:", error);
    res.status(500).send("Server error");
  }
};

// New function: Get transactions where the user is the seller
exports.getSellerTransactions = async (req, res) => {
  const sellerId = req.user.id; // User ID from the authenticated token
  try {
    const transactions = await transactionModel.findTransactionsBySeller(
      sellerId
    );
    res.json(transactions);
  } catch (error) {
    console.error("Error getting seller transactions:", error);
    res.status(500).send("Server error");
  }
};

// New function: Get a specific transaction detail
exports.getTransactionDetails = async (req, res) => {
  const transactionId = req.params.id;
  const userId = req.user.id;

  try {
    const transaction = await transactionModel.findTransactionById(
      transactionId
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Check if the authenticated user is either the buyer or the seller
    if (transaction.buyer_id !== userId && transaction.seller_id !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this transaction." });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Error getting transaction details:", error);
    res.status(500).send("Server error");
  }
};
