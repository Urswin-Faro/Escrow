// src/App.jsx
import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import UserDashboard from "./components/UserDashboard";
import SellerDashboard from "./components/SellerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";
import PaymentSuccess from "./components/PaymentSuccess";//Payfast


// Component to handle the role-based rendering
const DashboardRouter = () => {
  const { user, logout } = useAuth();
  
  // Determine which dashboard to render based on user role
  let DashboardComponent;
  const role = user?.role?.toLowerCase() || "user";

  switch (role) {
    case "user":
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
            Welcome, {user?.username || user?.email}
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <main>
        <DashboardComponent user={user} />
      </main>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState("login");

  // Check for reset password URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");
    if (window.location.pathname === "/reset-password" && resetToken) {
      setCurrentView("reset");
    }
  }, []);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  // If authenticated, render the role-based router
  if (isAuthenticated) {
    return <DashboardRouter />;
  }

  // Authentication views
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
              onForgotPassword={showForgotPassword}
            />
          )}

          {currentView === "register" && (
            <Register onToggle={toggleAuthView} />
          )}

          {currentView === "forgot" && <ForgotPassword onBack={backToLogin} />}

          {currentView === "reset" && <ResetPassword onSuccess={backToLogin} />}
          
          {/* PayFast success page: shows after payment is completed */}
          {currentView === "success" && (<PaymentSuccess onRedirect={() => setCurrentView("login")} />
)}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
