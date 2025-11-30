import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('❌ Root element not found.');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);