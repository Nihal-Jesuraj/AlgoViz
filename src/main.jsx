import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css?v=brutalist-fix';
import App from './App.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'

import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
