import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './Settings.css';

export function Settings() {
  const [appDataDir, setAppDataDir] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppDataDir();
  }, []);

  const loadAppDataDir = async () => {
    try {
      const dir = await invoke<string>('get_app_data_dir');
      setAppDataDir(dir);
    } catch {
      setAppDataDir('Unable to load');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDataFolder = async () => {
    try {
      await invoke('open_data_folder');
    } catch {
      alert('Could not open data folder');
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('This will delete all forms and settings. Are you sure?')) return;
    if (!window.confirm('This action cannot be undone. Continue?')) return;
    
    try {
      await invoke('reset_app_data');
      alert('App data reset. Please restart the application.');
    } catch {
      alert('Failed to reset data');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="page-subtitle">Manage application preferences and data</p>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h2>Data & Storage</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Application Data Folder</h3>
              <p>All forms and settings are stored locally in this folder</p>
            </div>
            <div className="setting-value">
              <code>{isLoading ? 'Loading...' : appDataDir}</code>
              <button className="btn btn-sm btn-outline" onClick={handleOpenDataFolder} disabled={isLoading}>
                📂 Open Folder
              </button>
            </div>
          </div>
          
          <div className="setting-item danger-zone">
            <div className="setting-info">
              <h3>Reset All Data</h3>
              <p>Permanently delete all forms, settings, and cached data</p>
            </div>
            <button className="btn btn-sm btn-danger" onClick={handleResetData}>
              🗑 Reset Data
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2>Converter Settings</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Default Font</h3>
              <p>Kruti Dev 010 is recommended for best results in MS Word</p>
            </div>
            <div className="setting-value">
              <span className="font-badge">Kruti Dev 010</span>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Encoding</h3>
              <p>Unicode → Kruti Dev 010 byte encoding (offline)</p>
            </div>
            <div className="setting-value">
              <span className="font-badge">Local Conversion</span>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Application</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Version</h3>
              <p>Current application version</p>
            </div>
            <div className="setting-value">
              <span className="version-badge">1.0.0</span>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Offline Mode</h3>
              <p>All core features work without internet connection</p>
            </div>
            <div className="setting-value">
              <span className="status-badge online">● Offline Ready</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}