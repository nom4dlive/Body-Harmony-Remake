import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'Bison';
    src: url('/fonts/Bison-Bold.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Bison Bold';
    src: url('/fonts/Bison-Bold.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 16px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text}; /* Dark Text */
    background-color: ${({ theme }) => theme.colors.background}; /* White BG */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: 700; /* Bold headings */
    text-transform: uppercase; /* All caps style */
    line-height: 1.1;
    color: ${({ theme }) => theme.colors.primary};
  }

  h1 { 
    font-size: clamp(2.5rem, 5vw, 4rem); 
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  h2 { font-size: clamp(2rem, 4vw, 3rem); }
  h3 { font-size: clamp(1.5rem, 3vw, 2.25rem); }
  h4 { font-size: clamp(1.25rem, 2.5vw, 1.75rem); }

  a {
    color: inherit;
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.fast};
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  ul, ol {
    list-style: none;
  }

  .container {
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    html {
      font-size: 14px;
    }
  }
`
