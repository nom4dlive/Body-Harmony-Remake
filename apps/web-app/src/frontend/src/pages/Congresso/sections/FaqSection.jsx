import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import AccordionFaq from '../components/AccordionFaq';
import { AURA_COLORS } from '../styles/auraGrandPrixTokens';

const Section = styled.section`
  padding: ${({ $spacing, $customSpacing }) => 
    $customSpacing || (
      $spacing === 'compact' ? '5rem 1.5rem' : 
      $spacing === 'generous' ? '9rem 1.5rem' : 
      '7rem 1.5rem'
    )};
  background: ${AURA_COLORS.surfaceLowest};
  position: relative;
  overflow: hidden;
  border-top: 1px solid ${AURA_COLORS.outlineVariant};

  @media (max-width: 768px) {
    padding: ${({ $customSpacing }) => $customSpacing ? $customSpacing : '3.5rem 1rem'};
  }
`;

const Container = styled.div`
  max-width: 860px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const SectionLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${AURA_COLORS.primary};
  margin-bottom: 0.85rem;
  text-align: center;
`;

const Title = styled(motion.h2)`
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.8rem, 3.8vw, 2.8rem);
  font-weight: 900;
  color: #FFFFFF;
  text-align: center;
  margin: 0 auto 4rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    margin: 0 auto 2rem;
  }

  span {
    background: ${AURA_COLORS.goldGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const FAQ_ITEMS = [
  {
    question: 'O evento é apenas para profissionais da área?',
    answer:
      'Não. O Congresso é aberto a qualquer pessoa interessada em EMS, saúde, bem-estar ou em empreender no mercado fitness de alta performance. Profissionais de saúde, esteticistas, personal trainers, empreendedores e investidores são todos bem-vindos.',
  },
  {
    question: 'Preciso me deslocar até São Paulo? Como funciona a logística?',
    answer:
      'O Espaço Full Sales fica em frente ao Shopping JK Iguatemi, a apenas 10 passos do metrô/trem e a 15 minutos do Aeroporto de Congonhas — o que facilita enormemente para quem vem de outros estados. Recomendamos chegar na noite anterior para aproveitar o dia completo sem pressa.',
  },
  {
    question: 'Poderei praticar ou vivenciar EMS no evento?',
    answer:
      'O Congresso inclui demonstrações práticas de EMS com aparelhos de última geração e sessões hands-on conduzidas pelas especialistas da rede.',
  },
  {
    question: 'O que está incluído no Ingresso Experience?',
    answer:
      'O Ingresso Experience dá acesso completo a todas as palestras científicas e práticas do Congresso, feira de expositores e tecnologias, assento reservado com mesa e tomada individual e networking ativo.',
  },
  {
    question: 'Como funciona o crédito do Ingresso VIP no Licenciamento?',
    answer:
      'O valor integral de R$ 1.497 do ingresso VIP é 100% convertido em crédito direto na adesão ao Licenciamento Territorial Body Harmony. Você não gasta nada a mais: seu ingresso vira investimento no seu próprio estúdio.',
  },
  {
    question: 'O Ingresso VIP realmente tem apenas 40 vagas?',
    answer:
      'Sim. O coquetel privativo com Josi e Kaprice é um ambiente intimista e executivo — por isso o número de vagas VIP é estritamente limitado a 40 pessoas. Quando esgotar, não haverá reposição.',
  },
  {
    question: 'Posso parcelar o ingresso?',
    answer:
      'Sim. Ambos os ingressos podem ser parcelados no cartão de crédito em até 12x via checkout seguro oficial. As condições são apresentadas no momento da compra.',
  },
];

export default function FaqSection({ settings = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const label = settings.congresso_faq_label || 'FAQ';
  const title = settings.congresso_faq_title || 'Perguntas Frequentes';
  const customSpacing = settings.congresso_spacing_faq;
  const customTitleSize = settings.congresso_size_faq_title;

  let faqList = FAQ_ITEMS;
  if (settings.congresso_faq_json) {
    try {
      const parsed = typeof settings.congresso_faq_json === 'string'
        ? JSON.parse(settings.congresso_faq_json)
        : settings.congresso_faq_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        faqList = parsed;
      }
    } catch (e) {
      faqList = FAQ_ITEMS;
    }
  }

  return (
    <Section id="faq" ref={ref} $customSpacing={customSpacing}>
      <Container>
        <SectionLabel>{label}</SectionLabel>
        <Title
          $customSize={customTitleSize}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{title}</span>
        </Title>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <AccordionFaq items={faqList} />

          {settings.congresso_whatsapp_active !== 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                Ainda tem alguma dúvida específica sobre o Congresso?
              </p>
              <a
                href={`https://wa.me/${(settings.congresso_whatsapp_number || '5518996959486').replace(/\D/g, '')}?text=${encodeURIComponent(settings.congresso_whatsapp_message || 'Olá! Gostaria de tirar dúvidas sobre o 1º Congresso Brasileiro de Musculação Elétrica.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <MessageCircle size={18} />
                {settings.congresso_whatsapp_button_text || 'Dúvidas no WhatsApp'}
              </a>
            </div>
          )}
        </motion.div>
      </Container>
    </Section>
  );
}


