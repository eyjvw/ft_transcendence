import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Authenticated from './components/Authenticated';
import { api } from './services/api';
import type { User } from './types/auth';

type View = 'loading' | 'login' | 'register' | 'authenticated';

function App() {
  const [view, setView] = useState<View>('loading');
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async () => {
    const result = await api.me();
    if (result.user) {
      setUser(result.user);
      setView('authenticated');
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
    return <Authenticated user={user} />;
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
