import { useState } from 'react';
import { api } from '../services/api';
import type { RegisterData } from '../types/auth';

interface RegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function Register({ onSuccess, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await api.register(formData);

    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error));
      setLoading(false);
    } else if (result.success) {
      onSuccess();
    } else {
      setError('Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Hello!</h1>
        <p className="auth-subtitle">Create your account here.</p>

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
            <label className="sr-only" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={loading}
              minLength={3}
              maxLength={32}
            />
          </div>

          <div className="form-group">
            <label className="sr-only" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>

        <p className="switch-auth">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="link-btn">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
