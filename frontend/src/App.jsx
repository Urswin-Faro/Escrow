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
import LandingPage from "./components/LandingPage"; // <-- NEW IMPORT
import "./App.css";
import PaymentSuccess from "./components/PaymentSuccess";

// Component to handle the role-based rendering
const DashboardRouter = () => {
  const { user, logout } = useAuth();
  
  // Determine which dashboard to render based on user role
  let DashboardComponent;
  const role = user?.role?.toLowerCase() || "user"; // Good: ensures lowercase, defaults to 'user'

  switch (role) {
    case "user": // <-- Keep this, used as fallback
      DashboardComponent = UserDashboard;
      break;
    case "buyer": // <--- ADD THIS CASE
      DashboardComponent = UserDashboard;
      break;
    case "seller":
      DashboardComponent = SellerDashboard;
      break;
    case "admin":
      DashboardComponent = AdminDashboard;
      break;
    default:
      // If the role is truly unknown, show the error
      return (
        <p style={{ color: "red" }}>Error: Unknown role type ({user?.role}).</p>
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
  // Default view is now 'landing'
  const [currentView, setCurrentView] = useState("landing"); 

  // Handlers to switch views (passed to LandingPage for navigation)
  const showLogin = () => {
    setCurrentView("login");
    window.history.pushState({}, document.title, "/login");
  };
  
  const showRegister = () => {
    setCurrentView("register");
    window.history.pushState({}, document.title, "/register");
  };

  const toggleAuthView = () => {
    setCurrentView(currentView === "login" ? "register" : "login");
  };

  const showForgotPassword = () => {
    setCurrentView("forgot");
  };

  const backToLogin = () => {
    setCurrentView("login");
    window.history.replaceState({}, document.title, "/login");
  };
  
  // Check for initial URL path to set the starting view
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");
    const path = window.location.pathname;

    if (isAuthenticated) {
      setCurrentView("dashboard");
    } else if (path === "/reset-password" && resetToken) {
      setCurrentView("reset");
    } else if (path === "/register") {
      setCurrentView("register");
    } else if (path === "/forgot-password") {
      setCurrentView("forgot");
    } else if (path === "/login") {
      setCurrentView("login");
    } else if (path.includes("/payments/success")) {
        // Use path.includes for a more flexible check
        setCurrentView("success");
    } else {
      setCurrentView("landing");
    }
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // 1. Authenticated
  if (isAuthenticated) {
    return <DashboardRouter />;
  }

  // 2. Landing Page (Default unauthenticated view)
  if (currentView === "landing") {
    return <LandingPage onShowLogin={showLogin} onShowRegister={showRegister} />;
  }

  // 3. Authentication Views (Renders auth forms inside a centered container)
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
          
          {currentView === "success" && (<PaymentSuccess onRedirect={backToLogin} />
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