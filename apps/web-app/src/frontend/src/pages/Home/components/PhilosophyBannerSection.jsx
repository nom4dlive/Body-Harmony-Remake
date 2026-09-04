import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FaLightbulb, FaHandHoldingHeart, FaBalanceScale, FaSpa, FaBullseye } from 'react-icons/fa'
import { useData } from '../../../context/DataContext'
import { getSafeContent, editorAttr } from '../../../utils/configUtils'

const Section = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%);
  position: relative;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const Title = styled(motion.h2)`
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 3rem);
  color: #0A3E60;
  text-align: center;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const Subtitle = styled(motion.div)`
  background: #316B9C;
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  text-align: center;
  padding: 1rem 2rem;
  margin: 0 auto 3rem;
  max-width: 600px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 2px;
`

const TextBlock = styled(motion.div)`
  background: rgba(221, 143, 57, 0.1);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  
  p {
    font-family: 'Poppins', sans-serif;
    font-weight: 300;
    font-size: 1.125rem;
    color: #0A3E60;
    line-height: 1.6;
    text-align: justify;
    margin: 0;
  }
`

const ImpactQuote = styled(motion.div)`
  background: linear-gradient(135deg, white 0%, rgba(49, 107, 156, 0.1) 100%);
  padding: 2.5rem;
  border-radius: 12px;
  margin-bottom: 3rem;
  
  p {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.25rem;
    color: #316B9C;
    line-height: 1.8;
    text-align: center;
    font-style: italic;
    margin: 0;
    
    strong {
      color: #0A3E60;
    }
  }
`

const PillarsTitle = styled(motion.h3)`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: clamp(1.8rem, 4vw, 2.2rem);
  color: #0A3E60;
  text-align: center;
  margin: 4rem 0 3rem;
  text-transform: uppercase;
`

const PillarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const PillarCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid #316B9C;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(49, 107, 156, 0.15);
  }
`

const IconWrapper = styled(motion.div)`
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #0A3E60 0%, #316B9C 100%);
  color: white;
  font-size: 1.8rem;
`

const PillarTitle = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #0A3E60;
  margin-bottom: 1rem;
`

const PillarText = styled.p`
  font-family: 'Poppins', sans-serif;
  font-weight: 300;
  font-size: 1rem;
  color: #316B9C;
  line-height: 1.6;
`

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
}

const DEFAULT_PILLARS = [
  { icon: 'FaLightbulb', title: 'Inovação', text: 'Métodos avançados e eficazes' },
  { icon: 'FaHandHoldingHeart', title: 'Cuidado', text: 'Paciente no centro de tudo' },
  { icon: 'FaBalanceScale', title: 'Ética', text: 'Integridade profissional absoluta' },
  { icon: 'FaSpa', title: 'Bem-estar', text: 'Saúde holística além da aparência' },
  { icon: 'FaBullseye', title: 'Resultados', text: 'Compromisso com transformação real' }
]

const iconMap = {
  FaLightbulb: <FaLightbulb />,
  FaHandHoldingHeart: <FaHandHoldingHeart />,
  FaBalanceScale: <FaBalanceScale />,
  FaSpa: <FaSpa />,
  FaBullseye: <FaBullseye />
}

export default function PhilosophyBannerSection() {
  const { siteConfig } = useData()

  const title = getSafeContent(siteConfig, 'home_philosophy_banner', 'title', 'NOSSA VISÃO')
  const subtitle = getSafeContent(siteConfig, 'home_philosophy_banner', 'subtitle', 'TRANSFORMAR VIDAS ALÉM DO SUPERFICIAL')
  const description = getSafeContent(siteConfig, 'home_philosophy_banner', 'description', 'Ao me aprofundar no mundo da estética, identifiquei uma lacuna significativa: métodos que eram frequentemente padronizados, superficiais e mal aplicados.')
  const quote = getSafeContent(siteConfig, 'home_philosophy_banner', 'quote', 'Não tratamos apenas celulite ou flacidez.<br /><strong>Tratamos a autoestima, a saúde metabólica e a confiança de cada paciente.</strong>')
  const pillarsTitle = getSafeContent(siteConfig, 'home_philosophy_banner', 'pillarsTitle', 'NOSSOS PILARES')
  const pillars = siteConfig?.home_philosophy_banner?.pillars || DEFAULT_PILLARS

  return (
    <Section>
      <Container>
        <Title
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          {...editorAttr('home_philosophy_banner', 'title')}
        >
          {title}
        </Title>

        <Subtitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          {...editorAttr('home_philosophy_banner', 'subtitle')}
        >
          {subtitle}
        </Subtitle>

        <TextBlock
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          {...editorAttr('home_philosophy_banner', 'description')}
        >
          <p>{description}</p>
        </TextBlock>

        <ImpactQuote
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          {...editorAttr('home_philosophy_banner', 'quote')}
        >
          <p dangerouslySetInnerHTML={{ __html: quote }} />
        </ImpactQuote>

        <PillarsTitle
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          {...editorAttr('home_philosophy_banner', 'pillarsTitle')}
        >
          {pillarsTitle}
        </PillarsTitle>

        <PillarsGrid>
          {pillars.map((pillar, index) => (
            <PillarCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <IconWrapper animate={pulseAnimation}>
                {iconMap[pillar.icon] || <FaLightbulb />}
              </IconWrapper>
              <PillarTitle>{pillar.title}</PillarTitle>
              <PillarText>{pillar.text}</PillarText>
            </PillarCard>
          ))}
        </PillarsGrid>
      </Container>
    </Section>
  )
}
