import React, { useState } from 'react';
import api from '../services/api'; 

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const { name, email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    try {
      const newUser = { name, email, password, role };
      const res = await api.post('/api/auth/register', newUser); // ✅ Fixed endpoint
      console.log(res.data);
      setStatus({ type: 'success', msg: 'Registration successful!' });
      setFormData({ name: '', email: '', password: '', role: 'buyer' });
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Registration failed.';
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            required
            disabled={loading}
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select id="role" name="role" value={role} onChange={onChange} required disabled={loading}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
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

export default Register;