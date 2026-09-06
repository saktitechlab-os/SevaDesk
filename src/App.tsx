import { useState, useEffect } from 'react';
import { Converter } from './components/Converter';
import { FormsLibrary } from './components/FormsLibrary';
import { Settings } from './components/Settings';
import { About } from './components/About';
import { WelcomeScreen } from './components/WelcomeScreen';
import './App.css';

type View = 'converter' | 'forms' | 'settings' | 'about';

const navItems: { id: View; label: string; icon: string }[] = [
  { id: 'converter', label: 'Converter', icon: '⌨' },
  { id: 'forms', label: 'Forms Library', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'about', label: 'About', icon: 'ℹ' },
];

export function App() {
  const [currentView, setCurrentView] = useState<View>('converter');
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    const hasLaunched = localStorage.getItem('sevadesk_launched');
    if (!hasLaunched) {
      localStorage.setItem('sevadesk_launched', 'true');
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
    setIsFirstLaunch(false);
  }, []);

  if (isFirstLaunch) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">⌨</span>
          <span className="app-title">SevaDesk</span>
          <span className="app-tagline">Hindi Typing & Forms Library</span>
        </div>
        <div className="header-right">
          <span className="offline-badge">● Offline Mode</span>
        </div>
      </header>

      <div className="app-body">
        <nav className="sidebar" role="navigation" aria-label="Main navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentView(item.id)}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="sidebar-footer">
            <span className="version">v1.0.0</span>
          </div>
        </nav>

        <main className="main-content" role="main">
          {showWelcome && (
            <WelcomeScreen onClose={() => setShowWelcome(false)} />
          )}
          
          {!showWelcome && (
            <>
              {currentView === 'converter' && <Converter />}
              {currentView === 'forms' && <FormsLibrary />}
              {currentView === 'settings' && <Settings />}
              {currentView === 'about' && <About />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;