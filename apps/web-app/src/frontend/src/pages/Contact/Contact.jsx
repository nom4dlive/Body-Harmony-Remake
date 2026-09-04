import styled from 'styled-components'
import { useState } from 'react'
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import SuccessModal from '../../components/SuccessModal/SuccessModal'
import SEOHead from '../../components/SEO/SEOHead'

const ContactWrapper = styled.div`
  padding: 4rem 1rem;
  background: ${({ theme }) => theme.colors.light};
  min-height: 80vh;
`

const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 1rem;
  
  span {
    color: ${({ theme }) => theme.colors.secondary};
  }
`

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  
  h3 {
    color: white;
    margin-bottom: 2rem;
    font-size: 2rem;
  }
`

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  font-size: 1.2rem;
  
  svg {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.secondary};
  }
  
  a {
    color: white;
    &:hover {
      text-decoration: underline;
    }
  }
`

const FormCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.dark};
  }
  
  input, textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 10px;
    transition: ${({ theme }) => theme.transitions.fast};
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.secondary};
      outline: none;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 150px;
  }
`

const SubmitButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark};
    transform: translateY(-2px);
  }
`

export default function Contact() {
  const { addLead } = useData()
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    message: ''
  })
  const [showModal, setShowModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Save to CRM Lite (Local)
    addLead(formData)
    
    try {
      await fetch("https://formsubmit.co/ajax/contato@bodyharmony.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: "Novo Contato via Site Body Harmony"
        })
      })
      
      setShowModal(true)
      setFormData({ name: '', whatsapp: '', email: '', message: '' })
    } catch (error) {
      alert('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente ou entre em contato pelo WhatsApp.')
    }
  }

  return (
    <ContactWrapper>
      <SEOHead 
        title="Fale Conosco" 
        description="Entre em contato com a equipe Body Harmony. Tire suas dúvidas sobre o curso e mentorias."
      />
      <Container>
        <Header>
          <Title>Fale <span>Conosco</span></Title>
        </Header>
        
        <ContentGrid>
          <InfoCard>
            <h3>Informações de Contato</h3>
            <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
              Tem alguma dúvida sobre o curso ou quer saber mais sobre o método Body Harmony? Entre em contato!
            </p>
            
            <InfoItem>
              <FaWhatsapp />
              <a href="https://wa.me/5518996356825" target="_blank" rel="noopener noreferrer">
                (18) 99635-6825
              </a>
            </InfoItem>
            
            <InfoItem>
              <FaEnvelope />
              <a href="mailto:contato@bodyharmony.com">
                contato@bodyharmony.com
              </a>
            </InfoItem>
            
            <InfoItem>
              <FaMapMarkerAlt />
              <span>Atendimento em todo o Brasil</span>
            </InfoItem>
          </InfoCard>
          
          <FormCard>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="whatsapp">WhatsApp</label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="message">Mensagem</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Como podemos ajudar?"
                  required
                />
              </FormGroup>
              
              <SubmitButton type="submit">
                <FaPaperPlane /> Enviar Mensagem
              </SubmitButton>
            </form>
          </FormCard>
        </ContentGrid>
      </Container>
      
      <SuccessModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Mensagem Enviada!"
        message="Obrigada! Recebemos seu contato e retornaremos em breve."
      />
    </ContactWrapper>
  )
}
