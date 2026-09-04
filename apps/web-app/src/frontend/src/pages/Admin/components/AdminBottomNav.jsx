import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FaHome, FaVideo, FaUsers, FaBars } from 'react-icons/fa';
import { ROUTES } from '../../../config/routes';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px; // Increased touch target
  background: rgba(10, 62, 96, 0.95); // Primary with slight transparency
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
  padding-bottom: env(safe-area-inset-bottom); // Support for iPhone X+

  @media (min-width: 769px) {
    display: none; // Hide on desktop
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme?.colors?.textLight || '#cbd5e1'};
  text-decoration: none;
  font-size: 0.75rem;
  gap: 6px;
  flex: 1;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &.active {
    color: ${({ theme }) => theme?.colors?.secondary || '#ed7e13'};
    
    // Active Indicator Top
    &::after {
      content: '';
      position: absolute;
      top: 0;
      width: 40%;
      height: 3px;
      background: ${({ theme }) => theme?.colors?.secondary || '#ed7e13'};
      border-radius: 0 0 4px 4px;
      box-shadow: 0 2px 8px ${({ theme }) => theme?.colors?.secondary || '#ed7e13'};
    }
  }

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    font-size: 1.4rem;
    margin-bottom: 2px;
  }
`;

const MenuButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme?.colors?.textLight || '#cbd5e1'};
  background: none;
  border: none;
  font-size: 0.75rem;
  gap: 6px;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.95);
  }

  svg {
    font-size: 1.4rem;
    margin-bottom: 2px;
  }
`;

const AdminBottomNav = ({ onMenuClick }) => {
  return (
    <NavContainer>
      <NavItem to={ROUTES.ADMIN_DASHBOARD} end>
        <FaHome />
        <span>Início</span>
      </NavItem>

      <NavItem to={`${ROUTES.ADMIN}/lms`}>
        <FaVideo />
        <span>LMS</span>
      </NavItem>

      <NavItem to={`${ROUTES.ADMIN}/licenciadas`}>
        <FaUsers />
        <span>licenciadas</span>
      </NavItem>

      <MenuButton onClick={onMenuClick}>
        <FaBars />
        <span>Menu</span>
      </MenuButton>
    </NavContainer>
  );
};

export default AdminBottomNav;
