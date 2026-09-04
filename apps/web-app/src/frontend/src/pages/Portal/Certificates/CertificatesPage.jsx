import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaAward, FaGraduationCap, FaDownload, FaCheckCircle, FaLock, 
  FaClock, FaBookOpen, FaSpinner, FaArrowRight, FaShieldAlt, 
  FaStar, FaQuestionCircle, FaChevronRight, FaPlayCircle
} from 'react-icons/fa';
import { PortalNavbar } from '../components/PortalNavbar';
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar';
import { api } from '../../../services/api';
import { ROUTES } from '../../../config/routes';
import QuizModal from '../components/QuizModal';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors?.darkBg || '#051A29'};
  background-image: 
    radial-gradient(circle at 100% 0%, rgba(237, 126, 19, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(10, 62, 96, 0.15) 0%, transparent 50%),
    linear-gradient(to bottom, #051A29 0%, #0A3E60 100%);
  background-attachment: fixed;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;

  @media (min-width: 769px) {
    padding-bottom: 40px;
  }
`;

const ContentWrapper = styled.main`
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 4%;
`;

const HeaderArea = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.25rem;

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 4px 12px;
    background: rgba(237, 126, 19, 0.15);
    border: 1px solid rgba(237, 126, 19, 0.4);
    color: #ED7E13;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
  }

  h1 {
    font-family: ${({ theme }) => theme.fonts?.heading || 'inherit'};
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    color: #FFFFFF;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    svg {
      color: #ED7E13;
    }
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const MasterCertCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(10, 62, 96, 0.8) 0%, rgba(5, 26, 41, 0.95) 100%);
  border: 1.5px solid ${({ $isEligible }) => $isEligible ? '#ED7E13' : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 20px;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ $isEligible }) => $isEligible ? '0 12px 40px rgba(237, 126, 19, 0.25)' : '0 8px 30px rgba(0, 0, 0, 0.3)'};
  backdrop-filter: blur(12px);
  margin-bottom: 3rem;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, ${({ $isEligible }) => $isEligible ? 'rgba(237, 126, 19, 0.2)' : 'rgba(49, 107, 156, 0.1)'} 0%, transparent 70%);
    pointer-events: none;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 1rem;

    @media (max-width: 768px) {
      flex-direction: column;
    }

    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 6px 16px;
      border-radius: 50px;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: ${({ $isEligible }) => $isEligible ? '#10B981' : 'rgba(255, 255, 255, 0.1)'};
      color: #FFFFFF;
      border: 1px solid ${({ $isEligible }) => $isEligible ? '#059669' : 'rgba(255, 255, 255, 0.2)'};
    }
  }

  .title-group {
    h2 {
      font-family: ${({ theme }) => theme.fonts?.heading || 'inherit'};
      font-size: clamp(1.4rem, 3vw, 1.9rem);
      margin: 0 0 0.5rem 0;
      color: #FFFFFF;
    }

    .meta {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.88rem;
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;

      span {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
    }
  }

  .checklist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }

  .check-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.9rem;

    .icon {
      font-size: 1.4rem;
      color: ${({ $done }) => $done ? '#10B981' : '#ED7E13'};
      flex-shrink: 0;
    }

    .text {
      h4 {
        margin: 0 0 0.2rem 0;
        font-size: 0.95rem;
        color: #FFFFFF;
      }
      p {
        margin: 0;
        font-size: 0.78rem;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .download-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;

    .notice {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      max-width: 550px;
    }
  }
`;

const PrimaryDownloadButton = styled.button`
  background: linear-gradient(135deg, #ED7E13 0%, #FF8F26 100%);
  color: #FFFFFF;
  border: none;
  padding: 0.9rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 6px 20px rgba(237, 126, 19, 0.35);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 50px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(237, 126, 19, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts?.heading || 'inherit'};
  font-size: 1.4rem;
  color: #FFFFFF;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  svg {
    color: #ED7E13;
  }
`;

const QuizzesTable = styled.div`
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 3rem;

  .quiz-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    gap: 1rem;
    transition: background 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    @media (max-width: 650px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }

  .quiz-info {
    display: flex;
    align-items: center;
    gap: 0.9rem;

    .icon-status {
      font-size: 1.3rem;
      color: ${({ $passed }) => $passed ? '#10B981' : '#ED7E13'};
      flex-shrink: 0;
    }

    .names {
      strong {
        display: block;
        color: #FFFFFF;
        font-size: 0.95rem;
        margin-bottom: 0.2rem;
      }
      span {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }

  .quiz-action {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;

    .score {
      font-weight: 700;
      font-size: 0.9rem;
      color: ${({ $passed }) => $passed ? '#10B981' : '#ED7E13'};
    }
  }
`;

const ActionLinkButton = styled.button`
  background: rgba(49, 107, 156, 0.2);
  border: 1px solid rgba(49, 107, 156, 0.4);
  color: #4DB8FF;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: #0A3E60;
    border-color: #4DB8FF;
    color: #FFFFFF;
  }
`;

const SpecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const SpecCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .tag {
      background: rgba(237, 126, 19, 0.15);
      color: #ED7E13;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
    }
  }

  h4 {
    margin: 0.5rem 0 0.3rem 0;
    font-size: 1.1rem;
    color: #FFFFFF;
  }

  p {
    margin: 0;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.4;
  }

  .foot {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const ShopPromoCard = styled.div`
  background: linear-gradient(135deg, rgba(237, 126, 19, 0.15) 0%, rgba(10, 62, 96, 0.4) 100%);
  border: 1px dashed rgba(237, 126, 19, 0.4);
  border-radius: 16px;
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }

  .text {
    h4 {
      font-size: 1.15rem;
      color: #FFFFFF;
      margin: 0 0 0.3rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      svg {
        color: #ED7E13;
      }
    }
    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.88rem;
    }
  }
`;

export default function CertificatesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState(null);
  const [activeQuizModule, setActiveQuizModule] = useState(null);

  useEffect(() => {
    fetchCertificatesStatus();
  }, []);

  const fetchCertificatesStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getLicenciadaCertificatesStatus();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Erro ao carregar certificados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMaster = async () => {
    try {
      setDownloading(true);
      await api.downloadMasterCertificate();
    } catch (err) {
      alert(err.message || 'Erro ao baixar certificado');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSpec = async (moduleId) => {
    try {
      await api.generateCertificate(moduleId);
    } catch (err) {
      alert(err.message || 'Erro ao baixar certificado');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PortalNavbar />
        <ContentWrapper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <FaSpinner className="spin" size={40} style={{ color: '#ED7E13' }} />
          <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </ContentWrapper>
        <BottomNavbar />
      </PageContainer>
    );
  }

  const master = data?.master_course;
  const specializations = data?.specializations || [];
  const isMasterEligible = Boolean(master?.is_eligible) || Boolean(master?.certificate);

  return (
    <PageContainer>
      <PortalNavbar />

      <ContentWrapper>
        <HeaderArea>
          <div className="tag">
            <FaShieldAlt /> Certificação Oficial Body Harmony
          </div>
          <h1>
            <FaAward /> Meus Certificados
          </h1>
          <p>
            Acompanhe seu avanço acadêmico, aproveitamento nas avaliações e emita seus certificados profissionais autenticados.
          </p>
        </HeaderArea>

        {/* Master Course Certificate Card */}
        <MasterCertCard $isEligible={isMasterEligible}>
          <div className="card-top">
            <div className="title-group">
              <h2>{master?.title || 'Formação Profissional Método Body Harmony'}</h2>
              <div className="meta">
                <span><FaClock /> Carga Horária: {master?.workload_hours || 60}h</span>
                <span><FaBookOpen /> {master?.completed_lessons || 0} de {master?.total_lessons || 0} aulas</span>
                <span><FaStar style={{ color: '#ED7E13' }} /> Média: {master?.average_score || 0}%</span>
              </div>
            </div>

            <div className="badge-status">
              {isMasterEligible ? (
                <><FaCheckCircle /> Concluído & Disponível</>
              ) : (
                <><FaLock /> Em Andamento ({master?.progress_percent || 0}%)</>
              )}
            </div>
          </div>

          <div className="checklist-grid">
            <div className="check-item" style={{ borderLeft: `3px solid ${master?.progress_percent === 100 && (master?.total_lessons || 0) > 0 ? '#10B981' : '#ED7E13'}` }}>
              <div className="icon">
                {master?.progress_percent === 100 && (master?.total_lessons || 0) > 0 ? <FaCheckCircle style={{ color: '#10B981' }} /> : <FaClock style={{ color: '#ED7E13' }} />}
              </div>
              <div className="text">
                <h4>Aulas da Formação</h4>
                <p>{master?.completed_lessons || 0}/{master?.total_lessons || 0} aulas assistidas ({master?.progress_percent || 0}%)</p>
              </div>
            </div>

            <div className="check-item" style={{ borderLeft: `3px solid ${(master?.total_quizzes || 0) > 0 && (master?.passed_quizzes || 0) >= (master?.total_quizzes || 1) ? '#10B981' : '#ED7E13'}` }}>
              <div className="icon">
                {(master?.total_quizzes || 0) > 0 && (master?.passed_quizzes || 0) >= (master?.total_quizzes || 1) ? <FaCheckCircle style={{ color: '#10B981' }} /> : <FaQuestionCircle style={{ color: '#ED7E13' }} />}
              </div>
              <div className="text">
                <h4>Avaliações dos Módulos</h4>
                <p>{master?.passed_quizzes || 0} de {master?.total_quizzes || 0} quizzes aprovados</p>
              </div>
            </div>
          </div>

          <div className="download-bar">
            <div className="notice">
              {isMasterEligible ? (
                <span>🎉 <strong>Parabéns!</strong> Você cumpriu todos os requisitos e seu certificado oficial com selo digital está pronto para emissão.</span>
              ) : (
                <span>⚠️ Conclua todas as aulas e seja aprovada nos quizzes de cada módulo para desbloquear seu certificado.</span>
              )}
            </div>

            {isMasterEligible ? (
              <PrimaryDownloadButton onClick={handleDownloadMaster} disabled={downloading}>
                {downloading ? <FaSpinner className="spin" /> : <FaDownload />}
                {downloading ? 'Gerando PDF...' : 'Baixar Certificado Oficial (PDF)'}
              </PrimaryDownloadButton>
            ) : (
              <ActionLinkButton onClick={() => navigate(ROUTES.PORTAL_AULAS)}>
                Continuar Aulas <FaChevronRight />
              </ActionLinkButton>
            )}
          </div>
        </MasterCertCard>

        {/* Quizzes Breakdown */}
        {master?.quizzes && master.quizzes.length > 0 && (
          <>
            <SectionTitle>
              <FaQuestionCircle /> Avaliações & Quizzes da Grade Base
            </SectionTitle>
            <QuizzesTable>
              {master.quizzes.map(q => (
                <div key={q.quiz_id} className="quiz-row">
                  <div className="quiz-info">
                    <div className="icon-status">
                      {q.is_passed ? <FaCheckCircle style={{ color: '#10B981' }} /> : <FaQuestionCircle style={{ color: '#ED7E13' }} />}
                    </div>
                    <div className="names">
                      <strong>{q.quiz_title}</strong>
                      <span>{q.module_title} • Nota mínima: {q.min_score}%</span>
                    </div>
                  </div>

                  <div className="quiz-action">
                    {q.is_passed ? (
                      <span className="score" style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaCheckCircle /> Nota: {q.score}% (Aprovada)
                      </span>
                    ) : (
                      <ActionLinkButton 
                        onClick={() => setActiveQuizModule({ id: q.module_id, title: q.module_title })}
                        style={{ background: 'rgba(237, 126, 19, 0.15)', borderColor: '#ED7E13', color: '#ED7E13' }}
                      >
                        Responder Avaliação <FaChevronRight />
                      </ActionLinkButton>
                    )}
                  </div>
                </div>
              ))}
            </QuizzesTable>
          </>
        )}

        {/* Specializations Section */}
        {specializations.length > 0 && (
          <>
            <SectionTitle>
              <FaGraduationCap /> Especializações Extras & Módulos Avançados
            </SectionTitle>
            <SpecGrid>
              {specializations.map(spec => (
                <SpecCard key={spec.module_id}>
                  <div>
                    <div className="card-head">
                      <span className="tag">Especialização</span>
                      <span style={{ fontSize: '0.8rem', color: spec.is_eligible ? '#10B981' : '#94A3B8' }}>
                        {spec.progress_percent}%
                      </span>
                    </div>
                    <h4>{spec.title}</h4>
                    <p>{spec.description || 'Especialização técnica avançada do método Body Harmony.'}</p>
                  </div>

                  <div className="foot">
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      {spec.completed_lessons}/{spec.total_lessons} aulas
                    </span>

                    {spec.is_eligible ? (
                      <ActionLinkButton onClick={() => handleDownloadSpec(spec.module_id)}>
                        <FaDownload size={12} /> Certificado
                      </ActionLinkButton>
                    ) : (
                      <ActionLinkButton onClick={() => navigate(`${ROUTES.LMS}/module/${spec.module_id}`)}>
                        <FaPlayCircle size={12} /> Acessar
                      </ActionLinkButton>
                    )}
                  </div>
                </SpecCard>
              ))}
            </SpecGrid>
          </>
        )}

        {/* Shop Promo */}
        <ShopPromoCard>
          <div className="text">
            <h4><FaStar /> Quer expandir seu currículo profissional?</h4>
            <p>Conheça nossas novas especializações e módulos de aprofundamento disponíveis na loja.</p>
          </div>
          <PrimaryDownloadButton onClick={() => navigate('/shop')} style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}>
            Explorar Loja /shop <FaArrowRight />
          </PrimaryDownloadButton>
        </ShopPromoCard>

      </ContentWrapper>

      {/* Interactive Quiz Runner Modal */}
      <QuizModal
        isOpen={Boolean(activeQuizModule)}
        moduleId={activeQuizModule?.id}
        moduleTitle={activeQuizModule?.title}
        onClose={() => setActiveQuizModule(null)}
        onSuccess={() => {
          fetchCertificatesStatus();
        }}
      />

      <BottomNavbar />
    </PageContainer>
  );
}
