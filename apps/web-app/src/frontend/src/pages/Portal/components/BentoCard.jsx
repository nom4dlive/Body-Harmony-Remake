import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardWrapper = styled(motion.div)`
  background: ${({ $theme, theme }) =>
        $theme === 'navy' ? 'rgba(10, 62, 96, 0.4)' :
            $theme === 'gold' ? 'rgba(237, 126, 19, 0.15)' :
                'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${({ $theme, theme }) =>
        $theme === 'navy' ? 'rgba(49, 107, 156, 0.5)' :
            $theme === 'gold' ? 'rgba(237, 126, 19, 0.3)' :
                theme.colors.glassBorder};
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.2);
  
  /* Gradiente condicional para o Glassmorphism 2.0 */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: 0;
    pointer-events: none;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.3);
    border-color: ${({ $theme }) =>
        $theme === 'navy' ? 'rgba(49, 107, 156, 0.8)' :
            $theme === 'gold' ? 'rgba(237, 126, 19, 0.6)' :
                'rgba(255, 255, 255, 0.2)'};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ $theme, theme }) => $theme === 'gold' ? theme.colors.secondary : '#FFFFFF'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
  }

  .icon {
    font-size: 1.2rem;
    color: ${({ $theme, theme }) => $theme === 'gold' ? theme.colors.secondary : theme.colors.blueLight};
  }
`;

export const BentoCard = ({ title, icon, themeColor = 'default', action, children, className, delay = 0 }) => {
    return (
        <CardWrapper
            $theme={themeColor}
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Header $theme={themeColor}>
                <h3>
                    <span className="icon">{icon}</span>
                    {title}
                </h3>
                {action && <div className="action">{action}</div>}
            </Header>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </CardWrapper>
    );
};
