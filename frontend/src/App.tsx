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
  const year = new Date().getFullYear();

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

  let content: JSX.Element;

  if (view === 'loading') {
    content = (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Chargement...</h1>
        </div>
      </div>
    );
  } else if (view === 'authenticated' && user) {
    content = <Main user={user} />;
  } else if (view === 'verify-email' && user) {
    content = (
      <EmailVerification
        user={user}
        onRefresh={checkAuth}
        onUserUpdate={(updatedUser) => setUser(updatedUser)}
      />
    );
  } else if (view === 'register') {
    content = (
      <Register
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setView('login')}
      />
    );
  } else {
    content = (
      <Login
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={() => setView('register')}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="app-content">{content}</div>
      <footer className="app-footer">
        <div className="footer-links">
          <a href="/terms" className="footer-link">Terms of Service</a>
          <span className="footer-separator">•</span>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
        </div>
        <div className="footer-credits">Created by xxx, yyy, zzz © {year}</div>
      </footer>
    </div>
  );
}

export default App;
