import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLicenciadaAuth as useStudentAuth } from '../../../context/LicenciadaAuthContext';
import { api } from '../../../services/api';
import { ROUTES } from '../../../config/routes';
import { PortalNavbar } from '../components/PortalNavbar';
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar';
import { 
  FaStar, FaLock, FaWhatsapp, FaChevronDown, FaChevronUp, 
  FaPlayCircle, FaClock, FaSpinner, FaArrowLeft, FaAward, 
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTag,
  FaGraduationCap, FaBookOpen, FaShieldAlt, FaMagic, FaShoppingBag
} from 'react-icons/fa';

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
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 4%;
`;

const HeaderArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  .back-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(237, 126, 19, 0.2);
      color: #ED7E13;
      border-color: #ED7E13;
      transform: translateX(-2px);
    }
  }

  h1 {
    font-family: ${({ theme }) => theme.fonts?.heading || 'inherit'};
    font-size: clamp(1.6rem, 3.8vw, 2.3rem);
    text-transform: uppercase;
    letter-spacing: -0.5px;
    margin: 0;
    background: linear-gradient(90deg, #FFFFFF 0%, #ED7E13 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const PremiumBanner = styled.div`
  background: linear-gradient(135deg, rgba(10, 62, 96, 0.45) 0%, rgba(5, 26, 41, 0.85) 100%);
  border: 1px solid rgba(237, 126, 19, 0.35);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(237, 126, 19, 0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .badge-category {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(237, 126, 19, 0.15);
    border: 1px solid rgba(237, 126, 19, 0.45);
    color: #ED7E13;
    padding: 6px 14px;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
    letter-spacing: 0.05em;
  }

  h2 {
    font-family: ${({ theme }) => theme.fonts?.heading || 'inherit'};
    font-size: clamp(1.4rem, 3.2vw, 2rem);
    margin: 0 0 1rem;
    line-height: 1.25;
    color: #FFFFFF;
  }

  p {
    font-size: clamp(0.95rem, 1.8vw, 1.05rem);
    color: rgba(255, 255, 255, 0.88);
    margin: 0;
    line-height: 1.65;
    max-width: 860px;
  }
`;

const CommercialDisclaimerBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(237, 126, 19, 0.08);
  border: 1px solid rgba(237, 126, 19, 0.25);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2.5rem;
  backdrop-filter: blur(8px);

  .info-icon {
    color: #ED7E13;
    font-size: 1.4rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .info-text {
    h4 {
      margin: 0 0 0.25rem 0;
      color: #ED7E13;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    p {
      margin: 0;
      font-size: 0.88rem;
      color: #CBD5E1;
      line-height: 1.55;
    }
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const ModuleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const ModuleItem = styled(motion.div)`
  background: rgba(10, 62, 96, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(237, 126, 19, 0.4);
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
  }
`;

const ModuleHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 2rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  width: 100%;
  height: 100%;
  background: #051A29;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.65) saturate(0.85);
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.04);
  }

  .lock-overlay {
    position: absolute;
    inset: 0;
    background: rgba(5, 26, 41, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;

    .lock-icon-wrapper {
      width: 52px;
      height: 52px;
      background: rgba(237, 126, 19, 0.18);
      border: 2px solid rgba(237, 126, 19, 0.7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ED7E13;
      box-shadow: 0 0 18px rgba(237, 126, 19, 0.35);
    }

    span {
      font-size: 0.72rem;
      font-weight: 700;
      color: #ED7E13;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  }
`;

const ModuleInfo = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 960px) {
    padding: 1.5rem;
  }

  .course-type-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #ED7E13;
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
  }

  h3 {
    font-family: ${({ theme }) => theme.fonts?.heading || 'inherit'};
    font-size: clamp(1.3rem, 2.5vw, 1.7rem);
    margin: 0 0 0.85rem;
    color: #FFFFFF;
    line-height: 1.25;
  }

  .meta-badges {
    display: flex;
    gap: 0.6rem;
    margin-bottom: 1.1rem;
    flex-wrap: wrap;

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 5px 11px;
      border-radius: 6px;
      letter-spacing: 0.04em;
    }

    .badge-commercial {
      background: rgba(237, 126, 19, 0.14);
      color: #ED7E13;
      border: 1px solid rgba(237, 126, 19, 0.3);
    }

    .badge-lessons {
      background: rgba(255, 255, 255, 0.06);
      color: #E2E8F0;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .badge-duration {
      background: rgba(255, 255, 255, 0.06);
      color: #94A3B8;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .badge-certificate {
      background: rgba(16, 185, 129, 0.12);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
  }

  p {
    font-size: 0.92rem;
    color: #94A3B8;
    line-height: 1.6;
    margin: 0 0 1.5rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    @media (max-width: 640px) {
      flex-direction: column;
    }
  }
`;

const RequestButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  background: #25D366;
  color: #FFFFFF;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.85rem 1.65rem;
  border-radius: 8px;
  min-height: 48px;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: #20ba5a;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5);
  }

  svg {
    font-size: 1.15rem;
  }
`;

const DetailsToggleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #CBD5E1;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.85rem 1.4rem;
  border-radius: 8px;
  min-height: 48px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SyllabusContainer = styled(motion.div)`
  background: rgba(5, 26, 41, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1.5rem 2rem;

  h4 {
    margin: 0 0 1rem 0;
    color: #ED7E13;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .lesson-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.85rem;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
`;

const LessonItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
  border-radius: 8px;

  svg {
    color: rgba(237, 126, 19, 0.6);
    flex-shrink: 0;
    font-size: 1rem;
  }

  .lesson-info {
    min-width: 0;
    
    strong {
      display: block;
      font-size: 0.85rem;
      color: #F1F5F9;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    span {
      font-size: 0.75rem;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 2px;
    }
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  gap: 1rem;
  color: #94A3B8;

  svg {
    color: #ED7E13;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(10, 62, 96, 0.15);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  max-width: 600px;
  margin: 2rem auto;

  svg {
    font-size: 3rem;
    color: #10B981;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
    color: #FFFFFF;
  }

  p {
    color: #94A3B8;
    line-height: 1.6;
    margin: 0 0 2rem 0;
  }

  button {
    background: #ED7E13;
    color: #FFFFFF;
    border: none;
    font-weight: 700;
    padding: 0.85rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 15px rgba(237, 126, 19, 0.3);

    &:hover {
      background: #ff9124;
      transform: translateY(-1px);
    }
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  max-width: 600px;
  margin: 2rem auto;
  color: #EF4444;

  svg {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.3rem;
    margin: 0 0 0.5rem 0;
    color: #EF4444;
  }

  p {
    color: #CBD5E1;
    margin-bottom: 1.5rem;
  }

  button {
    background: transparent;
    border: 1px solid #EF4444;
    color: #EF4444;
    padding: 0.6rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #EF4444;
      color: white;
    }
  }
`;

export default function PremiumPage() {
  const { student, loading: authLoading } = useStudentAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [premiumModules, setPremiumModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    if (!authLoading && student) {
      loadModules();
    }
  }, [authLoading, student]);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLmsContent();
      if (Array.isArray(data)) {
        // Filtra módulos exclusivos onde a licenciada ainda não tem acesso liberado
        const filtered = data.filter(m => m.is_exclusive && !m.has_access);
        setPremiumModules(filtered);
      } else {
        throw new Error('Retorno da API inválido.');
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar as especializações extras. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSyllabus = (id) => {
    setExpandedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const calculateTotalDuration = (lessons) => {
    if (!lessons || lessons.length === 0) return '0 min';
    const totalSeconds = lessons.reduce((acc, l) => acc + (l.duration_seconds || 0), 0);
    const totalMins = Math.floor(totalSeconds / 60);
    if (totalMins < 60) return `${totalMins} min`;
    const hours = Math.floor(totalMins / 60);
    const remainingMins = totalMins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
  };

  if (authLoading || (loading && premiumModules.length === 0)) {
    return (
      <PageContainer>
        <PortalNavbar />
        <ContentWrapper>
          <LoadingState>
            <FaSpinner size={40} />
            <p>Carregando Cursos Extras & Especializações...</p>
          </LoadingState>
        </ContentWrapper>
        <BottomNavbar />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PortalNavbar />
      <ContentWrapper>
        
        <HeaderArea>
          <button className="back-btn" onClick={() => navigate(ROUTES.PORTAL_DASHBOARD)} aria-label="Voltar ao início">
            <FaArrowLeft />
          </button>
          <h1>✦ Cursos Extras & Especializações</h1>
        </HeaderArea>

        {error ? (
          <ErrorState>
            <FaExclamationTriangle />
            <h2>Ops! Erro ao carregar</h2>
            <p>{error}</p>
            <button onClick={loadModules}>Tentar Novamente</button>
          </ErrorState>
        ) : premiumModules.length === 0 ? (
          <EmptyState>
            <FaCheckCircle />
            <h2>Você possui acesso a todos os módulos disponíveis!</h2>
            <p>
              Parabéns! Todas as formações e especializações liberadas já estão disponíveis diretamente no seu painel de aulas.
            </p>
            <button onClick={() => navigate(ROUTES.PORTAL_DASHBOARD)}>Acessar Meu Painel de Aulas</button>
          </EmptyState>
        ) : (
          <>
            <PremiumBanner>
              <div className="badge-category">
                <FaStar /> Formações Complementares • Expansão Clínica
              </div>
              <h2>Especialize sua Equipe e Eleve o Faturamento da sua Clínica</h2>
              <p>
                O seu contrato de licenciamento garante acesso ilimitado a todo o ecossistema e protocolos base no painel principal. 
                Nesta área exclusiva, você encontra especializações complementares e mentorias avançadas vendidas separadamente, 
                desenvolvidas para expandir o portfólio de procedimentos da sua clínica.
              </p>
            </PremiumBanner>

            <CommercialDisclaimerBox>
              <FaInfoCircle className="info-icon" />
              <div className="info-text">
                <h4>Condições Comerciais Exclusivas para Licenciadas Body Harmony</h4>
                <p>
                  Como licenciada ativa, você tem direito a valores diferenciados e condições comerciais subsidiadas em todos os módulos extras. 
                  A liberação do conteúdo no seu portal é realizada imediatamente após a confirmação junto ao nosso suporte comercial.
                </p>
              </div>
            </CommercialDisclaimerBox>

            <ModuleGrid>
              {premiumModules.map((module, index) => {
                const firstLesson = module.lessons?.[0];
                const thumbSrc = firstLesson?.thumbnail_ref
                  ? `${import.meta.env.VITE_API_BASE || '/api'}/v1/lms/thumbnail/${firstLesson.thumbnail_ref.replace('thumbnails/', '').replace('uploads/', '')}`
                  : null;

                const isExpanded = !!expandedModules[module.id];
                const totalDuration = calculateTotalDuration(module.lessons);
                const whatsappMsg = encodeURIComponent(
                  `Olá! Gostaria de informações comerciais e valores para a compra do módulo extra "${module.title}" para licenciadas.\n\nNome: ${student?.name || 'Não cadastrado'}\nCPF: ${student?.cpf || 'Não informado'}`
                );

                return (
                  <ModuleItem
                    key={module.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <ModuleHeaderRow>
                      <ThumbnailContainer>
                        {thumbSrc ? (
                          <img src={thumbSrc} alt={module.title} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #051A29 0%, #0A3E60 100%)' }} />
                        )}
                        <div className="lock-overlay">
                          <div className="lock-icon-wrapper">
                            <FaLock size={20} />
                          </div>
                          <span>Vendido à Parte</span>
                        </div>
                      </ThumbnailContainer>

                      <ModuleInfo>
                        <div className="course-type-tag">
                          <FaTag /> Especialização Extra • Vendido Separadamente
                        </div>

                        <h3>{module.title}</h3>

                        <div className="meta-badges">
                          <span className="badge-commercial">
                            <FaStar size={10} /> Condição Exclusiva p/ Licenciadas
                          </span>
                          {module.lessons && module.lessons.length > 0 ? (
                            <>
                              <span className="badge-lessons">
                                <FaBookOpen size={10} /> {module.lessons.length} {module.lessons.length === 1 ? 'aula prática' : 'aulas práticas'}
                              </span>
                              <span className="badge-duration">
                                <FaClock size={10} /> Carga Horária: {totalDuration}
                              </span>
                            </>
                          ) : (
                            <span className="badge-duration">
                              <FaClock size={10} /> Grade em Atualização
                            </span>
                          )}
                          <span className="badge-certificate">
                            <FaAward size={10} /> Certificação Inclusa
                          </span>
                        </div>

                        <p>{module.description || 'Nenhuma descrição fornecida para este módulo.'}</p>

                        <div className="action-buttons">
                          <RequestButton
                            as="button"
                            onClick={() => navigate('/shop')}
                            id={`premium-request-shop-${module.id}`}
                            style={{ border: 'none', cursor: 'pointer' }}
                          >
                            <FaShoppingBag /> Adquirir Especialização no Shop
                          </RequestButton>

                          <DetailsToggleBtn onClick={() => toggleSyllabus(module.id)}>
                            {isExpanded ? (
                              <>Ocultar Grade Curricular <FaChevronUp /></>
                            ) : (
                              <>Ver Grade Curricular <FaChevronDown /></>
                            )}
                          </DetailsToggleBtn>
                        </div>
                      </ModuleInfo>
                    </ModuleHeaderRow>

                    <AnimatePresence>
                      {isExpanded && (
                        <SyllabusContainer
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4><FaBookOpen /> Grade Curricular do Módulo</h4>
                          {module.lessons && module.lessons.length > 0 ? (
                            <div className="lesson-list">
                              {module.lessons.map((lesson, idx) => (
                                <LessonItem key={lesson.id}>
                                  <FaPlayCircle />
                                  <div className="lesson-info">
                                    <strong>{idx + 1}. {lesson.title}</strong>
                                    <span>
                                      <FaClock size={10} /> {formatDuration(lesson.duration_seconds)}
                                    </span>
                                  </div>
                                </LessonItem>
                              ))}
                            </div>
                          ) : (
                            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
                              As videoaulas práticas e materiais complementares desta especialização estão sendo finalizados e serão publicados em breve.
                            </p>
                          )}
                        </SyllabusContainer>
                      )}
                    </AnimatePresence>
                  </ModuleItem>
                );
              })}
            </ModuleGrid>
          </>
        )}

      </ContentWrapper>
      <BottomNavbar />
    </PageContainer>
  );
}
