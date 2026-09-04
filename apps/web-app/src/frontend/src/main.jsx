import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { StyleSheetManager } from 'styled-components'
import isPropValid from '@emotion/is-prop-valid'
import App from './App.jsx'
// GlobalStyles, ThemeProvider and GestorDarkStyles are inside DynamicThemeWrapper
import { AuthProvider } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { GestorThemeProvider } from './context/GestorThemeContext.jsx'
import { DynamicThemeWrapper } from './context/DynamicThemeWrapper.jsx'

import ErrorBoundary from './components/ErrorBoundary.jsx'
import ScrollToHashElement from './components/Utils/ScrollToHashElement.jsx'

// 🛡️ Self-Healing Chunk Preload Listener (Vite Post-Deploy Recovery)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Vite] Preload error detected (chunk mismatch pós-deploy). Auto-reloading...', event);
    const lastReload = parseInt(window.sessionStorage.getItem('bh_vite_preload_ts') || '0', 10);
    const now = Date.now();
    // Allow auto-reload if last reload was more than 10 seconds ago
    if (now - lastReload > 10000) {
      window.sessionStorage.setItem('bh_vite_preload_ts', now.toString());
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <StyleSheetManager shouldForwardProp={isPropValid}>
          <BrowserRouter>
            <ScrollToHashElement />
            <AuthProvider>
              <DataProvider>
                <GestorThemeProvider>
                  <DynamicThemeWrapper>
                    <App />
                  </DynamicThemeWrapper>
                </GestorThemeProvider>
              </DataProvider>
            </AuthProvider>
          </BrowserRouter>
        </StyleSheetManager>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
