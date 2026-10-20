import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  // Gracefully catch and suppress expected, benign WebSocket/HMR disconnect errors and Firestore idle stream disconnects in the sandbox
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.stack || event.reason?.message || event.reason || '');
    if (
      msg.toLowerCase().includes('websocket') || 
      msg.toLowerCase().includes('vite') || 
      msg.toLowerCase().includes('hmr') ||
      msg.toLowerCase().includes('closed without opened') ||
      msg.includes('Disconnecting idle stream') ||
      msg.includes('CANCELLED: Disconnecting idle stream') ||
      msg.includes('createWebSocketModuleRunnerTransport')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.error?.stack || event.error?.message || event.message || '');
    const filename = String(event.filename || '');
    if (
      msg.toLowerCase().includes('websocket') || 
      msg.toLowerCase().includes('vite') || 
      msg.toLowerCase().includes('hmr') ||
      msg.toLowerCase().includes('closed without opened') ||
      msg.includes('Disconnecting idle stream') ||
      msg.includes('CANCELLED: Disconnecting idle stream') ||
      msg.includes('createWebSocketModuleRunnerTransport') ||
      filename.includes('@vite/client')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
