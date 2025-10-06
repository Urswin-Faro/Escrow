// src/components/SellerDashboard.jsx
import React from "react";
import TransactionList from "./TransactionList";

const SellerDashboard = ({ user }) => {
  return (
    <div className="dashboard-container">
      <h2>Seller Dashboard - Welcome, {user.username}</h2>
      <div className="dashboard-content">
        <div className="column">
          <h3>Awaiting Payment/Delivery</h3>
          <p>
            A list of transactions where you are the seller and action is
            pending will go here.
          </p>
        </div>
        <div className="column">
          <TransactionList type="seller" />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
