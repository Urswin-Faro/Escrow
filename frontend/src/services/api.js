// src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Public Auth Functions (Keep using fetch for consistency with Urswin's original) ---

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send reset email");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reset password");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// --- Authenticated Transaction Functions (Use the 'api' axios instance) ---

// Create transaction with PayFast integration // PayFast
export const createTransaction = async (transactionData) => {
  try {
    const res = await api.post("/transactions/create", transactionData);

    // PayFast: return formParams if backend provides them
    if (res.data && res.data.payfast) {
      return {
        transaction: res.data.transaction,
        formParams: res.data.payfast, // PayFast: contains all PayFast fields
      };
    }

    return res.data;
  } catch (error) {
    console.error("Error creating transaction:", error); // PayFast
    throw error.response?.data || error; // PayFast
  }
};

// Fetch buyer transactions
export const fetchBuyerTransactions = async () => {
  const res = await api.get("/transactions/buyer");
  return res.data;
};

// Fetch seller transactions
export const fetchSellerTransactions = async () => {
  const res = await api.get("/transactions/seller");
  return res.data;
};

export const registerAdmin = async (username, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Admin registration failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Admin API functions
export const getAllUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
};

export const updateUserRole = async (userId, role) => {
  const res = await api.put(`/admin/users/${userId}/role`, { role });
  return res.data;
};

export const getAllTransactionsAdmin = async () => {
  const res = await api.get("/admin/transactions");
  return res.data;
};

export const getSystemStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

// Keep this export for other components that use api.get/post directly
export default api;
