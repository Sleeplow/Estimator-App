import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppDataProvider } from './hooks/useLocalStorage';
import { Navigation } from './components/Navigation/Navigation';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Configuration } from './pages/Configuration/Configuration';
import { History } from './pages/History/History';
import './App.css';

export function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <HashRouter>
          <a href="#main-content" className="skip-link">Aller au contenu principal</a>
          <div className="app-shell">
            <Navigation />
            <main id="main-content" className="app-main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/config" element={<Configuration />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </AppDataProvider>
    </AuthProvider>
  );
}
