import styled from 'styled-components'
import { useData } from '../../context/DataContext'
import { FaQuoteLeft } from 'react-icons/fa'
import SEOHead from '../../components/SEO/SEOHead'

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 4rem;
`

const HeroSection = styled.div`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.dark};
  padding: 4rem 1rem 1rem;
  text-align: center;
`

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 1rem;
  
  span {
    color: ${({ theme }) => theme.colors.secondary};
  }
`

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
  max-width: 600px;
  margin: 0 auto 2rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: -3rem auto 0;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
`

const TestimonialCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`

const QuoteIcon = styled(FaQuoteLeft)`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary}20; // 20% opacity
  margin-bottom: 1rem;
`

const Text = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  flex: 1;
  font-style: italic;
  margin-bottom: 2rem;
`

const Author = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  div {
    display: flex;
    flex-direction: column;
    
    strong {
      color: ${({ theme }) => theme.colors.primary};
      font-weight: 700;
    }
    
    span {
      font-size: 0.85rem;
      color: #888;
    }
  }
`

export default function Testimonials() {
  const { testimonials = [] } = useData()

  return (
    <PageWrapper>
      <SEOHead 
        title="Depoimentos" 
        description="Veja o que dizem as profissionais licenciadas e clientes sobre o método Body Harmony."
      />
      <HeroSection>
        <Title>O que dizem sobre nós</Title>
        <Subtitle>
          Histórias reais de quem transformou sua carreira e seus resultados com o Body Harmony.
        </Subtitle>
      </HeroSection>

      <Grid>
        {testimonials.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#888' }}>
            <h3>Em breve, lindas histórias por aqui! ✨</h3>
          </div>
        ) : (
          testimonials.map(t => (
            <TestimonialCard key={t.id}>
              <QuoteIcon />
              <Text>"{t.text}"</Text>
              <Author>
                <img src={t.photo || 'https://ui-avatars.com/api/?name=' + t.name} alt={t.name} />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </Author>
            </TestimonialCard>
          ))
        )}
      </Grid>
    </PageWrapper>
  )
}
