// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import UserDashboard from "./components/UserDashboard";
import SellerDashboard from "./components/SellerDashboard"; // NEW
import AdminDashboard from "./components/AdminDashboard"; // NEW
import "./App.css";

// Component to handle the role-based rendering
const DashboardRouter = ({ user, handleLogout }) => {
  // Determine which dashboard to render based on user role
  let DashboardComponent;

  // NOTE: Urswin's backend defaults to 'user', so we'll assume 'user' is 'buyer' if no role is explicitly set
  const role = user?.role?.toLowerCase() || "buyer";

  switch (role) {
    case "buyer":
    case "user": // Treat 'user' role as a buyer for the demo
      DashboardComponent = UserDashboard;
      break;
    case "seller":
      DashboardComponent = SellerDashboard;
      break;
    case "admin":
      DashboardComponent = AdminDashboard;
      break;
    default:
      return (
        <p style={{ color: "red" }}>Error: Unknown role type ({user.role}).</p>
      );
  }

  return (
    <div className="App">
      <header className="App-header-authenticated">
        <h1>Escrow App</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span>
            Welcome, {user?.username || user?.email} ({role.toUpperCase()})
          </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <DashboardComponent user={user} />
      </main>
    </div>
  );
};

function App() {
  // We will still use 'currentView' for the public routes, but use 'isAuthenticated' for the main dashboard
  const [currentView, setCurrentView] = useState("login"); // 'login', 'register', 'forgot', 'reset'
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token and user data on app load (You need to update this to fetch user data if token exists)
  useEffect(() => {
    const authToken = localStorage.getItem("token");
    // Simple token existence check - in a real app, you'd use the token to call an endpoint like /api/auth/me
    if (authToken) {
      // NOTE: For a real app, you must fetch user details and role here.
      // For now, we'll assume the user object is somehow persisted/re-hydrated.
      // Since we can't persist the full object, the user will be logged out on refresh unless you implement a /me endpoint.
      // We'll proceed by forcing the user to re-login to ensure the user object is correct.
    }

    // Check for reset password URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");
    if (window.location.pathname === "/reset-password" && resetToken) {
      setCurrentView("reset");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView("dashboard");
    window.history.replaceState({}, document.title, "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView("login");
    window.history.replaceState({}, document.title, "/");
  };

  const toggleAuthView = () => {
    setCurrentView(currentView === "login" ? "register" : "login");
  };

  const showForgotPassword = () => {
    setCurrentView("forgot");
  };

  const backToLogin = () => {
    setCurrentView("login");
    window.history.replaceState({}, document.title, "/");
  };

  // If authenticated, render the role-based router
  if (isAuthenticated) {
    return <DashboardRouter user={user} handleLogout={handleLogout} />;
  }

  // Authentication views
  // NOTE: The Router and Routes setup is slightly unconventional here as it relies on 'currentView' state.
  // For this existing structure, we will use the currentView state to render the correct form.
  return (
    <div className="App">
      <header className="App-header">
        <h1>Escrow Application</h1>
      </header>
      <main>
        <div className="auth-container">
          {currentView === "login" && (
            <Login
              onToggle={toggleAuthView}
              onLogin={handleLogin}
              onForgotPassword={showForgotPassword}
            />
          )}

          {currentView === "register" && (
            <Register onToggle={toggleAuthView} onRegister={handleLogin} />
          )}

          {currentView === "forgot" && <ForgotPassword onBack={backToLogin} />}

          {currentView === "reset" && <ResetPassword onSuccess={backToLogin} />}
        </div>
      </main>
    </div>
  );
}

export default App;
