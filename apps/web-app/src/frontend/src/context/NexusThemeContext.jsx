import React, { createContext, useContext } from 'react';
import { ThemeProvider } from 'styled-components';

// Nexus Brand Identity (Dark Mode Protocol)
const nexusTheme = {
    colors: {
        primary: '#ED7E13', // Doctor Harmony Gold
        secondary: '#0A3E60', // Navy Blue
        background: '#050505', // Deep Void
        surface: '#111111',
        text: '#E0E0E0',
        accent: '#00FF94', // Cyber Green (Status: Good)
        danger: '#FF4D4D', // Alert Red
        warning: '#FFC107',
        muted: '#666666',
        border: '#333333'
    },
    typography: {
        fontFamily: "'Courier New', monospace",
        headingFont: "'Montserrat', sans-serif"
    },
    spacing: (factor) => `${factor * 8}px`
};

const NexusThemeContext = createContext(nexusTheme);

export const useNexusTheme = () => useContext(NexusThemeContext);

export const NexusThemeProvider = ({ children }) => {
    return (
        <NexusThemeContext.Provider value={nexusTheme}>
            <ThemeProvider theme={nexusTheme}>
                {children}
            </ThemeProvider>
        </NexusThemeContext.Provider>
    );
};
