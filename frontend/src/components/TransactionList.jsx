// src/components/TransactionList.jsx (UPDATED)
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FiDollarSign, FiLoader } from 'react-icons/fi'; // Icons for the pay button and loading

// Helper to format status strings for a better UI (now uses CSS classes)
const formatStatus = (status) => {
    // Convert status string (e.g., 'pending_payment') to class name (e.g., 'pending-payment')
    const className = status.replace(/_/g, '-'); 
    let text;

    switch (status) {
        case "pending_payment":
          text = "Awaiting Buyer Payment";
          break;
        case "pending_delivery":
          text = "Payment Secured, Awaiting Delivery";
          break;
        case "completed":
          text = "Completed";
          break;
        case "disputed":
          text = "Disputed";
          break;
        default:
          text = status;
    }

      return (
        <span style={{ color: "blue", fontWeight: "bold" }}>
          Payment Secured, Awaiting Delivery
        </span>
    );
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

  const handlePayFast = async (tx) => {
    try {
      // Call backend to get PayFast URL for existing transaction
      const res = await api.post("/payfast/initiate", {
        transactionId: tx.id,
        buyer_email: tx.buyer_email,
      });
      window.open(res.data.redirectUrl, "_blank")
    } catch (error) {
      console.error("PayFast initiation failed:", error);
      alert("Failed to start PayFast payment. Please try again.");
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}><FiLoader className="spin" /> Loading transactions...</p>;
  if (error) return <div className="status-message error">{error}</div>;
  if (transactions.length === 0)
    return <p style={{ padding: '15px', color: '#666' }}>No transactions found for you as a {type}.</p>;

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
          </p>
          <p>
            <strong>Amount:</strong> R{parseFloat(tx.amount).toFixed(2)}
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
          {/* Action buttons */}
          {tx.status === "pending_payment" && type === "buyer" && (
            <button className="action-button pay-button" onClick={() => handlePayFast(tx)}>
              <FiDollarSign /> Proceed to PayFast
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TransactionList;