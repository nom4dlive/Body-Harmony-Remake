import React from 'react'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { FaUserMd, FaDumbbell, FaSpa } from 'react-icons/fa'
import SEOHead from '../../components/SEO/SEOHead'
import AnimeDivider from '../../components/Visual/AnimeDivider'

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const Wrapper = styled.div`
  background-color: #FAFAFA;
  min-height: 100vh;
  padding-top: 80px; /* Navbar space */
`

const Header = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
`

const MainTitle = styled(motion.h1)`
  font-family: 'Bison Bold', sans-serif;
  font-size: clamp(3.5rem, 5vw, 3rem);
  color: #0A3E60;
  letter-spacing: 1px;
  margin-bottom: 3rem;
`

const GridContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  padding: 0 2rem 6rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
`

const Card = styled(motion.div)`
  background: #FFFFFF;
  border-radius: 20px; /* More rounded */
  border: 1px solid #E0E0E0;
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.05);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  items-align: center;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(10, 62, 96, 0.1);
    border-color: #316B9C;
  }
`

const PhotoWrapper = styled.div`
  width: 200px; /* Larger */
  height: 200px;
  border-radius: 50%;
  border: 4px solid #316B9C; /* Blue border */
  padding: 4px; /* Space between photo and border */
  background: white;
  overflow: visible;
  margin: -4rem auto 1.5rem; /* Pull up to break boundary */
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`

const Name = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700; /* Bold */
  font-size: 1.5rem;
  color: #0A3E60; /* Dark Blue */
  margin-bottom: 0.25rem;
`

const Role = styled.h4`
  font-family: 'Bison Bold', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #316B9C; /* Light Blue */
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const Description = styled.p`
  font-family: 'Poppins', sans-serif;
  font-weight: 300; /* Light */
  font-size: 1rem;
  color: #0A3E60;
  line-height: 1.6;
  text-align: center;
  flex-grow: 1; /* Push bottom if needed */
`

const CTASection = styled.section`
  background: #ffffffff;
  padding: 6rem 2rem;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`

const CTAHeadline = styled.h2`
  font-family: 'Bison Bold', sans-serif;
  font-weight: 700;
  font-size: clamp(1.9rem, 3vw, 2.2rem);
  margin-bottom: 1rem;
  line-height: 1.4;
  max-width: 900px;
  text-transform: uppercase;
`

const MainButton = styled(motion.a)`
  background: #DD8F39;
  color: white;
  padding: 1.2rem 3rem;
  border-radius: 50px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 1.1rem;
  display: inline-block;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(221, 143, 57, 0.4);

  &:hover {
    background: #ED7E13;
    transform: scale(1.05);
  }
`

const mentorsData = [
  {
    name: "Joselene A. Silva",
    photo: "/mentors/josi.png",
    role: "Co-Fundadora do Método",
    text: "Nutricionista, esteticista, especialista em eletroestimulação e graduanda em biomedicina. Co-fundadora do método Body Harmony."
  },
  {
    name: "Kaprice Gonçalves",
    photo: "/mentors/kaprice.jpg",
    role: "Educadora Física",
    text: "Educadora física, ex-fisiculturista, especialista em biomecânica e eletroestimulação."
  }
]

export default function MentorsPage() {
  return (
    <Wrapper>
      <SEOHead
        title="Mentores - Body Harmony"
        description="Conheça a equipe de especialistas por trás do método Body Harmony."
      />

      <Header>
        <MainTitle
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          UMA EQUIPE DE PESO!
        </MainTitle>
      </Header>

      <GridContainer>
        {mentorsData.map((mentor, index) => (
          <Card
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 * (index + 1), duration: 0.6 }}
          >
            <PhotoWrapper style={{ borderColor: index % 2 === 0 ? '#316B9C' : '#ED7E13' }}>
              <img
                src={mentor.photo}
                alt={mentor.name}
                onError={(e) => { e.target.src = '/mentors/josi.png'; }}
              />
            </PhotoWrapper>
            <Name>{mentor.name}</Name>
            <Role>{mentor.role}</Role>
            <Description>{mentor.text}</Description>
          </Card>
        ))}
      </GridContainer>

      <AnimeDivider position="top" fill="#FAFAFA" color="#0A3E60" />

      <CTASection>
        <CTAHeadline>
          UM LICENCIAMENTO BASEADO EM CIÊNCIA E PRÁTICA.<br />
          DEFINIÇÃO CORPORAL EM TEMPO RECORD!
        </CTAHeadline>

        <MainButton
          href="https://wa.me/5518996356825?text=Tenho%20interesse%20na%20proxima%20turma%20do%20Licenciamento"
          target="_blank"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          REGISTRE INTERESSE PARA A PRÓXIMA TURMA
        </MainButton>
      </CTASection>

    </Wrapper>
  )
}
