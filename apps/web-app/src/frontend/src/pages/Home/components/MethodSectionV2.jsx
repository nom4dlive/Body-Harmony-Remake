import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FaCheck, FaGraduationCap, FaHospital, FaGem, FaRocket, FaHandshake } from 'react-icons/fa'
import AnimeDivider from '../../../components/Visual/AnimeDivider'
import ImgurPlayer from '../../../components/Video/ImgurPlayer'
import { useData } from '../../../context/DataContext'
import { getSafeContent, editorAttr } from '../../../utils/configUtils'

const Section = styled.section`
  padding: 8rem 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  position: relative;
  overflow: hidden;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`

const MainTitle = styled(motion.h2)`
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 3rem);
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: -0.5px;
`

const Description = styled(motion.p)`
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-size: clamp(1.1rem, 2vw, 1.25rem);
  color: #316B9C;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
  line-height: 1.6;
  
  strong {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const SectionTitle = styled(motion.h3)`
  font-family: 'Montserrat Consensed', sans-serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 1.75rem);
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 2rem;
  text-align: left;
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 5rem;
`

const VideoCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 3rem;
  align-items: start;
  margin-bottom: 5rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`

const VideoWrapper = styled(motion.div)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
  height: fit-content;
  
  @media (max-width: 900px) {
    position: relative;
    top: 0;
  }
`

const VideoCardsColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(237, 126, 19, 0.15);
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.secondary} 0%, #DD8F39 100%);
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
`

const CardText = styled.p`
  font-family: 'Poppins Bold', sans-serif;
  font-weight: 400;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  line-height: 1.5;
  
  strong {
    font-weight: 600;
  }
`

const CTABox = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #316B9C 100%);
  border-radius: 16px;
  margin-top: 4rem;
`

const CTATitle = styled.h3`
  font-family: 'Bison Bold', sans-serif;
  font-weight: 800;
  font-size: clamp(2.9rem, 4vw, 2rem);
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
`

const CTAText = styled.p`
  font-family: 'Montserrat Black', sans-serif;
  font-weight: 400;
  font-size: 1.6rem;
  color: #ffffffff;
  font-style: italic;
  margin: 0;
`

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const DEFAULT_LEARNING_ITEMS = [
  { text: '<strong>Ler o corpo do paciente</strong>' },
  { text: '<strong>Escolher a fibra muscular correta</strong>' },
  { text: '<strong>Definir a corrente ideal</strong>' },
  { text: '<strong>Configurar parâmetros com precisão</strong>' },
  { text: '<strong>Conduzir sessões com estratégia</strong>' }
]

const DEFAULT_HARMONY_ITEMS = [
  { text: '<strong>Formação técnica avançada</strong>' },
  { text: '<strong>Metodologia validada em clínicas reais</strong>' },
  { text: '<strong>Posicionamento premium</strong>' },
  { text: '<strong>Diferencial competitivo imediato</strong>' },
  { text: '<strong>Suporte contínuo</strong>' }
]

export default function MethodSectionV2() {
  const { siteConfig } = useData()

  const title = getSafeContent(siteConfig, 'home_metodo', 'title', 'O Que é o Licenciamento Body Harmony?')
  const description = getSafeContent(siteConfig, 'home_metodo', 'description', 'O Licenciamento Body Harmony é um método exclusivo de eletroestimulação:<br /><br />Aqui você <strong>não aprende "protocolos genéricos"</strong>. Você aprende a <strong>pensar como especialista</strong>.')
  const learnTitle = getSafeContent(siteConfig, 'home_metodo', 'learnTitle', 'Você vai aprender a:')
  const learningItems = siteConfig?.home_metodo?.learningItems || DEFAULT_LEARNING_ITEMS
  const isTitle = getSafeContent(siteConfig, 'home_metodo', 'isTitle', 'O Body Harmony é:')
  const harmonyItems = siteConfig?.home_metodo?.harmonyItems || DEFAULT_HARMONY_ITEMS
  const videoUrl = getSafeContent(siteConfig, 'home_metodo', 'videoUrl', 'https://i.imgur.com/Ow9fPvW.mp4')
  const ctaTitle = getSafeContent(siteConfig, 'home_metodo', 'ctaTitle', 'Transformação Profissional')
  const ctaDescription = getSafeContent(siteConfig, 'home_metodo', 'ctaDescription', 'Você deixa de ser "mais uma esteticista" e passa a ser a profissional que entrega resultado.')

  const getIconForIndex = (index, type) => {
    if (type === 'learning') return <FaCheck />
    const icons = [<FaGraduationCap />, <FaHospital />, <FaGem />, <FaRocket />, <FaHandshake />]
    return icons[index % icons.length]
  }

  return (
    <Section id="metodo">
      <AnimeDivider position="top" fill="#FAFAFA" color={siteConfig?.theme_settings?.colors?.secondary || '#ED7E13'} />

      <Container>
        <MainTitle
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          {...editorAttr('home_metodo', 'title')}
        >
          {title}
        </MainTitle>

        <Description
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          {...editorAttr('home_metodo', 'description')}
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <SectionTitle
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          {...editorAttr('home_metodo', 'learnTitle')}
        >
          {learnTitle}
        </SectionTitle>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <CardsGrid>
            {learningItems.map((item, index) => (
              <FeatureCard key={index} variants={itemVariants}>
                <IconWrapper>{getIconForIndex(index, 'learning')}</IconWrapper>
                <CardText dangerouslySetInnerHTML={{ __html: item.text }} />
              </FeatureCard>
            ))}
          </CardsGrid>
        </motion.div>

        <SectionTitle
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          {...editorAttr('home_metodo', 'isTitle')}
        >
          {isTitle}
        </SectionTitle>

        <VideoCardsGrid>
          {/* Video Left Column */}
          <VideoWrapper
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ImgurPlayer
              url={videoUrl}
              aspectRatio="9:16"
              autoplay
              loop
              muted
              {...editorAttr('home_metodo', 'videoUrl')}
            />
          </VideoWrapper>

          {/* Cards Right Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <VideoCardsColumn>
              {harmonyItems.map((item, index) => (
                <FeatureCard key={index} variants={itemVariants}>
                  <IconWrapper>{getIconForIndex(index, 'harmony')}</IconWrapper>
                  <CardText dangerouslySetInnerHTML={{ __html: item.text }} />
                </FeatureCard>
              ))}
            </VideoCardsColumn>
          </motion.div>
        </VideoCardsGrid>

        <CTABox
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <CTATitle {...editorAttr('home_metodo', 'ctaTitle')}>{ctaTitle}</CTATitle>
          <CTAText {...editorAttr('home_metodo', 'ctaDescription')}>
            {ctaDescription}
          </CTAText>
        </CTABox>
      </Container>

      <AnimeDivider position="bottom" fill={siteConfig?.theme_settings?.colors?.primary || '#0A3E60'} color={siteConfig?.theme_settings?.colors?.secondary || '#ED7E13'} />
    </Section>
  )
}
