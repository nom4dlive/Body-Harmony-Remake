import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Shield, FileText, X } from 'lucide-react';
import { api } from '../../../services/api';
import { LGPD_CONTENT_V2 } from '../../../components/Legal/LGPD_Text_v2';

const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const slideUp = keyframes`from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  margin: 2rem auto 0;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: white;
  margin-bottom: 1.5rem;
  font-family: ${({ theme }) => theme.fonts?.heading || 'sans-serif'};
  svg { color: #ED7E13; }
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  &:last-child { border-bottom: none; }
`;

const Info = styled.div`
  flex: 1;
  padding-right: 20px;
  h4 { color: #fff; margin-bottom: 4px; font-size: 1rem; }
  p  { color: #94A3B8; font-size: 0.85rem; line-height: 1.4; }
`;

const Toggle = styled.button`
  width: 50px; height: 28px; border-radius: 15px;
  background: ${p => p.active ? '#10B981' : '#334155'};
  position: relative; border: none;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: background 0.3s;
  &::after {
    content: ''; position: absolute; top: 2px;
    left: ${p => p.active ? '24px' : '2px'};
    width: 24px; height: 24px; border-radius: 50%;
    background: white; transition: left 0.3s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const ReviewBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: rgba(237, 126, 19, 0.12);
  border: 1px solid rgba(237, 126, 19, 0.3);
  color: #ED7E13; font-size: 0.82rem; font-weight: 600;
  padding: 8px 14px; border-radius: 10px;
  cursor: pointer; white-space: nowrap;
  transition: all 0.2s;
  &:hover { background: rgba(237, 126, 19, 0.22); border-color: #ED7E13; }
`;

/* ── Modal Overlay ── */
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  animation: ${fadeIn} 0.25s ease;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, #0C2D44, #0A3E60);
  border: 1px solid rgba(237,126,19,0.2);
  border-radius: 1.25rem; width: 100%; max-width: 640px;
  max-height: 80vh; display: flex; flex-direction: column;
  animation: ${slideUp} 0.3s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
`;

const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  h3 { color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 8px; }
  h3 svg { color: #ED7E13; }
`;

const CloseBtn = styled.button`
  background: rgba(255,255,255,0.08); border: none;
  width: 32px; height: 32px; border-radius: 8px;
  color: #fff; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.15); }
`;

const TabBar = styled.div`
  display: flex; border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0 1.5rem; gap: 4px;
`;

const Tab = styled.button`
  padding: 10px 16px; border: none; background: none;
  color: ${p => p.active ? '#ED7E13' : 'rgba(255,255,255,0.5)'};
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
  border-bottom: 2px solid ${p => p.active ? '#ED7E13' : 'transparent'};
  transition: all 0.2s;
  &:hover { color: #fff; }
`;

const ModalBody = styled.div`
  flex: 1; overflow-y: auto; padding: 1.5rem;
  color: rgba(255,255,255,0.85); font-size: 0.88rem; line-height: 1.6;
  h3 { color: #ED7E13; font-size: 1rem; margin: 1.2rem 0 0.5rem; }
  ul { padding-left: 1.2rem; }
  li { margin-bottom: 0.5rem; }
  a  { color: #ED7E13; }
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(237,126,19,0.3); border-radius: 3px; }
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.08);
  text-align: center;
  span { color: rgba(255,255,255,0.35); font-size: 0.75rem; }
`;

/* ── TermsReviewModal ── */
const TermsReviewModal = ({ onClose }) => {
  const [tab, setTab] = useState('terms');
  const tabs = [
    { key: 'terms',   label: LGPD_CONTENT_V2.terms.title },
    { key: 'privacy', label: LGPD_CONTENT_V2.privacy.title },
    { key: 'ai',      label: LGPD_CONTENT_V2.ai_usage.title },
  ];

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h3><FileText size={20} /> Revisão dos Termos</h3>
          <CloseBtn onClick={onClose}><X size={18} /></CloseBtn>
        </ModalHeader>

        <TabBar>
          {tabs.map(t => (
            <Tab key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </Tab>
          ))}
        </TabBar>

        <ModalBody>
          {tab === 'terms' && (
            <>
              <p>{LGPD_CONTENT_V2.terms.intro}</p>
              {LGPD_CONTENT_V2.terms.sections.map((s, i) => (
                <div key={i}>
                  <h3>{s.heading}</h3>
                  <div dangerouslySetInnerHTML={{ __html: s.content }} />
                </div>
              ))}
            </>
          )}
          {tab === 'privacy' && (
            <>
              <p>{LGPD_CONTENT_V2.privacy.intro}</p>
              {LGPD_CONTENT_V2.privacy.sections.map((s, i) => (
                <div key={i}>
                  <h3>{s.heading}</h3>
                  <div dangerouslySetInnerHTML={{ __html: s.content }} />
                </div>
              ))}
            </>
          )}
          {tab === 'ai' && (
            <div dangerouslySetInnerHTML={{ __html: LGPD_CONTENT_V2.ai_usage.content }} />
          )}
        </ModalBody>

        <ModalFooter>
          <span>Versão {LGPD_CONTENT_V2.version} · Body Harmony Educacao LTDA</span>
        </ModalFooter>
      </ModalCard>
    </Overlay>
  );
};

/* ── PrivacySettings (Main) ── */
const PrivacySettings = () => {
    const [status, setStatus] = useState({ terms: false, privacy: false, ai_usage: false });
    const [loading, setLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => { loadStatus(); }, []);

    const loadStatus = async () => {
        try {
            const data = await api.get('/lgpd/status');
            if (data) setStatus(data);
        } catch (error) {
            console.error("Failed to load privacy status", error);
        }
    };

    const toggleAi = async () => {
        setLoading(true);
        const newAction = !status.ai_usage ? 'accepted' : 'revoked';
        try {
            await api.post('/lgpd/consent', {
                policy: 'ai_usage',
                action: newAction,
                version: 'v1.0'
            });
            setStatus(prev => ({ ...prev, ai_usage: !prev.ai_usage }));
        } catch (error) {
            alert("Erro ao atualizar consentimento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card>
                <Title><Shield size={24} /> Privacidade & Dados</Title>

                <SettingRow>
                    <Info>
                        <h4>Termos de Uso e Política de Privacidade</h4>
                        <p>Essenciais para o funcionamento da plataforma. Aceitos em {status.terms ? '✅' : '❌'}.</p>
                    </Info>
                    <ReviewBtn onClick={() => setShowTerms(true)}>
                        <FileText size={15} /> Revisar
                    </ReviewBtn>
                </SettingRow>

                <SettingRow>
                    <Info>
                        <h4>Personalização da IA (Doctor Harmony)</h4>
                        <p>Permite que a IA use seu nome e contexto das aulas para oferecer respostas mais precisas.</p>
                    </Info>
                    <Toggle active={status.ai_usage} onClick={toggleAi} disabled={loading} />
                </SettingRow>
            </Card>

            {showTerms && <TermsReviewModal onClose={() => setShowTerms(false)} />}
        </>
    );
};

export default PrivacySettings;
