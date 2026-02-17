import { useState } from 'react';
import { api } from '../services/api';
import type { LoginData } from '../types/auth';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await api.login(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.success) {
      onSuccess();
    } else {
      setError('Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Hello!</h1>
        <p className="auth-subtitle">Sign in to your account here.</p>

        <div className="oauth-section">
          <button type="button" className="oauth-btn google-btn">
            <span className="oauth-icon">G</span>
            Continue with Google
          </button>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="sr-only" htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="sr-only" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="button" className="forgot-link">
            Forgot password?
          </button>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="switch-auth">
          Don&apos;t have an account yet?{' '}
          <button onClick={onSwitchToRegister} className="link-btn">
            Sign up!
          </button>
        </p>
      </div>
    </div>
  );
}
