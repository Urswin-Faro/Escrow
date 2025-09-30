import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import CreateTransaction from './components/CreateTransaction';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword'; 
import './App.css';

function App() {
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
          <Routes>
            <Route path="/" element={<h2>Welcome to the Escrow Application</h2>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create" element={<CreateTransaction />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;