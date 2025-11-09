
import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: The component is exported as `App` from './App' now.
// FIX: Changed to a default import to resolve the "no exported member 'App'" error.
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);