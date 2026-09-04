import React from 'react'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { FaBolt, FaCheckCircle, FaShoppingCart, FaWaveSquare, FaClock, FaBookOpen, FaExclamationTriangle } from 'react-icons/fa'
import SEOHead from '../../components/SEO/SEOHead'
import AnimeDivider from '../../components/Visual/AnimeDivider'
import WaveDivider from '../../components/Visual/WaveDivider'

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
  padding: 4rem 2rem 2rem;
  background: white;
  max-width: 1200px;
  margin: 0 auto;
`

const Title = styled(motion.h1)`
  font-family: 'Bison Bold', sans-serif;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  color: #ED7E13;
  letter-spacing: 2px;
  margin-bottom: 2rem;
`

const Subtitle = styled(motion.p)`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  color: #0A3E60;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`

// Photo Section
const PhotoSection = styled.section`
  padding: 2rem;
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
`

const PhotoWrapper = styled(motion.div)`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  max-width: 800px;
  width: 100%;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
`

// Highlight Block
const HighlightBlock = styled(motion.div)`
  background: white;
  border-bottom: 4px solid #ED7E13;
  padding: 2rem;
  text-align: center;
  margin: 3rem auto;
  max-width: 600px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);

  h3 {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    color: #316B9C;
    text-transform: uppercase;
  }
`

// Curriculum Grid
const GridSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`

const SectionTitle = styled.h2`
  text-align: center;
  font-family: 'Bison Bold', sans-serif;
  font-size: 3rem;
  color: #0A3E60;
  margin-bottom: 3rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
`

const Card = styled(motion.div)`
  background: white;
  border: 1px solid #316B9C;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  items-align: center;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  
  svg {
    font-size: 2rem;
    color: #ED7E13;
    margin-bottom: 1rem;
    animation: ${pulse} 3s infinite ease-in-out;
  }

  h4 {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    color: #0A3E60;
    margin-bottom: 1rem;
  }

  p {
    font-family: 'Poppins', sans-serif;
    color: #316B9C;
    font-size: 0.95rem;
  }
`

// Purchase Section
const PurchaseSection = styled.section`
  background: #0A3E60;
  color: white;
  padding: 5rem 2rem;
  text-align: center;
`

const PurchaseSteps = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const Step = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  font-size: 1.1rem;
  font-family: 'Poppins', sans-serif;

  span {
    background: #ED7E13;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }
`

const BuyButton = styled(motion.a)`
  background: #DD8F39;
  color: white;
  padding: 1.5rem 4rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 1.25rem;
  border-radius: 50px;
  display: inline-block;
  margin-top: 3rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  cursor: pointer;

  &:hover {
    background: #ED7E13;
    transform: translateY(-5px);
  }
`

const curriculum = [
  { icon: <FaBolt />, title: "Eletroestimulação", text: "Definição, conceitos e bases fisiológicas." },
  { icon: <FaWaveSquare />, title: "Tipos de Correntes", text: "Entenda a física de cada estímulo." },
  { icon: <FaClock />, title: "Frequências", text: "Russa, Média Frequência e Australiana." },
  { icon: <FaBookOpen />, title: "Parâmetros", text: "Como configurar para cada objetivo." },
  { icon: <FaDumbbell />, title: "Tipos de Contração", text: "Isométrica, Isotônica e Isocinética." },
  { icon: <FaCheckCircle />, title: "Modos de Emissão", text: "Sincronizado, Recíproco e Contínuo." },
  { icon: <FaShoppingCart />, title: "Indicações", text: "Quando e para quem indicar." },
  { icon: <FaExclamationTriangle />, title: "Contraindicações", text: "Segurança e cuidados essenciais." }
]

import { FaDumbbell } from 'react-icons/fa'

export default function Workshop() {
  return (
    <Wrapper>
      <SEOHead 
        title="Workshop Eletroestimulação - Body Harmony" 
        description="Domine o uso de aparelhos de eletroestimulação no campo da estética." 
      />

      <Header>
        <Title
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          INTRODUÇÃO À ELETROESTIMULAÇÃO MUSCULAR
        </Title>
        <Subtitle
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
          Este workshop é perfeito para quem deseja dominar o uso de aparelhos de eletroestimulação no campo da estética, potencializando resultados e oferecendo o que há de mais moderno no mercado.
        </Subtitle>
      </Header>

      <PhotoSection>
        <PhotoWrapper
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Placeholder or specific image if confirmed */}
          <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200" alt="Aplicação Prática" />
        </PhotoWrapper>
      </PhotoSection>

      <HighlightBlock
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
         <h3>UTILIZE EM QUALQUER APARELHO!</h3>
      </HighlightBlock>

      <WaveDivider position="top" fill="#FAFAFA" color="#FFFFFF" />

      <GridSection>
        <SectionTitle>O QUE VOCÊ VAI APRENDER</SectionTitle>
        <Grid>
          {curriculum.map((item, index) => (
            <Card
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div>{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </Card>
          ))}
        </Grid>
      </GridSection>

      <PurchaseSection>
        <SectionTitle style={{ color: 'white' }}>COMO ADQUIRIR SEU CURSO</SectionTitle>
        <PurchaseSteps>
          <Step>
            <span>1</span>
            <div>Clique no botão abaixo para acessar a página segura de compra.</div>
          </Step>
          <Step>
             <span>2</span>
             <div>Preencha seus dados de acesso e pagamento.</div>
          </Step>
          <Step>
             <span>3</span>
             <div>Receba o acesso imediato por e-mail e comece a estudar!</div>
          </Step>
        </PurchaseSteps>
        
        <BuyButton 
          href="https://pay.hotmart.com/..." 
          target="_blank"
          whileHover={{ scale: 1.05 }}
        >
          QUERO MEU ACESSO AGORA!
        </BuyButton>
      </PurchaseSection>

    </Wrapper>
  )
}
