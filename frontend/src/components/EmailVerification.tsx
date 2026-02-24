import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

interface EmailVerificationProps {
  onRefresh: () => void;
}

export default function EmailVerification({ onRefresh }: EmailVerificationProps) {
  const { t } = useTranslation();
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
      setMessage(t('verify.resent'));
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{t('verify.title')}</h1>
        <p className="auth-subtitle">
          {t('verify.subtitle')}
        </p>

        {message && <div className="info-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <button
          type="button"
          className="submit-btn"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? t('verify.resending') : t('verify.resend')}
        </button>

        <button type="button" className="secondary-btn" onClick={onRefresh} disabled={loading}>
          {t('verify.cta')}
        </button>
      </div>
    </div>
  );
}
