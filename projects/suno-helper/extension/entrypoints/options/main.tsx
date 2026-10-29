import React from 'react';
import ReactDOM from 'react-dom/client';

import Options from './App';
import '../popup/style.css';

const container = document.getElementById('root');
if (!container) throw new Error('options root element missing');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
);
