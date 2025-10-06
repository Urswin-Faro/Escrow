// src/components/AdminDashboard.jsx
import React from "react";

const AdminDashboard = ({ user }) => {
  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard - Welcome, {user.username}</h2>
      <p>
        Admin content here: Manage users, review disputes, view all
        transactions, etc.
      </p>
      {/* Full transaction list for admin would go here */}
    </div>
  );
};

export default AdminDashboard;
