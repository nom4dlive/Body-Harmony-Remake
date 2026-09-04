import styled from 'styled-components'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { FaWhatsapp, FaUserMd, FaFilter, FaSearch, FaArrowRight } from 'react-icons/fa'
import SEOHead from '../../components/SEO/SEOHead'
import ImageWithFallback from '../../components/ImageWithFallback/ImageWithFallback'

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

const FilterBar = styled.div`
  max-width: 1200px;
  margin: -3rem auto 2rem;
  padding: 0 1rem;
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const FilterButton = styled.button`
  background: ${({ $active, theme }) => $active ? theme.colors.secondary : 'white'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    background: ${({ $active, theme }) => $active ? theme.colors.secondary : '#f0f0f0'};
  }
`

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0 1rem;
    gap: 1.5rem;
  }
`

const ResultCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.1);
  }
`

const ImageContainer = styled.div`
  height: 300px;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${ResultCard}:hover & img {
    transform: scale(1.05);
  }
`

const CategoryBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`

const CardContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`

const ResultDescription = styled.h3`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 0.5rem;
  line-height: 1.4;
`

const ResultDate = styled.span`
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 1.5rem;
  display: block;
`

const AuthorSection = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  div {
    display: flex;
    flex-direction: column;
    
    strong {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.text};
    }
    
    span {
      font-size: 0.75rem;
      color: #777;
    }
  }
`

const WhatsAppLink = styled.a`
  background: #25D366;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`

const CATEGORIES = [
  'Todos',
  'Celulite',
  'Flacidez',
  'Gordura Localizada',
  'Emagrecimento',
  'Pós-Operatório',
  'Outros'
]

export default function ResultsGallery() {
  const { results = [], students = [] } = useData()
  const [activeCategory, setActiveCategory] = useState('Todos')

  // Helper to get student info
  const getStudent = (id) => students.find(s => s.id === id)

  const filteredResults = (activeCategory === 'Todos'
    ? results
    : results.filter(r => r.category === activeCategory)
  ).sort((a, b) => {
    // Sort: Pinned first, then by date (newest first)
    if (a.pinned === b.pinned) {
      return new Date(b.date) - new Date(a.date)
    }
    return a.pinned ? -1 : 1
  })

  return (
    <PageWrapper>
      <SEOHead
        title="Resultados"
        description="Galeria de antes e depois com transformações reais do método Body Harmony."
      />
      <HeroSection>
        <Title>Resultados Reais</Title>
        <Subtitle>Transformações corporais alcançadas com o protocolo Body Harmony.</Subtitle>
      </HeroSection>

      <FilterBar>
        {CATEGORIES.map(cat => (
          <FilterButton
            key={cat}
            $active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </FilterButton>
        ))}
      </FilterBar>

      <GalleryGrid>
        {filteredResults.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#888' }}>
            <h3>Nenhum resultado encontrado nesta categoria.</h3>
            <p>Selecione outra categoria ou volte mais tarde!</p>
          </div>
        ) : (
          filteredResults.map(result => {
            const student = getStudent(result.studentId)

            return (
              <ResultCard key={result.id}>
                <ImageContainer>
                  <CategoryBadge>{result.category}</CategoryBadge>
                  <img src={result.image} alt={result.description} />
                </ImageContainer>

                <CardContent>
                  <ResultDescription>{result.description}</ResultDescription>
                  <ResultDate>{new Date(result.date).toLocaleDateString('pt-BR')}</ResultDate>

                  {student && (
                    <AuthorSection>
                      <AuthorInfo>
                        <ImageWithFallback src={student.photo} alt={student.name} fallbackSrc={'https://ui-avatars.com/api/?name=Profissional'} />
                        <div>
                          <strong>{student.name}</strong>
                          <span>{student.location}</span>
                        </div>
                      </AuthorInfo>

                      {student.whatsapp ? (
                        <WhatsAppLink
                          href={`https://wa.me/${student.whatsapp.replace(/\D/g, '')}?text=Olá, vim pela foto do resultado de ${result.category}!`}
                          target="_blank"
                          title="Agendar Sessão"
                        >
                          <FaWhatsapp />
                        </WhatsAppLink>
                      ) : (
                        <WhatsAppLink
                          href={student.instagram ? `https://instagram.com/${student.instagram.replace('@', '')}` : '#'}
                          target="_blank"
                          style={{ background: '#C13584' }}
                          title="Ver Instagram"
                        >
                          <FaUserMd />
                        </WhatsAppLink>
                      )}
                    </AuthorSection>
                  )}
                </CardContent>
              </ResultCard>
            )
          })
        )}
      </GalleryGrid>
    </PageWrapper>
  )
}
