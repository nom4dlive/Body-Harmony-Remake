import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const GestorThemeContext = createContext({
  themeMode: 'light', // 'light' | 'dark' | 'system'
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {}
});

export const useGestorTheme = () => useContext(GestorThemeContext);
export const useLicenciadaTheme = () => useContext(GestorThemeContext);
export const useAlunaTheme = () => useContext(GestorThemeContext);
export const useAppTheme = () => useContext(GestorThemeContext);

export function GestorThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('gestor_theme_mode') || localStorage.getItem('bh_theme_mode');
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      console.warn('LocalStorage error reading theme mode:', e);
    }
    return 'light'; // Light as safe default, or system
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to OS dark mode change
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

  const setThemeMode = useCallback((mode) => {
    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') return;
    setThemeModeState(mode);
    try {
      localStorage.setItem('gestor_theme_mode', mode);
      localStorage.setItem('bh_theme_mode', mode);
      window.dispatchEvent(new CustomEvent('gestor-theme-changed', { detail: { mode, isDark: mode === 'dark' || (mode === 'system' && systemPrefersDark) } }));
    } catch (e) {
      console.warn('LocalStorage error saving theme mode:', e);
    }
  }, [systemPrefersDark]);

  const toggleTheme = useCallback(() => {
    // If currently dark, toggle to 'light'. Otherwise toggle to 'dark'.
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  // Global Keyboard Shortcut: Ctrl + Shift + D (or Cmd + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  // Set theme data attributes on document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const modeAttr = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-gestor-theme', modeAttr);
      document.documentElement.setAttribute('data-licenciada-theme', modeAttr);
      document.documentElement.setAttribute('data-aluna-theme', modeAttr);
      document.documentElement.setAttribute('data-theme', modeAttr);
    }
  }, [isDark]);

  return (
    <GestorThemeContext.Provider value={{ themeMode, isDark, toggleTheme, setThemeMode }}>
      {children}
    </GestorThemeContext.Provider>
  );
}
