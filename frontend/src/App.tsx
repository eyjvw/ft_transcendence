import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Main from './components/Main';
import Profile from './components/Profile';
import { api } from './services/api';
import type { User } from './types/auth';

type View = 'loading' | 'login' | 'register' | 'authenticated' | 'profile';

function App() {
  const [view, setView] = useState<View>('loading');
  const [user, setUser] = useState<User | null>(null);
  const year = new Date().getFullYear();
  const { t, i18n } = useTranslation();

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

  useEffect(() => {
    const lang = user?.language ?? 'en';
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [user, i18n]);

  const handleAuthSuccess = () => {
    checkAuth();
  };

  let content: JSX.Element;

  if (view === 'loading') {
    content = (
      <div className="auth-container">
        <div className="auth-card">
          <h1>{t('common.loading')}</h1>
        </div>
      </div>
    );
  } else if (view === 'authenticated' && user) {
    content = <Main user={user} onOpenProfile={() => setView('profile')} />;
  } else if (view === 'profile' && user) {
    content = (
      <Profile
        user={user}
        onBack={() => setView('authenticated')}
        onUserUpdate={(updatedUser) => {
          setUser(updatedUser);
        }}
        onLogout={async () => {
          await api.logout();
          setUser(null);
          setView('login');
        }}
        currentLanguage={user.language ?? 'en'}
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
          <a href="/terms" className="footer-link">{t('footer.terms')}</a>
          <span className="footer-separator">•</span>
          <a href="/privacy" className="footer-link">{t('footer.privacy')}</a>
        </div>
        <div className="footer-credits">
          {t('footer.createdBy', { names: 'xxx, yyy, zzz', year })}
        </div>
      </footer>
    </div>
  );
}

export default App;
