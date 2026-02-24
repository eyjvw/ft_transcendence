import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '../types/auth';
import { api } from '../services/api';

interface EditProfileProps {
  user: User;
  onBack: () => void;
  onSave: (user: User) => void;
}

export default function EditProfile({ user, onBack, onSave }: EditProfileProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await api.updateProfile({
      username: username.trim(),
      avatar_url: avatarUrl.trim() || undefined,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.user) {
      onSave(result.user);
      setSuccess(t('profile.saved'));
    }

    setLoading(false);
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="profile-back" onClick={onBack} type="button">
          {t('profile.back')}
        </button>
        <div>
          <h1 className="profile-title">{t('profile.editTitle')}</h1>
          <p className="profile-subtitle">{t('profile.editSubtitle')}</p>
        </div>
      </header>

      <form className="profile-card" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="info-message">{success}</div>}
        <div className="form-group">
          <label htmlFor="edit-username">{t('common.username')}</label>
          <input
            id="edit-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={t('common.username')}
            className="profile-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-avatar">{t('profile.avatar')}</label>
          <input
            id="edit-avatar"
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder={t('profile.avatarPlaceholder')}
            className="profile-input"
          />
        </div>
        {avatarUrl && (
          <div className="profile-avatar-preview">
            <img src={avatarUrl} alt={t('profile.avatar')} />
          </div>
        )}
        <button type="submit" className="profile-primary" disabled={loading}>
          {loading ? t('profile.saving') : t('profile.save')}
        </button>
      </form>
    </div>
  );
}
