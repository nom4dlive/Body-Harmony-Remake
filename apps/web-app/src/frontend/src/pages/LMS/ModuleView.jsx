import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { LessonList } from './components/LessonList'
import { FaChevronLeft, FaSpinner } from 'react-icons/fa'
import { ROUTES } from '../../config/routes'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #051A29 0%, #0A3E60 100%);
  color: white;
  padding: 2rem;
`

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
  
  button.back {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    margin-bottom: 2rem;
    transition: all 0.3s;
    
    &:hover { 
      background: rgba(255,255,255,0.1);
      border-color: ${({ theme }) => theme.colors.secondary};
    }
  }
  
  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(2rem, 5vw, 3.5rem);
    margin-bottom: 1rem;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.secondary};
  }
  
  p.description {
    font-size: 1.1rem;
    line-height: 1.8;
    color: rgba(255,255,255,0.8);
    max-width: 800px;
  }
`

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  
  h2 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: white;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`

const LoadingContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.secondary};
`

export default function ModuleView() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [moduleData, setModuleData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadModule = async () => {
            try {
                const data = await api.getLmsContent(id)
                setModuleData(data)
            } catch (error) {
                console.error('Failed to load module:', error)
            } finally {
                setLoading(false)
            }
        }

        loadModule()
    }, [id])

    if (loading) {
        return (
            <LoadingContainer>
                <FaSpinner className="spin" size={40} />
            </LoadingContainer>
        )
    }

    if (!moduleData) {
        return (
            <Container>
                <Header>
                    <button className="back" onClick={() => navigate(ROUTES.LMS)}>
                        <FaChevronLeft /> Voltar
                    </button>
                    <h1>Módulo não encontrado</h1>
                </Header>
            </Container>
        )
    }

    return (
        <Container>
            <Header>
                <button className="back" onClick={() => navigate(ROUTES.LMS)}>
                    <FaChevronLeft /> Voltar ao Dashboard
                </button>

                <h1>{moduleData.module?.title}</h1>
                {moduleData.module?.description && (
                    <p className="description">{moduleData.module.description}</p>
                )}
            </Header>

            <Content>
                <h2>Aulas do Módulo</h2>
                <LessonList
                    lessons={moduleData.lessons}
                    moduleId={moduleData.module?.id}
                    moduleQuiz={moduleData.quiz}
                    onQuizClick={() => {
                        // Navigation to quiz if needed
                        console.log('Quiz clicked')
                    }}
                />
            </Content>

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </Container>
    )
}
