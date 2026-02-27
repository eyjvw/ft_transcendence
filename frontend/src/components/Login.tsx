import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { LoginData } from '../types/auth';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleGoogleResponse,
      });
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setError('');
    const result = await api.googleLogin(response.credential);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Google login failed');
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google login not available');
    }
  };

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
      setError(t('login.failed'));
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{t('login.title')}</h1>
        <p className="auth-subtitle">{t('login.subtitle')}</p>

        <div className="oauth-section">
          <button 
            type="button" 
            className="oauth-btn google-btn"
            onClick={handleGoogleClick}
            disabled={loading}
          >
            <span className="oauth-icon">G</span>
            {t('login.google')}
          </button>
        </div>

        <div className="divider">
          <span>{t('common.or')}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="sr-only" htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              placeholder={t('login.emailPlaceholder')}
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
              placeholder={t('common.password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="button" className="forgot-link">
            {t('login.forgot')}
          </button>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <p className="switch-auth">
          {t('login.switch')}{' '}
          <button onClick={onSwitchToRegister} className="link-btn">
            {t('login.switchCta')}
          </button>
        </p>
      </div>
    </div>
  );
}
