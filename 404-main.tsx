import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/globals.css';
import NotFound from './src/components/NotFound';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <NotFound />
  </React.StrictMode>
);
