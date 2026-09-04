import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

export const AURA_COLORS = {
  surface: '#121414',
  surfaceDim: '#121414',
  surfaceBright: '#37393a',
  surfaceLowest: '#0c0f0f',
  surfaceLow: '#1a1c1c',
  surfaceDefault: '#1e2020',
  surfaceHigh: '#282a2b',
  surfaceHighest: '#333535',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#d0c5af',
  inverseSurface: '#e2e2e2',
  inverseOnSurface: '#2f3131',
  outline: '#99907c',
  outlineVariant: '#4d4635',
  surfaceTint: '#e9c349',
  primary: '#f2ca50',
  onPrimary: '#0a0a0a',
  primaryContainer: '#d4af37',
  onPrimaryContainer: '#554300',
  inversePrimary: '#735c00',
  secondary: '#c9c6c5',
  onSecondary: '#313030',
  secondaryContainer: '#4a4949',
  onSecondaryContainer: '#bab8b7',
  tertiary: '#e4ce6d',
  onTertiary: '#393000',
  tertiaryContainer: '#c8b354',
  onTertiaryContainer: '#514500',
  primaryFixed: '#ffe088',
  primaryFixedDim: '#e9c349',
  onPrimaryFixed: '#241a00',
  goldGradient: 'linear-gradient(45deg, #B8860B 0%, #D4AF37 50%, #F9E27E 100%)',
  goldGradientText: 'linear-gradient(45deg, #B8860B 0%, #D4AF37 40%, #F9E27E 100%)',
  background: '#121414',
  blackObsidian: '#0a0a0a',
  onBackground: '#e2e2e2',
  textWhite: '#FFFFFF',
  goldThreadBorder: '1px solid #4d4635',
  goldThreadBright: '1px solid #d4af37',
};

export const AURA_SPACING = {
  unit: '8px',
  containerMax: '1440px',
  gutter: '32px',
  marginDesktop: '80px',
  marginMobile: '20px',
  sectionGap: '120px',
};

export const lightBeam = keyframes`
  0% { left: -100%; }
  50%, 100% { left: 200%; }
`;

export const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

export const pulseSubtle = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.95; }
`;

export const AuraShimmerText = styled.span`
  background: linear-gradient(to right, #D4AF37 20%, #FFF4D0 40%, #FFF4D0 60%, #D4AF37 80%);
  background-size: 200% auto;
  color: #000;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite, ${pulseSubtle} 4s ease-in-out infinite;
  display: inline-block;
  font-weight: 900;
`;

export const AuraDivider = styled.div`
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #d4af37 50%, transparent 100%);
  margin: ${({ $margin }) => $margin || '3rem 0'};
  border: none;
`;

export const AuraBadgeChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #0a0a0a;
  border: 1px solid #d4af37;
  border-radius: 9999px;
  color: #f9e27e;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 0.5rem 1.4rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);

  svg {
    color: #f2ca50;
  }
`;

const goldLiquidFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const AuraButtonPrimary = styled(motion.button)`
  min-height: 54px;
  padding: 1.05rem 2.6rem;
  background: linear-gradient(125deg, #B8860B 0%, #D4AF37 25%, #FFF4D0 50%, #FBBF24 75%, #B8860B 100%);
  background-size: 250% 250%;
  animation: ${goldLiquidFlow} 6s ease infinite;
  color: #070B0E;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid #FFF4D0;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35), 0 0 15px rgba(251, 191, 36, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 1;

  span, strong, em {
    color: #070B0E !important;
    font-weight: 900 !important;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5) !important;
    -webkit-text-fill-color: #070B0E !important;
    background: none !important;
  }

  svg {
    color: #070B0E;
    filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.5));
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    transform: skewX(-25deg);
    animation: ${lightBeam} 3.5s ease-in-out infinite;
    pointer-events: none;
    z-index: 2;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 11px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
    pointer-events: none;
    z-index: 2;
  }

  &:hover {
    filter: brightness(1.08);
    box-shadow: 0 8px 30px rgba(212, 175, 55, 0.55), 0 0 25px rgba(251, 191, 36, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

export const AuraButtonGhost = styled(motion.button)`
  min-height: 52px;
  padding: 1rem 2.5rem;
  background: transparent;
  color: #f2ca50;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid #d4af37;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    color: #f9e27e;
    border-color: #f9e27e;
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const AuraCard = styled(motion.div)`
  background: #1a1c1c;
  border: 1px solid #4d4635;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #B8860B 0%, #D4AF37 50%, #F9E27E 100%);
  }
`;

