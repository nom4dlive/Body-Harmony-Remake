import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Activity, BarChart2, Radio, Shield, Archive, Database, Users, Server, FileCode } from 'lucide-react';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);

  @media (min-width: 769px) {
    display: none;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-size: 0.7rem;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex: 1;
  height: 100%;

  svg {
    margin-bottom: 4px;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  &.active {
    color: ${({ theme }) => theme.colors.accent};
    
    svg {
      opacity: 1;
      transform: translateY(-2px);
      filter: drop-shadow(0 0 5px ${({ theme }) => theme.colors.accent});
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const NexusBottomNav = () => {
  return (
    <NavContainer>
      <NavItem to="/nexus/watchtower">
        <Activity size={20} />
        <span>Watch</span>
      </NavItem>
      <NavItem to="/nexus/war-room">
        <BarChart2 size={20} />
        <span>War</span>
      </NavItem>
      <NavItem to="/nexus/signal-tower">
        <Radio size={20} />
        <span>Signal</span>
      </NavItem>
      <NavItem to="/nexus/testing-hub">
        <Shield size={20} />
        <span>Test</span>
      </NavItem>
      {/* 
      <NavItem to="/nexus/vault">
        <Archive size={20} />
        <span>Vault</span>
      </NavItem>
      */}
      <NavItem to="/nexus/database">
        <Database size={20} />
        <span>DB</span>
      </NavItem>
    </NavContainer>
  );
};

export default NexusBottomNav;
