import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '../types/auth';
import { api } from '../services/api';

interface ProfileProps {
  user: User;
  onBack: () => void;
  onUserUpdate: (user: User) => void;
  onLogout: () => void;
  currentLanguage: string;
}

export default function Profile({
  user,
  onBack,
  onUserUpdate,
  onLogout,
  currentLanguage,
}: ProfileProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [pendingLanguage, setPendingLanguage] = useState<'en' | 'fr' | 'ar'>(
    (currentLanguage as 'en' | 'fr' | 'ar') ?? 'en'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl ?? null);

  const languages: Array<{ code: 'en' | 'fr' | 'ar'; label: string }> = [
    { code: 'en', label: t('languages.en') },
    { code: 'fr', label: t('languages.fr') },
    { code: 'ar', label: t('languages.ar') },
  ];

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    let updatedUser = user;
    const profilePayload = {
      username: trimmedUsername === user.username ? undefined : trimmedUsername,
      email: trimmedEmail === user.email ? undefined : trimmedEmail,
      language: pendingLanguage === (user.language ?? 'en') ? undefined : pendingLanguage,
    };

    const hasProfileChanges = Boolean(profilePayload.username || profilePayload.language || profilePayload.email);

    if (hasProfileChanges) {
      const profileResult = await api.updateProfile(profilePayload);

      if (profileResult.error) {
        setError(profileResult.error);
        setLoading(false);
        return;
      }

      if (profileResult.user) {
        updatedUser = {
          ...updatedUser,
          ...profileResult.user,
          coins: profileResult.user.coins ?? updatedUser.coins,
          language: profileResult.user.language ?? updatedUser.language,
        };
      }
    }

    onUserUpdate(updatedUser);
    setSuccess('profile.saved');
    setLoading(false);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        setError('profile.avatarError');
        setLoading(false);
        return;
      }

      setAvatarPreview(result);
      const updateResult = await api.updateProfile({ avatar_url: result });

      if (updateResult.error) {
        setError(updateResult.error);
      } else if (updateResult.user) {
        onUserUpdate(updateResult.user);
        setSuccess('profile.avatarUpdated');
      }

      setLoading(false);
    };
    reader.onerror = () => {
      setError('profile.avatarError');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-identity">
          <label className="profile-avatar-upload" htmlFor="profile-avatar-input" style={{ position: 'relative' }}>
            {avatarPreview ? (
              <img className="profile-avatar-lg" src={avatarPreview} alt={user.username} />
            ) : (
              <div className="profile-avatar-lg profile-avatar-lg--placeholder">
                {user.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            {user.isActive && (
              <span style={{
                position: 'absolute',
                bottom: '8%',
                right: '8%',
                width: '18px',
                height: '18px',
                backgroundColor: '#44b700',
                border: '3px solid #121d2a',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgba(68, 183, 0, 0.4)',
                zIndex: 5
              }} title="Online"></span>
            )}
            <span className="profile-avatar-overlay">{t('profile.changePfp')}</span>
            <input
              id="profile-avatar-input"
              type="file"
              accept="image/*"
              className="profile-avatar-input"
              onChange={handleAvatarChange}
            />
          </label>
          <div className="profile-info-main">
            <h1 className="profile-title">{user.username}</h1>
            <p className="profile-subtitle">{user.email}</p>
          </div>
          <button className="profile-back-btn" onClick={onBack} type="button">
            {t('profile.back')}
          </button>
        </div>
      </header>

      <section className="profile-card">
        <div className="profile-row">
          <div>
            <p className="profile-label">{t('profile.userId')}</p>
            <p className="profile-value">{user.id}</p>
          </div>
          <div>
            <p className="profile-label">{t('profile.coins')}</p>
            <p className="profile-value">$ {Number(user.coins ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="profile-row">
          <div>
            <p className="profile-label">{t('profile.language')}</p>
            <p className="profile-value">{t(`languages.${currentLanguage}`)}</p>
          </div>
        </div>
      </section>

      <section className="profile-card">
        <h2 className="profile-section-title">{t('profile.languageTitle')}</h2>
        {error && <div className="error-message">{t(error)}</div>}
        {success && <div className="info-message">{t(success)}</div>}
        <div className="profile-row">
          <div>
            <label className="profile-label" htmlFor="profile-username">
              {t('common.username')}
            </label>
            <input
              id="profile-username"
              className="profile-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t('common.username')}
              maxLength={15}
            />
          </div>
          <div>
            <label className="profile-label" htmlFor="profile-email">
              {t('common.email')}
            </label>
            <input
              id="profile-email"
              className="profile-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('common.email')}
            />
          </div>
        </div>
        <div className="language-switcher">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`language-btn ${pendingLanguage === lang.code ? 'active' : ''}`}
              onClick={() => setPendingLanguage(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </section>

      <section className="profile-card profile-actions">
        <button className="profile-primary" type="button" onClick={handleSave} disabled={loading}>
          {loading ? t('profile.saving') : t('profile.edit')}
        </button>
        <button className="profile-logout" type="button" onClick={onLogout}>
          {t('profile.logout')}
        </button>
      </section>
    </div>
  );
}
