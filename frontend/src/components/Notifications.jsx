// src/components/Notifications.jsx (NEW)
import React, { useState, useEffect } from "react";
import api from "../services/api";

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingActions = async () => {
      setLoading(true);
      const alerts = [];
      
      // 1. Check for transactions where the user is the BUYER and needs to pay
      try {
        const buyerRes = await api.get("/transactions/buyer");
        const pendingPayment = buyerRes.data.filter(
          (tx) => tx.status === "pending_payment"
        );
        if (pendingPayment.length > 0) {
          alerts.push(
            `You have ${pendingPayment.length} transactions awaiting payment.`
          );
        }
      } catch (err) {
        console.error("Error fetching buyer transactions for alerts:", err);
      }
      
      // 2. Check for transactions where the user is the SELLER and needs to deliver
      try {
        const sellerRes = await api.get("/transactions/seller");
        const pendingDelivery = sellerRes.data.filter(
          (tx) => tx.status === "pending_delivery"
        );
        if (pendingDelivery.length > 0) {
          alerts.push(
            `You have ${pendingDelivery.length} orders awaiting delivery/completion.`
          );
        }
      } catch (err) {
        console.error("Error fetching seller transactions for alerts:", err);
      }

      setNotifications(alerts);
      setLoading(false);
    };

    fetchPendingActions();
    // Re-fetch every 30 seconds for a basic 'polling' effect 
    const intervalId = setInterval(fetchPendingActions, 30000); 

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [userId]);

  if (loading) return <div className="notifications-box">Loading Alerts...</div>;

  return (
    <div className="notifications-box">
      <h3>🔔 Action Required Alerts</h3>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((msg, index) => (
            <li key={index} className="alert-item">
              {msg}
            </li>
          ))}
        </ul>
      ) : (
        <p>No immediate actions required. All clear!</p>
      )}
    </div>
  );
};

export default Notifications;