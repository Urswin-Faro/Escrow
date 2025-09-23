import React, { useState } from 'react';
import api from '../services/api';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      setStatus({ type: 'success', msg: res.data?.message || 'Password changed' });
      setEmail(''); setOtp(''); setNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.msg || 'Server error';
      setStatus({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '1rem auto', padding: 16 }}>
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: 8, marginTop: 6 }} />
        </label>

        <label style={{ display: 'block', marginBottom: 8 }}>
          OTP
          <input value={otp} onChange={(e) => setOtp(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 6 }} />
        </label>

        <label style={{ display: 'block', marginBottom: 8 }}>
          New password
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" required style={{ width: '100%', padding: 8, marginTop: 6 }} />
        </label>

        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      {status && <p style={{ color: status.type === 'error' ? 'red' : 'green', marginTop: 12 }}>{status.msg}</p>}
    </div>
  );
}
