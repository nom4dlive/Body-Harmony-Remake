import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  FaShieldAlt, FaCheckCircle, FaAward, FaCalendarAlt, 
  FaGraduationCap, FaStar, FaExternalLinkAlt, FaTimesCircle, FaSpinner 
} from 'react-icons/fa';
import { api } from '../../services/api';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #051A29;
  background-image: 
    radial-gradient(circle at 50% 0%, rgba(237, 126, 19, 0.12) 0%, transparent 60%),
    radial-gradient(circle at 100% 100%, rgba(10, 62, 96, 0.3) 0%, transparent 60%),
    linear-gradient(to bottom, #051A29 0%, #0A3E60 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
`;

const Card = styled(motion.div)`
  background: rgba(10, 62, 96, 0.6);
  border: 1px solid rgba(237, 126, 19, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  max-width: 680px;
  width: 100%;
  padding: 2.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(237, 126, 19, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #0A3E60 0%, #ED7E13 50%, #0A3E60 100%);
  }

  @media (max-width: 640px) {
    padding: 1.75rem;
  }
`;

const LogoArea = styled.div`
  margin-bottom: 1.5rem;
  .brand {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 2px;
    color: #FFFFFF;
  }
  .tagline {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #ED7E13;
    margin-top: 4px;
  }
`;

const SealBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10B981;
  color: #10B981;
  padding: 8px 18px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
`;

const ErrorBadge = styled(SealBadge)`
  background: rgba(239, 68, 68, 0.15);
  border-color: #EF4444;
  color: #EF4444;
`;

const StudentName = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 0.5rem;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const CourseTitle = styled.h2`
  font-size: 1.1rem;
  color: #ED7E13;
  font-weight: 600;
  margin-bottom: 1.75rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const InfoItem = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem;
  border-radius: 12px;

  .label {
    font-size: 0.75rem;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.35rem;
  }

  .value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #FFFFFF;
  }
`;

const HashArea = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed rgba(237, 126, 19, 0.3);
  border-radius: 10px;
  padding: 0.85rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: #94A3B8;
  word-break: break-all;
  margin-bottom: 1.5rem;

  .hash-label {
    display: block;
    color: #ED7E13;
    font-weight: bold;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
`;

const IssuerInfo = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.25rem;
  font-size: 0.8rem;
  color: #94A3B8;

  strong {
    color: #FFFFFF;
    display: block;
  }
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #ED7E13;
  text-decoration: none;
  font-size: 0.85rem;
  margin-top: 1.5rem;
  transition: all 0.2s;

  &:hover {
    color: #FFA34D;
    text-decoration: underline;
  }
`;

export default function CertificateVerificationPage() {
  const { hash } = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verify() {
      try {
        setLoading(true);
        const res = await api.verifyCertificate(hash);
        if (res && res.valid) {
          setCertData(res.certificate);
        } else {
          setError(res?.error || 'Certificado inválido');
        }
      } catch (err) {
        setError(err.message || 'Código de validação inexistente ou inválido');
      } finally {
        setLoading(false);
      }
    }
    if (hash) {
      verify();
    } else {
      setError('Código de validação não fornecido');
      setLoading(false);
    }
  }, [hash]);

  if (loading) {
    return (
      <PageWrapper>
        <FaSpinner className="spin" size={40} style={{ color: '#ED7E13' }} />
        <p style={{ marginTop: '1rem', color: '#94A3B8' }}>Validando autenticidade digital...</p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </PageWrapper>
    );
  }

  if (error || !certData) {
    return (
      <PageWrapper>
        <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <LogoArea>
            <div className="brand">BODY HARMONY</div>
            <div className="tagline">Autenticação Digital Oficial</div>
          </LogoArea>

          <ErrorBadge>
            <FaTimesCircle /> Certificado Não Encontrado
          </ErrorBadge>

          <p style={{ color: '#94A3B8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {error || 'Não foi possível autenticar o código informado. Verifique se o link ou QR Code escaneado está correto.'}
          </p>

          <HomeLink to="/">
            Voltar ao Portal Body Harmony
          </HomeLink>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <LogoArea>
          <div className="brand">BODY HARMONY</div>
          <div className="tagline">{certData.badge_text || 'Estética e Saúde Integrativa'}</div>
        </LogoArea>

        <SealBadge>
          <FaCheckCircle /> Certificado Válido & Registrado
        </SealBadge>

        <StudentName>{certData.student_name}</StudentName>
        <CourseTitle>{certData.course_name}</CourseTitle>

        <InfoGrid>
          <InfoItem>
            <div className="label"><FaAward /> Modalidade</div>
            <div className="value">{certData.type}</div>
          </InfoItem>

          <InfoItem>
            <div className="label"><FaStar /> Aproveitamento</div>
            <div className="value">{certData.score}%</div>
          </InfoItem>

          <InfoItem>
            <div className="label"><FaCalendarAlt /> Data de Emissão</div>
            <div className="value">{new Date(certData.issued_at).toLocaleDateString('pt-BR')}</div>
          </InfoItem>
        </InfoGrid>

        <HashArea>
          <span className="hash-label">Código Único de Autenticidade Digital</span>
          {certData.hash}
        </HashArea>

        <IssuerInfo>
          <strong>{certData.issuer_name || 'Dra. Thais Borges'}</strong>
          <span>{certData.issuer_role || 'Coordenação Técnica & Mentoria'}</span>
        </IssuerInfo>

        <HomeLink to="/">
          Acessar Portal Oficial Body Harmony
        </HomeLink>
      </Card>
    </PageWrapper>
  );
}
