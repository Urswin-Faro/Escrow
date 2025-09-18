// src/controllers/transactionController.js
const transactionModel = require('../models/transactionModel');
const userModel = require('../models/userModel'); // so we can check users exist

exports.createTransaction = async (req, res) => {
  const { buyer_id, seller_id, amount, description } = req.body;

  try {
    // Validate buyer and seller exist
    const buyer = await userModel.findUserById(buyer_id);
    const seller = await userModel.findUserById(seller_id);

    if (!buyer || !seller) {
      return res.status(400).json({ msg: 'Buyer or seller does not exist' });
    }

    // Create transaction
    const transaction = await transactionModel.createTransaction(buyer_id, seller_id, amount, description);

    res.status(201).json({
      msg: 'Transaction created successfully',
      transaction
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
