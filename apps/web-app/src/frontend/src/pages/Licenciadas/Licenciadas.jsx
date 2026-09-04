import styled from 'styled-components'
import { useState, useMemo } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import LicenciadaCard from '../../components/LicenciadaCard/LicenciadaCard'
import VideoModal from '../../components/VideoModal/VideoModal'
import FeedModal from '../../components/FeedModal/FeedModal'
import SEOHead from '../../components/SEO/SEOHead'

const PageWrapper = styled.div`
  padding: 4rem 1rem;
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

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
  max-width: 600px;
  margin: 0 auto 2rem;
`

const FilterBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`

const FilterButton = styled.button`
  background: ${({ $active, theme }) => $active ? theme.colors.secondary : theme.colors.light};
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.text};
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-weight: 500;
  transition: ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.small};
  
  &:hover {
    background: ${({ theme, $active }) => $active ? theme.colors.secondary : '#e0e0e0'};
    transform: translateY(-2px);
  }
`

const LicenciadasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: ${({ theme }) => theme.colors.textLight};
  grid-column: 1 / -1;
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`

export default function Licenciadas() {
  const { licenciadas } = useData()
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedFeed, setSelectedFeed] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false)

  // List of Brazilian states for validation
  const BR_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  // Extract unique states for filter
  const states = useMemo(() => {
    const allStates = new Set()
    let hasInternational = false

    if (!Array.isArray(licenciadas)) return ['Todos'];

    licenciadas.forEach(student => {
      const stateStr = String(student.state || '');
      if (!stateStr) return;

      const statesList = stateStr.split('/').map(s => s.trim());

      statesList.forEach(state => {
        if (BR_STATES.includes(state)) {
          allStates.add(state);
        } else {
          hasInternational = true;
        }
      });
    })

    const sortedStates = [...allStates].sort()
    const result = ['Todos', ...sortedStates]
    if (hasInternational) {
      result.push('Internacional')
    }

    return result
  }, [licenciadas])

  // Filter licenciadas
  const filteredLicenciadas = useMemo(() => {
    if (!Array.isArray(licenciadas)) return [];

    const result = activeFilter === 'Todos'
      ? licenciadas
      : activeFilter === 'Internacional'
        ? licenciadas.filter(student => {
          const stateStr = String(student.state || '');
          if (!stateStr) return false;
          const statesList = stateStr.split('/').map(s => s.trim());
          return statesList.some(state => !BR_STATES.includes(state));
        })
        : licenciadas.filter(student => {
          const stateStr = String(student.state || '');
          if (!stateStr) return false;
          const statesList = stateStr.split('/').map(s => s.trim());
          return statesList.some(state => state === activeFilter);
        })

    return result.sort((a, b) => {
      if (a.pinned === b.pinned) {
        return (a.name || '').localeCompare(b.name || '')
      }
      return a.pinned ? -1 : 1
    })
  }, [licenciadas, activeFilter])

  const handleOpenVideo = (student) => {
    setSelectedVideo(student)
    setIsModalOpen(true)
  }

  const handleOpenFeed = (student) => {
    setSelectedFeed(student)
    setIsFeedModalOpen(true)
  }

  return (
    <PageWrapper>
      <SEOHead
        title="Licenciadas"
        description="Encontre uma profissional licenciada Body Harmony próxima de você. Atendimento em todo o Brasil."
      />
      <Container>
        <Header>
          <Title>Nossas <span>Licenciadas</span></Title>
          <Subtitle>Encontre uma profissional Body Harmony próxima de você</Subtitle>

          <FilterBar>
            {states.map(state => (
              <FilterButton
                key={state}
                $active={activeFilter === state}
                onClick={() => setActiveFilter(state)}
              >
                {state}
              </FilterButton>
            ))}
          </FilterBar>
        </Header>

        <LicenciadasGrid>
          {filteredLicenciadas.length > 0 ? (
            filteredLicenciadas.map(student => (
              <LicenciadaCard
                key={student.id}
                student={student}
                onVideoClick={handleOpenVideo}
                onFeedClick={handleOpenFeed}
              />
            ))
          ) : (
            <EmptyState>
              <FaSearch />
              <p>Nenhuma licenciada encontrada neste estado.</p>
            </EmptyState>
          )}
        </LicenciadasGrid>
      </Container>

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={selectedVideo?.videoUrl}
        student={selectedVideo}
      />

      <FeedModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        student={selectedFeed}
      />
    </PageWrapper>
  )
}
