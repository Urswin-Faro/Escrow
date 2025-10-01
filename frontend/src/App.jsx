import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import CreateTransaction from './components/CreateTransaction';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot', 'reset', 'dashboard'
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token and reset password URL on app load
  useEffect(() => {
    // Check if this is a reset password URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (window.location.pathname === '/reset-password' && resetToken) {
      console.log('Reset password URL detected with token:', resetToken);
      setCurrentView('reset');
      return;
    }

    // Check for existing auth token
    const authToken = localStorage.getItem('token');
    if (authToken) {
      // You might want to validate the token here
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    // Clear any URL parameters
    window.history.replaceState({}, document.title, '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
    // Clear any URL parameters
    window.history.replaceState({}, document.title, '/');
  };

  const toggleAuthView = () => {
    setCurrentView(currentView === 'login' ? 'register' : 'login');
  };

  const showForgotPassword = () => {
    setCurrentView('forgot');
  };

  const backToLogin = () => {
    setCurrentView('login');
    // Clear any URL parameters
    window.history.replaceState({}, document.title, '/');
  };

  // If user is authenticated, show dashboard
  if (isAuthenticated && currentView === 'dashboard') {
    return (
      <div className="App">
        <header>
          <h1>Escrow App</h1>
          <div>
            Welcome, {user?.username || user?.email}
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main>
          <CreateTransaction />
        </main>
      </div>
    );
  }

  // Authentication views
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Escrow Application</h1>
          <nav>
            <Link to="/register">Register</Link> | 
            <Link to="/login">Login</Link> | 
            <Link to="/create">Create Transaction</Link> |
            <Link to="/forgot-password">Forgot Password</Link>
          </nav>
        </header>
        <main>
          <div className="auth-container">
            {currentView === 'login' && (
              <Login 
                onToggle={toggleAuthView}
                onLogin={handleLogin} // ✅ Pass the login handler
                onForgotPassword={showForgotPassword}
              />
            )}
            
            {currentView === 'register' && (
              <Register 
                onToggle={toggleAuthView}
                onRegister={handleLogin} // After registration, log them in
              />
            )}
            
            {currentView === 'forgot' && (
              <ForgotPassword 
                onBack={backToLogin}
              />
            )}
            
            {currentView === 'reset' && (
              <ResetPassword 
                onSuccess={backToLogin}
              />
            )}
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;