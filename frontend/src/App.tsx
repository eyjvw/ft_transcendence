import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Main from './components/Main';
import EmailVerification from './components/EmailVerification';
import { api } from './services/api';
import type { User } from './types/auth';

type View = 'loading' | 'login' | 'register' | 'verify-email' | 'authenticated';

function App() {
  const [view, setView] = useState<View>('loading');
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async () => {
    const result = await api.me();
    if (result.user) {
      setUser(result.user);
      if (!result.user.isActive) {
        setView('authenticated');
      } else {
        setView('verify-email');
      }
    } else {
      setView('login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    checkAuth();
  };

  if (view === 'loading') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Chargement...</h1>
        </div>
      </div>
    );
  }

  if (view === 'authenticated' && user) {
    return <Main user={user} />;
  }

  if (view === 'verify-email' && user) {
    return (
      <EmailVerification
        user={user}
        onRefresh={checkAuth}
        onUserUpdate={(updatedUser) => setUser(updatedUser)}
      />
    );
  }

  if (view === 'register') {
    return (
      <Register
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <Login
      onSuccess={handleAuthSuccess}
      onSwitchToRegister={() => setView('register')}
    />
  );
}

export default App;
