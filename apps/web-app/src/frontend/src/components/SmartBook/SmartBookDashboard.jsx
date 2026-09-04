import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  FaBook, FaCheckCircle, FaSpinner, FaSyncAlt, 
  FaHeadphones, FaProjectDiagram, FaChevronRight, FaLock
} from 'react-icons/fa';
import { smartbookMultiTenancyApi } from '../../services/api';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  color: #E8EAED;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 62, 96, 0.35);
  border: 1px solid rgba(237, 126, 19, 0.25);
  border-radius: 16px;
  padding: 16px 20px;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #ffffff;
    font-weight: 700;
  }

  p {
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: #94a3b8;
  }
`;

const SectionCard = styled.div`
  background: #0B1626;
  border: 1px solid #1E3A5F;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .icon {
        color: #ED7E13;
      }
    }
  }
`;

const GridList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ED7E13;
    background: rgba(237, 126, 19, 0.06);
    transform: translateY(-2px);
  }

  .card-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 6px;
  }

  .card-desc {
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }
`;

const ActionBtn = styled.button`
  background: ${props => props.$primary ? 'linear-gradient(135deg, #ED7E13, #b85e09)' : 'rgba(255, 255, 255, 0.08)'};
  border: 1px solid ${props => props.$primary ? '#ED7E13' : 'rgba(255, 255, 255, 0.15)'};
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function SmartBookDashboard() {
  const navigate = useNavigate();
  const authData = JSON.parse(localStorage.getItem('bh_auth') || '{}');
  const user = authData.user || { id: 'licenciada_default', name: 'Licenciada' };

  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);

  // Cadernos Template Oficiais da Plataforma
  const TEMPLATES = [
    {
      id: '1',
      title: '📘 Módulo 1: Fundamentos & Biofísica da Eletroestimulação',
      desc: 'Cronaxia, parâmetros de pulso (60-85Hz, 250-350µs) e fisiologia do estímulo motor.'
    },
    {
      id: '2',
      title: '📘 Módulo 2: Protocolo 3S & Prática Clínica',
      desc: 'Sensibilização, Saturação e Sustentação com foco em glúteos e abdômen.'
    },
    {
      id: '3',
      title: '📘 Módulo 3: Biossegurança & Mapeamento Anatômico',
      desc: 'Pontos motores, calibração de rampas e condutas de segurança.'
    }
  ];

  useEffect(() => {
    loadUserInstances();
  }, []);

  const loadUserInstances = async () => {
    try {
      setLoading(true);
      const list = await smartbookMultiTenancyApi.getUserInstances(user.id);
      setInstances(list || []);
    } catch (err) {
      console.error('Erro ao carregar instâncias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotebook = async (notebookId, title) => {
    try {
      setOpeningId(notebookId);
      const inst = await smartbookMultiTenancyApi.getOrCreateInstance(notebookId, user.id, title);
      navigate(`/portal-licenciada/smartbook/notebook/${inst.id}`);
    } catch (err) {
      console.error('Erro ao abrir caderno:', err);
      alert('Não foi possível inicializar seu espaço privado no caderno.');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <DashboardContainer>
      <HeaderBox>
        <div>
          <h2>SmartBook Studio — Espaço do Conhecimento</h2>
          <p>Seus cadernos de estudo com IA e isolamento total por licenciada.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ED7E13', fontSize: '0.85rem', fontWeight: '600' }}>
          <FaLock /> Ambiente Privado
        </div>
      </HeaderBox>

      {/* SESSÃO 1: MEUS CADERNOS ATIVOS */}
      <SectionCard>
        <div className="section-header">
          <h3>
            <FaBook className="icon" /> Meus Cadernos Ativos ({instances.length})
          </h3>
          <button
            onClick={loadUserInstances}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <FaSyncAlt />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#ED7E13' }}>
            <FaSpinner className="fa-spin" /> Carregando seus cadernos...
          </div>
        ) : instances.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '10px 0' }}>
            Você ainda não abriu nenhum caderno. Escolha um dos cadernos disponíveis abaixo para começar.
          </div>
        ) : (
          <GridList>
            {instances.map((inst) => (
              <Card key={inst.id}>
                <div>
                  <div className="card-title">📖 {inst.title}</div>
                  <div className="card-desc">
                    Última atividade: {inst.updated_at ? new Date(inst.updated_at).toLocaleDateString('pt-BR') : 'Hoje'}
                  </div>
                </div>
                <div className="card-footer">
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>🔒 Instância Privada</span>
                  <ActionBtn
                    $primary
                    onClick={() => navigate(`/portal-licenciada/smartbook/notebook/${inst.id}`)}
                  >
                    Continuar <FaChevronRight />
                  </ActionBtn>
                </div>
              </Card>
            ))}
          </GridList>
        )}
      </SectionCard>

      {/* SESSÃO 2: CADERNOS DISPONÍVEIS */}
      <SectionCard>
        <div className="section-header">
          <h3>
            <FaBook className="icon" /> Cadernos Disponíveis (Aulas & Fontes Oficiais)
          </h3>
        </div>

        <GridList>
          {TEMPLATES.map((tmpl) => (
            <Card key={tmpl.id}>
              <div>
                <div className="card-title">{tmpl.title}</div>
                <div className="card-desc">{tmpl.desc}</div>
              </div>
              <div className="card-footer">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Template Base</span>
                <ActionBtn
                  $primary
                  disabled={openingId === tmpl.id}
                  onClick={() => handleOpenNotebook(tmpl.id, tmpl.title)}
                >
                  {openingId === tmpl.id ? <FaSpinner className="fa-spin" /> : 'Abrir Caderno'}
                </ActionBtn>
              </div>
            </Card>
          ))}
        </GridList>
      </SectionCard>
    </DashboardContainer>
  );
}
