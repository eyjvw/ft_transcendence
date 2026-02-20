import type { User } from '../types/auth';

interface AuthenticatedProps {
  user: User;
}

export default function Authenticated({ user }: AuthenticatedProps) {
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Logged in</p>
          <h1>Welcome back, {user.username}!</h1>
          <p className="app-subtitle">You&apos;re signed in and ready to go.</p>
        </div>
        {user.avatarUrl ? (
          <img className="app-avatar" src={user.avatarUrl} alt={user.username} />
        ) : (
          <div className="app-avatar app-avatar--placeholder">
            {user.username.slice(0, 1).toUpperCase()}
          </div>
        )}
      </header>

      <section className="app-card">
        <div className="app-card-row">
          <div>
            <p className="app-label">Username</p>
            <p className="app-value">{user.username}</p>
          </div>
          <div>
            <p className="app-label">Email</p>
            <p className="app-value">{user.email}</p>
          </div>
        </div>
        <div className="app-card-row">
          <div>
            <p className="app-label">User ID</p>
            <p className="app-value">{user.id}</p>
          </div>
          <div>
            <p className="app-label">Email verification</p>
            <p className="app-value">{!user.isActive ? 'Verified' : 'Not verified'}</p>
          </div>
        </div>
      </section>

      <section className="app-card app-card--actions">
        <button className="app-primary-btn" type="button">
          Go to dashboard
        </button>
        <button className="app-secondary-btn" type="button">
          View profile
        </button>
      </section>
    </div>
  );
}
