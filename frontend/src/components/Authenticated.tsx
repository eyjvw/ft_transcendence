import type { User } from '../types/auth';
import { useTranslation } from 'react-i18next';

interface AuthenticatedProps {
  user: User;
}

export default function Authenticated({ user }: AuthenticatedProps) {
  const { t } = useTranslation();
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">{t('auth.loggedIn')}</p>
          <h1>{t('auth.welcome', { name: user.username })}</h1>
          <p className="app-subtitle">{t('auth.subtitle')}</p>
        </div>
        {user.avatarUrl ? (
          <div className="avatar-container" style={{ position: 'relative', display: 'inline-block' }}>
            <img className="app-avatar" src={user.avatarUrl} alt={user.username} />
            {user.isActive && (
              <span style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '14px',
                height: '14px',
                backgroundColor: '#44b700',
                border: '2px solid #1a2736',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(68, 183, 0, 0.4)'
              }} title="Online"></span>
            )}
          </div>
        ) : (
          <div className="avatar-container" style={{ position: 'relative', display: 'inline-block' }}>
            <div className="app-avatar app-avatar--placeholder">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            {user.isActive && (
              <span style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '14px',
                height: '14px',
                backgroundColor: '#44b700',
                border: '2px solid #1a2736',
                borderRadius: '50%'
              }} title="Online"></span>
            )}
          </div>
        )}
      </header>

      <section className="app-card">
        <div className="app-card-row">
          <div>
            <p className="app-label">{t('common.username')}</p>
            <p className="app-value">{user.username}</p>
          </div>
          <div>
            <p className="app-label">{t('common.email')}</p>
            <p className="app-value">{user.email}</p>
          </div>
        </div>
        <div className="app-card-row">
          <div>
            <p className="app-label">{t('auth.userId')}</p>
            <p className="app-value">{user.id}</p>
          </div>
        </div>
      </section>

      <section className="app-card app-card--actions">
        <button className="app-primary-btn" type="button">
          {t('auth.dashboard')}
        </button>
        <button className="app-secondary-btn" type="button">
          {t('auth.profile')}
        </button>
      </section>
    </div>
  );
}
