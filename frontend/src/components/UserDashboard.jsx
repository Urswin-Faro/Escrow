// src/components/UserDashboard.jsx (CLEANED)
import React, { useState } from "react";
import CreateTransaction from "./CreateTransaction";
import TransactionList from "./TransactionList";
import Notifications from "./Notifications"; 
import "./Dashboard.css"; 
// Assuming you still have the main wrapper and header styles in App.css

const UserDashboard = ({ user }) => {
  // Use state to manage which view is currently active: 'buyer' or 'seller'
  const [activeView, setActiveView] = useState("buyer");

  const toggleView = (view) => {
    setActiveView(view);
  };

  return (
    <div className="user-dashboard-container">
      <h1>Welcome, {user.username}</h1>

      {/* Removed inline style: now handled by CSS */}
      <p>
        Your User ID: {user.id}
      </p>

      {/* Notifications Section */}
      <Notifications userId={user.id} />

      {/* TABS for Buyer/Seller View */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeView === "buyer" ? "active" : ""}`}
          onClick={() => toggleView("buyer")}
        >
          Buyer Center
        </button>
        <button
          className={`tab-button ${activeView === "seller" ? "active" : ""}`}
          onClick={() => toggleView("seller")}
        >
          Seller Center
        </button>
      </div>

      {/* Dashboard Content based on activeView */}
      <div className="dashboard-content">
        {activeView === "buyer" ? (
          <div className="buyer-view">
            <h2>Your Buyer Transactions & Actions</h2>
            <div className="view-columns">
              <div className="column">
                <CreateTransaction />
              </div>
              <div className="column">
                <TransactionList type="buyer" title="Your Buyer Transactions" />
              </div>
            </div>
          </div>
        ) : (
          <div className="seller-view">
            <h2>Your Seller Transactions & Actions</h2>
            <div className="view-columns">
              <div className="column">
                <h3>Seller Actions</h3>
                <p>
                  Action items will go here, like confirming an order for
                  shipping or marking a service as complete for a transaction in
                  'pending_delivery' status.
                </p>
              </div>
              <div className="column">
                <TransactionList
                  type="seller"
                  title="Your Seller Transactions"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;