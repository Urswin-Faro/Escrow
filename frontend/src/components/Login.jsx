import React, { useState } from 'react';
import api from '../services/api'; 

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    try {
      const res = await api.post('/api/auth/login', formData); // ✅ Fixed endpoint
      console.log(res.data);
      setStatus({ type: 'success', msg: 'Login successful!' });
      
      // Store token in localStorage (you can modify this later)
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      
      // TODO: Redirect user to dashboard
    } catch (err) {
      console.error('Login error:', err.response?.data);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Login failed.';
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {status && (
        <p style={{ 
          color: status.type === 'error' ? 'red' : 'green', 
          marginTop: 12,
          fontWeight: 'bold'
        }}>
          {status.msg}
        </p>
      )}
    </div>
  );
};

export default Login;