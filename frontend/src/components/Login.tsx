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

  const handleSubmit = async (e: React.FormEvent) => {
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
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email ou Username</label>
            <input
              id="email"
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="switch-auth">
          Pas encore de compte ?{' '}
          <button onClick={onSwitchToRegister} className="link-btn">
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
}
