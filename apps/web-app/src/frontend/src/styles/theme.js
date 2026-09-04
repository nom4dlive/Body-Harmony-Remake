export const theme = {
  colors: {
    // Brand Core (Clinical Trust)
    primary: '#0A3E60', // Azul Escuro
    secondary: '#ED7E13', // Laranja Vivo

    // Palette V2 Spec
    blueDark: '#0A3E60',
    blueLight: '#316B9C',
    orange: '#ED7E13',
    orangeLight: '#DD8F39',

    // Neutrals
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#0A3E60', // Clinical Blue Text
    textLight: '#546E7A', // Blueish Gray
    white: '#FFFFFF',
    grayDark: '#222222',
    grayMedium: '#444444',
    borderWhite10: 'rgba(255, 255, 255, 0.1)',
    borderWhite20: 'rgba(255, 255, 255, 0.2)',

    // Legacy Mappings (Backward Compatibility)
    dark: '#0A3E60',
    light: '#F5F5F5',
    premium: '#0A3E60', // Was Black, now Blue Dark
    premiumLight: '#316B9C', // Was Dark Gray, now Blue Light
    accentGold: '#ED7E13', // Was Gold, now Orange
    accentGoldHover: '#DD8F39',
    textPrim: '#0A3E60', // INVERTED: Was White, now Dark (for Light BG)
    textSec: '#546E7A', // INVERTED: Was Gray, now BlueGray
    divider: '#316B9C',

    success: '#00B090',
    error: '#FC5185',
    whatsapp: '#25D366',

    // Cinema/Dark Mode Tokens (V3 Refinement)
    darkBg: '#051A29', // Deep Navy
    darkSurface: 'rgba(10, 62, 96, 0.4)', // Glass Primary
    darkText: '#FFFFFF',
    darkTextMuted: 'rgba(255, 255, 255, 0.5)',
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  },
  fonts: {
    heading: "'Bison', 'Oswald', sans-serif", // Condensed Bold
    body: "'Montserrat', sans-serif", // Clean Modern
    detail: "'Poppins', sans-serif", // Light Details
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
    large: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
}
