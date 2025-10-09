// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllTransactionsAdmin,
  getSystemStats,
} from "../services/api";

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Clear message after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  //Fetch system statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getSystemStats();
      setStats(response.stats);
    } catch (error) {
      setError("Failed to fetch statistics: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllUsers();
      setUsers(response.users);
    } catch (error) {
      setError("Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllTransactionsAdmin();
      setTransactions(response.transactions);
    } catch (error) {
      setError("Failed to fetch transactions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setError("");
      await deleteUser(userId);
      setSuccess("User deleted successfully");
      fetchUsers();
    } catch (error) {
      setError("Failed to delete user: " + error.message);
    }
  };

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      setError("");
      await updateUserRole(userId, newRole);
      setSuccess(`User role updated to ${newRole} successfully`);
      fetchUsers();
    } catch (error) {
      setError("Failed to update user role: " + error.message);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "transactions") {
      fetchTransactions();
    } else if (activeTab === "stats") { 
      fetchStats();
    }
  }, [activeTab]);

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard - Welcome, {user.name}</h1>

      {error && (
        <div style={{
          color: "white",
          backgroundColor: "#dc3545",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          color: "white",
          backgroundColor: "#28a745",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "4px"
        }}>
          {success}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="admin-tabs" style={{marginBottom: "20px"}}>
        <button
          onClick={() => setActiveTab("stats")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeTab === "stats" ? "#007bff" : "#f8f9fa",
            color: activeTab === "stats" ? "white" : "black",
            border: "1px solid #dee2e6",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        > 
          System Statistics
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeTab === "users" ? "#007bff" : "#f8f9fa",
            color: activeTab === "users" ? "white" : "black",
            border: "1px solid #dee2e6",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeTab === "transactions" ? "#007bff" : "#f8f9fa",
            color: activeTab === "transactions" ? "white" : "black",
            border: "1px solid #dee2e6",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          All Transactions
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {/* Statistics Tab */}
      {activeTab === "stats" && !loading && stats && (
        <div>
          <h2>System Overview</h2>
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "200px",
            }}>
              <h3>Users by Role</h3>
              {stats.users.map((stat) => (
                <div key={stat.role}>
                  <strong>{stat.role}:</strong> {stat.count}
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "200px",
            }}>
              <h3>Transaction by Status</h3>
              {stats.transactions.map((stat) => (
                <div key={stat.status}>
                  <strong>{stat.status}:</strong> {stat.count}
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "200px",
            }}>
              <h3>Total Transaction Value</h3>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
                ${parseFloat(stats.totalAmount || 0).toFixed(2)}
              </div>
            </div>
          </div>  
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && !loading && (
        <div>
          <h2>All Users ({users.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>ID</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Username</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Email</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Role</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr key={userData.id}>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>{userData.id}</td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>{userData.username}</td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>{userData.email}</td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>
                      <select
                        value={userData.role}
                        onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                        style={{
                          padding: "6px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                        }}
                      >
                        <option value="user">User</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>
                      <button
                        onClick={() => handleDeleteUser(userData.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "none",
                          backgroundColor: "#dc3545",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && !loading && (
        <div>
          <h2>All Transactions ({transactions.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>ID</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Buyer</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Seller</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Amount</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Status</th>
                  <th style={{padding: "12px", border: "1px solid #dee2e6", textAlign: "left"}}>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>{transaction.id}</td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>
                      {transaction.buyer_username} (ID: {transaction.buyer_id})
                    </td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>
                      {transaction.seller_username} (ID: {transaction.seller_id})
                    </td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          transaction.status === "completed" ? "#d4edda" :
                          transaction.status === "pending" ? "#fff3cd" :
                          transaction.status === "failed" ? "#cce7ff" : "#f8d7da",
                        color:
                          transaction.status === "completed" ? "#155724" :
                          transaction.status === "pending" ? "#856404" :
                          transaction.status === "failed" ? "#004085" : "#721c24",
                      }}>
                        {transaction.status}
                      </span>
                    </td>
                    <td style={{padding: "12px", border: "1px solid #dee2e6"}}>
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;