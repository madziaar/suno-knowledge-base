import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AudioProvider } from './contexts/AudioContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { UIProvider } from './contexts/UIContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { PromptProvider } from './contexts/PromptContext';
import ErrorBoundary from './components/shared/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AudioProvider>
        <SettingsProvider>
          <UIProvider>
            <HistoryProvider>
              <PromptProvider>
                <App />
              </PromptProvider>
            </HistoryProvider>
          </UIProvider>
        </SettingsProvider>
      </AudioProvider>
    </ErrorBoundary>
  </React.StrictMode>
);