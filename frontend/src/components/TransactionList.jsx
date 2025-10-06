// src/components/TransactionList.jsx (UPDATED)
import React, { useState, useEffect } from "react";
import api from "../services/api";

// Helper to format status strings for a better UI
const formatStatus = (status) => {
  switch (status) {
    case "pending_payment":
      return (
        <span style={{ color: "orange", fontWeight: "bold" }}>
          Awaiting Buyer Payment
        </span>
      );
    case "pending_delivery":
      return (
        <span style={{ color: "blue", fontWeight: "bold" }}>
          Payment Secured, Awaiting Delivery
        </span>
      );
    case "completed":
      return (
        <span style={{ color: "green", fontWeight: "bold" }}>Completed</span>
      );
    case "disputed":
      return <span style={{ color: "red", fontWeight: "bold" }}>Disputed</span>;
    default:
      return status;
  }
};

const TransactionList = ({
  type,
  title = `Your ${type.charAt(0).toUpperCase() + type.slice(1)} Transactions`,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Dynamically select the correct endpoint based on the 'type' prop
        const endpoint =
          type === "buyer" ? "/transactions/buyer" : "/transactions/seller";
        const res = await api.get(endpoint);
        setTransactions(res.data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${type} transactions:`, err);
        setError(
          `Failed to fetch ${type} transactions. Are you logged in with the correct role?`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [type]);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (transactions.length === 0)
    return <p>No transactions found for you as a {type}.</p>;

  return (
    <div className="transaction-list">
      <h3>{title}</h3>
      {transactions.map((tx) => (
        <div key={tx.id} className="transaction-card">
          <p>
            <strong>ID:</strong> {tx.id}
          </p>
          <p>
            <strong>Status:</strong> {formatStatus(tx.status)}{" "}
            {/* Use the helper */}
          </p>
          <p>
            <strong>Amount:</strong> ${parseFloat(tx.amount).toFixed(2)}
          </p>
          <p>
            <strong>Description:</strong> {tx.description}
          </p>
          <p>
            <small>
              {type === "buyer"
                ? `Seller ID: ${tx.seller_id}`
                : `Buyer ID: ${tx.buyer_id}`}
            </small>
          </p>
          {/* Add action buttons here based on status and user type */}
          {tx.status === "pending_payment" && type === "buyer" && (
            <button className="action-button pay-button">
              Proceed to PayFast
            </button>
          )}
          {/* ... other status-based buttons (e.g., Mark Received for buyer, Mark Shipped for seller) */}
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
