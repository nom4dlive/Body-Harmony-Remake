import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CongressoPage from '../src/pages/Congresso/CongressoPage';

// Mock all shaders and countdown intervals
vi.mock('../src/pages/Congresso/components/AuraShaderBackground', () => ({
  default: () => <div data-testid="aura-shader-mock" />,
}));
vi.mock('../src/pages/Congresso/components/GoldDustParticles', () => ({
  default: () => <div data-testid="gold-dust-mock" />,
}));
vi.mock('../src/pages/Congresso/components/CosmicMeshShader', () => ({
  default: () => <div data-testid="cosmic-mesh-mock" />,
}));
vi.mock('../src/pages/Congresso/components/GoldenNebulaFluidShader', () => ({
  default: () => <div data-testid="golden-nebula-mock" />,
}));
vi.mock('../src/pages/Congresso/components/VipShaderParticles', () => ({
  default: () => <div data-testid="vip-shader-mock" />,
}));
vi.mock('../src/pages/Congresso/hooks/useCountdown', () => ({
  default: () => ({ days: 10, hours: 5, minutes: 30, seconds: 45, expired: false }),
  useCountdown: () => ({ days: 10, hours: 5, minutes: 30, seconds: 45, expired: false }),
}));

// Mock shopApi globally
vi.mock('../src/services/api.js', () => ({
  shopApi: {
    getSettings: vi.fn().mockResolvedValue({ data: {} }),
    getPublicSettings: vi.fn().mockResolvedValue({ data: {} }),
    getProducts: vi.fn().mockResolvedValue({ data: [] }),
  },
  onboardingApi: {},
  contractsApi: {},
  rbacApi: {},
  api: {},
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock framer-motion useInView
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useInView: () => true,
  };
});

describe('CongressoPage Render Test', () => {
  it('renders CongressoPage cleanly without throwing styled-components errors', async () => {
    let container;
    await act(async () => {
      const rendered = render(
        <MemoryRouter initialEntries={['/congresso']}>
          <CongressoPage />
        </MemoryRouter>
      );
      container = rendered.container;
    });
    expect(container).toBeDefined();
    expect(container.querySelector('header')).toBeDefined();
  }, 15000);
});
