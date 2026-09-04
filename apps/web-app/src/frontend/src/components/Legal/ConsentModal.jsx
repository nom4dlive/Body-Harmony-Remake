import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, Lock, ChevronRight } from 'lucide-react';
import { useLicenciadaAuth as useStudentAuth } from '../../context/LicenciadaAuthContext';
import { api } from '../../services/api';
import { LGPD_CONTENT_V2 } from './LGPD_Text_v2';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 62, 96, 0.85); // Navy Blue opacity
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const Header = styled.div`
  background: #0A3E60; // Navy Blue
  padding: 24px;
  color: white;
  text-align: center;
`;

const Title = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  background: #fcfcfc;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #0A3E60;
`;

const TextBlock = styled.div`
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
  max-height: ${props => props.expanded ? 'none' : '60px'};
  overflow: hidden;
  position: relative;
  transition: max-height 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${props => props.expanded ? '0' : '30px'};
    background: linear-gradient(transparent, #fcfcfc);
    pointer-events: none;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #0A3E60; // Navy Blue for contrast (was Gold)
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover { text-decoration: underline; }
  
  svg { color: #ED7E13; } // Keep icon Gold
`;

const Footer = styled.div`
  padding: 24px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.primary ? `
    background: #0A3E60;
    color: white;
    &:hover { background: #051A29; transform: translateY(-2px); }
  ` : `
    background: transparent;
    color: #666;
    &:hover { background: #eee; }
  `}
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  
  input {
    margin-top: 3px;
    accent-color: #0A3E60;
    width: 18px;
    height: 18px;
  }
`;

const ConsentModal = () => {
    const { student, updateStudent } = useStudentAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);
    const [checks, setChecks] = useState({
        terms: false,
        privacy: false,
        ai_usage: true // Opt-in by default
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Trigger if login flagged pending OR local storage indicates missing terms
        // We rely on the 'consent_pending' flag from login response which should be in 'student' object if persisted?
        // Actually, AuthController returns it, but StudentAuthContext needs to store it.
        // Let's assume passed via props or context.
        // For V1, let's simpler check: verify status API on mount if student is logged in.

        const checkStatus = async () => {
            const isAlunaRoute = window.location.pathname.startsWith('/portal-aluna');
            const hasAlunaToken = localStorage.getItem('bh_aluna_token');
            
            if (student?.id && !isAlunaRoute && !hasAlunaToken) {
                try {
                    const status = await api.get('/lgpd/status');
                    if (!status || !status.terms) {
                        setIsOpen(true);
                    }
                } catch (e) {
                    console.error("LGPD Check Failed", e);
                }
            }
        };

        checkStatus();
    }, [student]);

    const handleAccept = async () => {
        if (!checks.terms || !checks.privacy) return; // Native validation

        setLoading(true);
        try {
            // 1. Terms
            await api.post('/lgpd/consent', {
                policy: 'terms',
                action: 'accepted',
                version: LGPD_CONTENT_V2.version
            });

            // 2. Privacy
            await api.post('/lgpd/consent', {
                policy: 'privacy',
                action: 'accepted',
                version: LGPD_CONTENT_V2.version
            });

            // 3. AI Usage (Optional)
            await api.post('/lgpd/consent', {
                policy: 'ai_usage',
                action: checks.ai_usage ? 'accepted' : 'revoked',
                version: LGPD_CONTENT_V2.version
            });

            // Update Context to stop asking
            updateStudent({ lgpd_status: { ...checks, last_updated: Date.now() } });
            setIsOpen(false);

        } catch (error) {
            alert("Erro ao salvar consentimento. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ModalContainer initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <Header>
                        <Title>
                            <ShieldCheck size={28} color="#ED7E13" />
                            Transparência & Privacidade
                        </Title>
                        <Subtitle>
                            Para continuar sua jornada no Body Harmony, precisamos que você revise e aceite nossos novos termos de proteção de dados.
                        </Subtitle>
                    </Header>

                    <Content>
                        <Section>
                            <SectionHeader>
                                <FileText size={20} />
                                Termos de Uso e Serviço
                            </SectionHeader>
                            <TextBlock expanded={expandedSection === 'terms'}>
                                {LGPD_CONTENT_V2.terms.intro}
                                {LGPD_CONTENT_V2.terms.sections.map((section, idx) => (
                                    <div key={idx} style={{ marginTop: 10 }}>
                                        <strong>{section.heading}</strong>
                                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                    </div>
                                ))}
                            </TextBlock>
                            <ExpandButton onClick={() => setExpandedSection(expandedSection === 'terms' ? null : 'terms')}>
                                {expandedSection === 'terms' ? 'Ler menos' : 'Ler completo'} <ChevronRight size={14} />
                            </ExpandButton>
                            <div style={{ marginTop: 12 }}>
                                <CheckboxLabel>
                                    <input type="checkbox" checked={checks.terms} onChange={e => setChecks({ ...checks, terms: e.target.checked })} />
                                    Li e aceito os Termos de Uso
                                </CheckboxLabel>
                            </div>
                        </Section>

                        <Section>
                            <SectionHeader>
                                <Lock size={20} />
                                Política de Privacidade
                            </SectionHeader>
                            <TextBlock expanded={expandedSection === 'privacy'}>
                                {LGPD_CONTENT_V2.privacy.intro}
                                {LGPD_CONTENT_V2.privacy.sections.map((section, idx) => (
                                    <div key={idx} style={{ marginTop: 10 }}>
                                        <strong>{section.heading}</strong>
                                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                    </div>
                                ))}
                            </TextBlock>
                            <ExpandButton onClick={() => setExpandedSection(expandedSection === 'privacy' ? null : 'privacy')}>
                                {expandedSection === 'privacy' ? 'Ler menos' : 'Ler completo'} <ChevronRight size={14} />
                            </ExpandButton>
                            <div style={{ marginTop: 12 }}>
                                <CheckboxLabel>
                                    <input type="checkbox" checked={checks.privacy} onChange={e => setChecks({ ...checks, privacy: e.target.checked })} />
                                    Li e aceito a Política de Privacidade
                                </CheckboxLabel>
                            </div>
                        </Section>

                        <Section style={{ borderColor: '#ED7E13', background: '#fffcf5' }}>
                            <SectionHeader style={{ color: '#d66d0a' }}>
                                🤖 Doctor Harmony (IA)
                            </SectionHeader>
                            <TextBlock expanded={true}>
                                <div dangerouslySetInnerHTML={{ __html: LGPD_CONTENT_V2.ai_usage.content }} />
                            </TextBlock>
                            <div style={{ marginTop: 12 }}>
                                <CheckboxLabel>
                                    <input type="checkbox" checked={checks.ai_usage} onChange={e => setChecks({ ...checks, ai_usage: e.target.checked })} />
                                    Permitir personalização da IA (Opcional)
                                </CheckboxLabel>
                            </div>
                        </Section>
                    </Content>

                    <Footer>
                        <Button
                            primary
                            disabled={!checks.terms || !checks.privacy || loading}
                            onClick={handleAccept}
                            style={{ opacity: (!checks.terms || !checks.privacy) ? 0.5 : 1 }}
                        >
                            {loading ? 'Processando...' : 'Confirmar e Continuar'}
                        </Button>
                    </Footer>
                </ModalContainer>
            </Overlay>
        </AnimatePresence>
    );
};

export default ConsentModal;
