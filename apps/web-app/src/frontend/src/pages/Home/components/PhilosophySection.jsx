import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import AnimeDivider from '../../../components/Visual/AnimeDivider'
import { useData } from '../../../context/DataContext'
import { getSafeContent, editorAttr } from '../../../utils/configUtils'

const Section = styled.section`
  padding: 8rem 2rem;
  background-color: #FAFAFA;
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
  color: #0A3E60;
  text-align: center;
  margin-bottom: 4rem;
  text-transform: uppercase;
  letter-spacing: -0.5px;
`

const ListsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-bottom: 3rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`

const ListSection = styled.div``

const SectionTitle = styled(motion.h3)`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 1.75rem);
  color: ${props => props.$color || '#ED7E13'};
  margin-bottom: 2rem;
  text-align: left;
`

const ItemsList = styled(motion.ul)`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const ListItem = styled(motion.li)`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-size: 1.25rem;
  color: #316B9C;
  
  strong {
    font-weight: 600;
    color: #0A3E60;
  }
`

const IconWrapper = styled.span`
  color: #ED7E13;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const BulletPoint = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #DD8F39;
  flex-shrink: 0;
`

const DEFAULT_PROFESSIONALS = [
  'Esteticistas',
  'Fisioterapeutas',
  'Educadores físicos',
  'Profissionais da saúde estética',
  'Donos de clínicas',
  'Profissionais da saúde e estética em geral'
]

const DEFAULT_CHARACTERISTICS = [
  'Já atua na área',
  'Quer crescer de verdade',
  'Busca diferenciação real',
  'Não aceita estagnação',
  'Quer entregar mais resultado'
]

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
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 100
    }
  }
}

export default function PhilosophySection() {
  const { siteConfig } = useData()

  const title = getSafeContent(siteConfig, 'home_philosophy', 'title', 'Para Quem é o Licenciamento?')
  const list1Title = getSafeContent(siteConfig, 'home_philosophy', 'list1Title', 'O Licenciamento Body Harmony é para:')
  const professionals = siteConfig?.home_philosophy?.professionals || DEFAULT_PROFESSIONALS
  const list2Title = getSafeContent(siteConfig, 'home_philosophy', 'list2Title', 'É para quem:')
  const characteristics = siteConfig?.home_philosophy?.characteristics || DEFAULT_CHARACTERISTICS

  return (
    <Section>
      <AnimeDivider position="top" fill="#0A3E60" color="#ED7E13" />

      <Container>
        <MainTitle
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          {...editorAttr('home_philosophy', 'title')}
        >
          {title}
        </MainTitle>

        <ListsContainer>
          {/* Lista 1: Profissionais */}
          <ListSection>
            <SectionTitle
              $color="#ED7E13"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              {...editorAttr('home_philosophy', 'list1Title')}
            >
              {list1Title}
            </SectionTitle>

            <ItemsList
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {professionals.map((item, index) => (
                <ListItem key={index} variants={itemVariants}>
                  <IconWrapper>
                    <FaCheckCircle />
                  </IconWrapper>
                  <strong>{item}</strong>
                </ListItem>
              ))}
            </ItemsList>
          </ListSection>

          {/* Lista 2: Características */}
          <ListSection>
            <SectionTitle
              $color="#DD8F39"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              {...editorAttr('home_philosophy', 'list2Title')}
            >
              {list2Title}
            </SectionTitle>

            <ItemsList
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {characteristics.map((item, index) => (
                <ListItem key={index} variants={itemVariants}>
                  <BulletPoint />
                  <strong>{item}</strong>
                </ListItem>
              ))}
            </ItemsList>
          </ListSection>
        </ListsContainer>
      </Container>

      <AnimeDivider position="bottom" fill="#FFFFFF" color="#ED7E13" />
    </Section>
  )
}
