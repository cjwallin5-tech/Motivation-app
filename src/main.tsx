import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Registered only in production builds — in dev, a service worker would cache Vite's HMR
// modules and fight the dev server. './sw.js' (relative, like every other public asset here)
// keeps this working whether the app is served from the domain root or a subpath.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // ignore — worst case the app just isn't cached for offline use
    })
  })
}
