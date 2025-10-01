import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api';

export default function ResetPassword({ onSuccess }) {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    console.log('Token from URL:', tokenFromUrl); // Debug log
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid reset link - no token found');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('No reset token found');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending reset request with token:', token); // Debug log
      const response = await resetPassword(token, newPassword);
      console.log('Reset response:', response); // Debug log
      
      if (onSuccess) {
        onSuccess();
      } else {
        alert('Password reset successfully! Please login with your new password.');
      }
    } catch (error) {
      console.error('Reset password error:', error); // Debug log
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 420, margin: '1rem auto', padding: 16 }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            style={{ width: '100%', padding: 8, marginTop: 6 }}
          />
        </div>
        
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            style={{ width: '100%', padding: 8, marginTop: 6 }}
          />
        </div>
        
        <button type="submit" disabled={loading || !token} style={{ padding: '8px 12px' }}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
