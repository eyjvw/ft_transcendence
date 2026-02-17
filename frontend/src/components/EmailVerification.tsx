import { useState } from 'react';
import type { User } from '../types/auth';
import { api } from '../services/api';

interface EmailVerificationProps {
  user: User;
  onRefresh: () => void;
  onUserUpdate: (user: User) => void;
}

export default function EmailVerification({ user, onRefresh, onUserUpdate }: EmailVerificationProps) {
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const result = await api.resendVerification();

    if (result.error) {
      setError(result.error);
    } else {
      setMessage('Verification email sent.');
    }

    setLoading(false);
  };

  const handleChangeEmail = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await api.updateEmail(email);

    if (result.error) {
      setError(result.error);
    } else if (result.user) {
      onUserUpdate(result.user);
      setMessage('Email updated. Please verify your new email.');
    } else {
      setMessage('Email updated.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Verify your email</h1>
        <p className="auth-subtitle">
          We need to confirm your email before you can access the app.
        </p>

        {message && <div className="info-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <button
          type="button"
          className="submit-btn"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Resend verification email'}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleChangeEmail} className="verify-form">
          <div className="form-group">
            <label className="sr-only" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Change email'}
          </button>
        </form>

        <button type="button" className="secondary-btn" onClick={onRefresh} disabled={loading}>
          I have verified my email
        </button>
      </div>
    </div>
  );
}
