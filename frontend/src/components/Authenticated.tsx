import type { User } from '../types/auth';

interface AuthenticatedProps {
  user: User;
}

export default function Authenticated({ user }: AuthenticatedProps) {
  return (
    <div className="auth-container">
      <div className="auth-card success">
        <div className="success-icon">✓</div>
        <h1>Authentification réussie !</h1>
        <div className="user-info">
          <p>
            <strong>Bienvenue, {user.username}!</strong>
          </p>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
          {user.avatarUrl && (
            <div className="avatar">
              <img src={user.avatarUrl} alt={user.username} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
