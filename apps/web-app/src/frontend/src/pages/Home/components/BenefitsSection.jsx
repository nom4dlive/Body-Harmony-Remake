import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import {
  FaWeight,
  FaHandHoldingHeart,
  FaDumbbell,
  FaHeart,
  FaHandsHelping,
  FaShieldAlt
} from 'react-icons/fa'
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

const Intro = styled(motion.p)`
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: clamp(1.1rem, 2.5vw, 1.3rem);
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  max-width: 900px;
  margin: 0 auto 4rem;
  line-height: 1.6;
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`

const BenefitCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(237, 126, 19, 0.15);
  }
`

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.secondary} 0%, #DD8F39 100%);
  color: white;
  font-size: 1.8rem;
`

const CardTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`

const CardDescription = styled.p`
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-size: 1.1rem;
  color: #316B9C;
  line-height: 1.6;
`

const CTABox = styled(motion.div)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #316B9C 100%);
  padding: 2rem;
  border-radius: 50px;
  text-align: center;
  
  @media (max-width: 768px) {
    border-radius: 20px;
  }
  
  p {
    font-family: 'Bison Bold', sans-serif;
    font-weight: 600;
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    color: white;
    line-height: 1.6;
    margin: 0;
    
    strong {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }
`

const DEFAULT_BENEFITS = [
  { icon: 'FaWeight', title: 'Emagrecimento', description: 'acelera o metabolismo muscular, aumenta o gasto energético e potencializa a queima de gordura.' },
  { icon: 'FaHandHoldingHeart', title: 'Flacidez', description: 'devolve firmeza ao tecido ao reestruturar o músculo que sustenta a pele.' },
  { icon: 'FaDumbbell', title: 'Ganho de massa muscular', description: 'ativa fibras profundas responsáveis por densidade e hipertrofia real.' },
  { icon: 'FaHeart', title: 'Sarcopenia', description: 'fortalece músculos enfraquecidos, recuperando força, função e autonomia corporal.' },
  { icon: 'FaHandsHelping', title: 'Fibromialgia', description: 'auxilia no alívio de dores, melhora circulação, mobilidade e resposta neuromuscular.' },
  { icon: 'FaShieldAlt', title: 'Incontinência urinária', description: 'fortalece o assoalho pélvico, melhorando o controle muscular e a qualidade de vida.' }
]

const iconMap = {
  FaWeight: <FaWeight />,
  FaHandHoldingHeart: <FaHandHoldingHeart />,
  FaDumbbell: <FaDumbbell />,
  FaHeart: <FaHeart />,
  FaHandsHelping: <FaHandsHelping />,
  FaShieldAlt: <FaShieldAlt />
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function BenefitsSection() {
  const { siteConfig } = useData()

  const intro = getSafeContent(siteConfig, 'home_benefits', 'intro', 'O Body Harmony atua de forma profunda sobre a musculatura, que é a base estrutural do corpo, e por isso trata diretamente:')
  const benefits = siteConfig?.home_benefits?.benefits || siteConfig?.site_benefits || DEFAULT_BENEFITS
  const ctaText = getSafeContent(siteConfig, 'home_benefits', 'ctaText', 'Por atuar diretamente no músculo, o Body Harmony não trata apenas a estética superficial.<br />Ele <strong>corrige a base do corpo</strong> e é isso que permite resultados reais, funcionais e visíveis.')

  return (
    <Section id="beneficios">
      <Container>
        <Intro
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          {...editorAttr('home_benefits', 'intro')}
        >
          {intro}
        </Intro>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <CardsGrid>
            {benefits.map((benefit, index) => (
              <BenefitCard key={index} variants={cardVariants}>
                <IconWrapper>{iconMap[benefit.icon] || <FaDumbbell />}</IconWrapper>
                <CardTitle>{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </BenefitCard>
            ))}
          </CardsGrid>
        </motion.div>

        <CTABox
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          {...editorAttr('home_benefits', 'ctaText')}
        >
          <p dangerouslySetInnerHTML={{ __html: ctaText }} />
        </CTABox>
      </Container>
    </Section>
  )
}
