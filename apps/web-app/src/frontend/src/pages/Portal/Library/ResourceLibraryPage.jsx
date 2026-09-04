import React from 'react';
import styled from 'styled-components';
import { PortalNavbar } from '../components/PortalNavbar';
import { FaFolderOpen } from 'react-icons/fa';
import { ResourceLibrary } from '../components/ResourceLibrary';
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar';

const Container = styled.div`
  padding: 2rem max(4%, 20px);
  padding-bottom: 100px; /* Space for BottomNavbar */
  color: white;
  min-height: 100vh;
  background: linear-gradient(to bottom, #051A29 0%, #0A3E60 100%);
`;

const Header = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
  
  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #fff;
    
    svg { color: ${({ theme }) => theme.colors.secondary}; }
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkTextMuted};
    margin-top: 0.5rem;
  }
`;

const ResourceLibraryPage = () => {
  return (
    <Container>
      <PortalNavbar />
      <Header>
        <h1><FaFolderOpen /> Biblioteca de Recursos</h1>
        <p>Materiais complementares, PDFs e arquivos para download.</p>
      </Header>

      <ResourceLibrary />

      <BottomNavbar />
    </Container>
  );
};

export default ResourceLibraryPage;
