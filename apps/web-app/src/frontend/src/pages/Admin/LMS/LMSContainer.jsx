import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  LayoutDashboard, Video, Users, BookOpen, KeyRound, BrainCircuit, Gamepad2, ArrowLeft, Award 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import AdminLayout from '../components/AdminLayout';
import ScrollableTabs from '../../../components/ui/ScrollableTabs';
import LMSDashboard from './LMSDashboard';
import LMSStudio from './LMSStudio';
import Licenciadas from './Licenciadas';
import ResourceLibrary from './ResourceLibrary';
import ExclusiveAccessManager from './components/ExclusiveAccessManager';
import LMSNotebooksManager from './LMSNotebooksManager';
import CertificateTemplateManager from './components/CertificateTemplateManager';

const Container = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
  color: #0A3E60;
  padding-bottom: 80px;
`;

const Header = styled.header`
  margin-bottom: 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .title-area {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    
    .title-area {
      width: 100%;
    }
  }
`;

const ReturnButton = styled.button`
  background: white;
  border: 1px solid #E2E8F0;
  color: #64748B;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-size: 0.85rem;
  min-height: 40px;

  &:hover {
    background: #F8FAFC;
    color: #0A3E60;
    border-color: #0A3E60;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Title = styled.h1`
  font-size: 1.35rem;
  font-weight: 800;
  color: #0A3E60;
  margin: 0;
  
  span {
    color: #ED7E13;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 1.15rem;
  }
`;

const LMSContainer = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const lmsTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'Content Studio', icon: Video },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'students', label: 'Licenciadas', icon: Users },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
    { id: 'exclusive', label: 'Acesso Exclusivo', icon: KeyRound },
    { id: 'notebooks', label: 'Cadernos & IA (Beta)', icon: BrainCircuit },
    { id: 'gamification', label: 'Gamificação (Beta)', icon: Gamepad2 }
  ];

  return (
    <AdminLayout>
      <Container>
        <Header>
          <div className="title-area">
            <Title>Harmony <span>Learning OS</span></Title>
          </div>
          <ReturnButton onClick={() => navigate(ROUTES.ADMIN)}>
            <ArrowLeft size={16} /> Voltar ao Portal
          </ReturnButton>
        </Header>

        <ScrollableTabs
          tabs={lmsTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'dashboard' && <LMSDashboard />}
        {activeTab === 'studio' && <LMSStudio />}
        {activeTab === 'certificates' && <CertificateTemplateManager />}
        {activeTab === 'library' && <ResourceLibrary />}
        {activeTab === 'exclusive' && <ExclusiveAccessManager />}
        {activeTab === 'notebooks' && <LMSNotebooksManager />}
        {activeTab === 'students' && <Licenciadas />}
        {activeTab === 'gamification' && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
            <h3>🚀 Em breve</h3>
            <p>O sistema de gamificação e badges está sendo desenvolvido.</p>
          </div>
        )}
      </Container>
    </AdminLayout>
  );
};

export default LMSContainer;
