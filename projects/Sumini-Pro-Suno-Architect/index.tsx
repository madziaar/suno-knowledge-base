import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';

/**
 * Safer & cleaner entry point
 * - Ensures root exists
 * - Supports future hydration upgrade
 * - Keeps StrictMode
 */

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('❌ Root element not found.');

// Create React root
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);