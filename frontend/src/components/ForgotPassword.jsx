import React, { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // { type: 'error'|'success', msg: string, devOtp?: string }
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      // dev mode may return devOtp
      const devOtp = res.data?.devOtp;
      setStatus({ type: 'success', msg: res.data?.message || 'OTP sent', devOtp });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.msg || 'Server error';
      setStatus({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '1rem auto', padding: 16 }}>
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }}
          />
        </label>

        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Sending…' : 'Send OTP'}
        </button>
      </form>

      {status && (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: status.type === 'error' ? 'red' : 'green' }}>{status.msg}</p>
          {status.devOtp && (
            <p style={{ fontSize: 13 }}>
              <strong>DEV OTP:</strong> {status.devOtp} <em>(dev only)</em>
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <small>
          If you don't have an account, <a href="/register">register</a>. Or try <a href="/login">login</a>.
        </small>
      </div>
    </div>
  );
}
