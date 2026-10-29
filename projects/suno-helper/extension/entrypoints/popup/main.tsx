import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './style.css';

const container = document.getElementById('root');
if (!container) throw new Error('popup root element missing');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
