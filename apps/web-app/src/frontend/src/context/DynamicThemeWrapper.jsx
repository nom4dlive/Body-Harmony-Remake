import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from '../styles/GlobalStyles'
import { GestorDarkStyles } from '../styles/GestorDarkStyles'
import { theme as baseTheme } from '../styles/theme' // Base theme (Typography, Breakpoints)
import { useData } from './DataContext'
import { useGestorTheme } from './GestorThemeContext'

export function DynamicThemeWrapper({ children }) {
  const { siteConfig } = useData()
  const { isDark } = useGestorTheme()
  
  // Get colors from config or fallback to base
  const customColors = siteConfig?.theme_settings?.colors || {}
  
  const darkThemeColors = isDark ? {
    background: '#051524',
    surface: '#0A233A',
    card: '#0D2A44',
    cardSubtle: '#071D30',
    light: '#071D30',
    inputBg: '#06192B',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    heading: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.12)',
    darkTextMuted: '#94A3B8',
  } : {}

  // Merge base theme with custom colors and dark theme colors
  const currentTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...customColors,
      ...darkThemeColors
    }
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <GestorDarkStyles />
      {children}
    </ThemeProvider>
  )
}

