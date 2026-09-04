import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FaRocket, FaShieldAlt, FaMoneyBillWave, FaMagic, FaCogs, FaCheckCircle, FaServer } from 'react-icons/fa'

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0A3E60 0%, #05263d 100%);
  color: white;
  padding: 4rem 2rem;
  font-family: 'Outfit', sans-serif;
`

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
`

const Header = styled(motion.header)`
  text-align: center;
  margin-bottom: 5rem;

  h1 {
    font-size: 3rem;
    background: linear-gradient(to right, #ED7E13, #FCD34D);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    opacity: 0.8;
  }
`

const Section = styled(motion.section)`
  margin-bottom: 5rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
`

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    border-color: #ED7E13;
  }

  h3 {
    margin: 1rem 0;
    font-size: 1.5rem;
    color: #FFF;
  }

  p {
    color: #CCC;
    line-height: 1.6;
    font-size: 0.95rem;
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #ED7E13;
  }
`

const PricingCard = styled(motion.div)`
  background: white;
  color: #0A3E60;
  padding: 3rem;
  border-radius: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);

  &::before {
    content: 'OFERTA PARCEIRO';
    position: absolute;
    top: 20px;
    right: -30px;
    background: #ED7E13;
    color: white;
    padding: 0.5rem 3rem;
    transform: rotate(45deg);
    font-weight: bold;
    font-size: 0.8rem;
  }

  .price {
    font-size: 3.5rem;
    font-weight: 800;
    color: #0A3E60;
    margin: 1rem 0;
    
    span {
      font-size: 1rem;
      opacity: 0.6;
      font-weight: normal;
    }
  }

  .market-price {
    text-decoration: line-through;
    color: #999;
    font-size: 1.1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 2rem 0;
    text-align: left;
    
    li {
      margin-bottom: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 1rem;
    }

    svg {
      color: #10B981;
    }
  }
`

const MaintenanceSection = styled(motion.div)`
  background: rgba(10, 62, 96, 0.6);
  border: 1px solid #ED7E13;
  border-radius: 20px;
  padding: 2rem;
  margin-top: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }

  div {
    flex: 1;
  }
  
  h3 {
    color: #ED7E13;
    margin-bottom: 0.5rem;
  }
`

const ComparisonTable = styled(motion.div)`
  margin-top: 5rem;
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  padding: 2rem;

  h3 { margin-bottom: 2rem; text-align: center; }

  .row {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    
    &:last-child { border-bottom: none; }
  }

  .feature { font-weight: bold; }
  .body-harmony { color: #10B981; font-weight: bold; }
  .others { color: #EF4444; opacity: 0.7; }
`

export default function Proposal() {
    return (
        <PageContainer>
            <ContentWrapper>

                <Header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        style={{ fontSize: '4rem', marginBottom: '1rem' }}
                    >
                        🚀
                    </motion.div>
                    <h1>Ecossistema Body Harmony 6.0</h1>
                    <p>Mais que um site. Uma plataforma de ensino e vendas proprietária.</p>
                </Header>

                <Section>
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>O que construímos?</h2>
                    <Grid>
                        <Card whileHover={{ scale: 1.05 }}>
                            <div className="icon"><FaMagic /></div>
                            <h3>LMS Próprio (Netflix-style)</h3>
                            <p>Nada de pagar taxas para Hotmart ou Kiwify. Uma área de membros exclusiva, segura e focada na experiência do aluno.</p>
                        </Card>

                        <Card whileHover={{ scale: 1.05 }}>
                            <div className="icon"><FaShieldAlt /></div>
                            <h3>Proteção DRM-Lite</h3>
                            <p>Sistema anti-pirataria que bloqueia downloads e impede o compartilhamento de senhas via "Device Control".</p>
                        </Card>

                        <Card whileHover={{ scale: 1.05 }}>
                            <div className="icon"><FaRocket /></div>
                            <h3>Marketing Integrado</h3>
                            <p>Landing Pages de alta conversão e Galeria de Resultados dinâmica, tudo gerenciável por você.</p>
                        </Card>
                    </Grid>
                </Section>

                <Section>
                    <ComparisonTable
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h3>💰 Economia Real</h3>
                        <div className="row">
                            <span className="feature">Taxa por Venda</span>
                            <span className="body-harmony">0% (Seu Sistema)</span>
                            <span className="others">9.9% + R$ 2,49 (Hotmart)</span>
                        </div>
                        <div className="row">
                            <span className="feature">Faturamento em Lançamento de 100k</span>
                            <span className="body-harmony">R$ 100.000,00</span>
                            <span className="others">R$ 89.000,00</span>
                        </div>
                        <div className="row">
                            <span className="feature">Controle dos Dados</span>
                            <span className="body-harmony">Totalmente Seu (SQL Próprio)</span>
                            <span className="others">Plataforma Terceira</span>
                        </div>
                    </ComparisonTable>
                </Section>

                <Section style={{ marginTop: '5rem', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '3rem' }}>Investimento Único</h2>
                    <PricingCard
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <p className="market-price">Valor de Mercado: R$ 15.000,00</p>
                        <div className="price">R$ 8.500,00 <span>/ único</span></div>
                        <p style={{ color: '#666' }}>Código-Fonte 100% Seu (Propriedade Intelectual)</p>

                        <hr style={{ margin: '2rem 0', borderColor: '#eee' }} />

                        <ul>
                            <li><FaCheckCircle /> Sistema Vitalício (Sem mensalidade de plataforma)</li>
                            <li><FaCheckCircle /> Login Seguro com Reconhecimento de Dispositivo</li>
                            <li><FaCheckCircle /> Área Administrativa Completa</li>
                            <li><FaCheckCircle /> Landing Page V3 Otimizada</li>
                        </ul>
                    </PricingCard>

                    <MaintenanceSection>
                        <div style={{ textAlign: 'left' }}>
                            <h3><FaCogs /> Manutenção Mensal (Opcional)</h3>
                            <p>Para você dormir tranquila. Inclui: Monitoramento de Segurança, Backups Semanais, Suporte Técnico e Pequenos Ajustes.</p>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            R$ 350,00 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/mês</span>
                        </div>
                    </MaintenanceSection>
                </Section>

                <motion.div
                    style={{ textAlign: 'center', marginTop: '5rem', opacity: 0.5, fontSize: '0.9rem' }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.5 }}
                >
                    <FaServer /> Infraestrutura hospedada na Hostinger. Tecnologia React + PHP 8 + MySQL.
                </motion.div>

            </ContentWrapper>
        </PageContainer>
    )
}
