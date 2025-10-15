// src/components/CreateTransaction.jsx
import React, { useState } from "react";
// Assuming you have a default utility icon for the button
import { FiPlus } from 'react-icons/fi'; 
import api, { createTransaction } from "../services/api"; 

const CreateTransaction = () => {
  const [formData, setFormData] = useState({
    sellerId: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const { sellerId, amount, description } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const transactionData = {
      sellerId,
      amount: parseFloat(amount),
      description,
    };

    try {
      const res = await createTransaction(transactionData);
      setStatus({
        type: "success",
        msg: `Transaction for $${amount} created successfully with ID: ${res.transaction.id}.`,
      });
      setFormData({ sellerId: "", amount: "", description: "" });
    } catch (err) {
      const errorMsg =
        err.response?.data?.msg ||
        err.message ||
        "Transaction creation failed.";
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Transaction</h2>
      <form onSubmit={onSubmit}>
        
        {/* The 'form-group' and input styles are inherited from App.css */}
        <div className="form-group">
          <label htmlFor="sellerId">Seller ID (Recipient):</label>
          <input
            id="sellerId"
            type="number"
            name="sellerId"
            value={sellerId}
            onChange={onChange}
            required
            disabled={loading}
            min="1"
            placeholder="Enter seller's User ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={amount}
            onChange={onChange}
            required
            disabled={loading}
            min="0.01"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            required
            disabled={loading}
            rows="4"
            placeholder="Briefly describe the goods or service."
          />
        </div>
        
        {/* Uses the primary button style established in App.css */}
        <button type="submit" disabled={loading} className="form-submit-btn">
          {loading ? "Creating..." : (
              <>
                  <FiPlus style={{ marginRight: '5px' }} />
                  Create Transaction
              </>
          )}
        </button>
      </form>

      {status && (
        // Apply status classes for visual feedback
        <div className={`status-message ${status.type}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
};

export default CreateTransaction;