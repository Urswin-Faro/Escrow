// src/components/CreateTransaction.jsx
import React, { useState } from "react";
import api, { createTransaction } from "../services/api"; // Import the dedicated function

const CreateTransaction = () => {
  const [formData, setFormData] = useState({
    sellerId: "", // Changed from seller_id to sellerId to match backend controller convention
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const { sellerId, amount, description } = formData; // Destructure with new name

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Data structure matches the required payload for the backend (sellerId, amount, description)
    const transactionData = {
      sellerId,
      amount: parseFloat(amount),
      description,
    };

    try {
      // Use the dedicated function which internally uses axios/api
      const res = await createTransaction(transactionData);
      console.log(res); // API response object

      // The buyerId is automatically added by the backend's auth middleware
      setStatus({
        type: "success",
        msg: `Transaction for $${amount} created successfully with ID: ${res.transaction.id}.`,
      });

      setFormData({ sellerId: "", amount: "", description: "" });
    } catch (err) {
      console.error("Transaction creation error:", err.message);
      // Error handling for axios
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
        {/* REMOVED: Buyer ID input, as it comes from the authenticated user's token */}

        <div className="form-group">
          <label>Seller ID (Recipient):</label>
          <input
            type="number"
            name="sellerId" // Updated name to match formData state
            value={sellerId}
            onChange={onChange}
            required
            disabled={loading}
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={onChange}
            required
            disabled={loading}
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={description}
            onChange={onChange}
            required
            disabled={loading}
            rows="4"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Transaction"}
        </button>
      </form>

      {status && (
        <p
          style={{
            color: status.type === "error" ? "red" : "green",
            marginTop: 12,
            fontWeight: "bold",
          }}
        >
          {status.msg}
        </p>
      )}
    </div>
  );
};

export default CreateTransaction;
