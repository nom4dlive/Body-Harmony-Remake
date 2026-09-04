import React from 'react'
import styled from 'styled-components'
import { FaPlayCircle, FaCheckCircle, FaLock, FaFileDownload } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem 0;
`

const LessonItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  background: ${props => props.$active ? 'rgba(237, 126, 19, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${props => props.$active ? props.theme.colors.secondary : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 0;
    background: ${({ theme }) => theme.colors.secondary};
    transition: height 0.3s ease;
    ${props => props.$active && 'height: 60%;'}
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(5px);
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* Disabled state if locked (future) */
  ${props => props.$locked && `
    opacity: 0.4;
    cursor: not-allowed;
    background: rgba(0,0,0,0.2);
    &:hover { transform: none; }
  `}
`

const LeftInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`

const IconWrapper = styled.div`
  font-size: 1.3rem;
  color: ${props => props.$completed ? props.theme.colors.success : (props.$locked ? 'rgba(255,255,255,0.2)' : props.theme.colors.secondary)};
  display: flex;
  align-items: center;
  opacity: ${props => props.$active ? 1 : 0.7};
`

const LessonTitle = styled.h4`
  font-size: 0.95rem;
  color: #FFFFFF;
  font-weight: 500;
  margin: 0;
  opacity: ${props => props.$active ? 1 : 0.8};
`

const MetaInfo = styled.div`
  text-align: right;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.darkTextMuted};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`

const Duration = styled.span`
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-weight: 600;
  color: #FFFFFF;
  font-size: 0.75rem;
`

export function LessonList({ lessons, moduleId, activeQuiz, onQuizClick, moduleQuiz }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const handleLessonClick = (lesson) => {
    // Navigate to Lesson Player
    // Use path: /lms/lesson/:id
    // Wait, let's verify routes.js uses /lms/lesson
    // Assuming we will handle the param in the route config
    // Actually, routes/config.js has LMS_LESSON: '/lms/lesson'
    // So we invoke navigate(`${ROUTES.LMS_LESSON}/${lesson.id}`)

    navigate(`${ROUTES.LMS_LESSON}/${lesson.id}`, {
      state: { moduleId } // Pass context if needed
    })
  }

  if (!lessons || lessons.length === 0) {
    return <div style={{ padding: '1rem', color: '#888', fontStyle: 'italic' }}>Nenhuma aula disponível neste módulo.</div>
  }

  return (
    <ListContainer>
      {lessons.map(lesson => (
        <LessonItem
          key={lesson.id}
          $active={String(lesson.id) === String(id)}
          onClick={() => handleLessonClick(lesson)}
        >
          <LeftInfo>
            <IconWrapper $completed={lesson.is_completed}>
              {lesson.is_completed ? <FaCheckCircle /> : <FaPlayCircle />}
            </IconWrapper>
            <div>
              <LessonTitle $active={String(lesson.id) === String(id)}>{lesson.title}</LessonTitle>
            </div>
          </LeftInfo>

          <MetaInfo>
            <Duration>{Math.floor((lesson.duration_seconds || 0) / 60).toString().padStart(2, '0')}:{((lesson.duration_seconds || 0) % 60).toString().padStart(2, '0')} min</Duration>
            {/* Show Attachment indicator if any */}
            {(lesson.attachment_count > 0 || lesson.attachments?.length > 0) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0A3E60' }}>
                <FaFileDownload size={10} /> Material
              </span>
            )}
          </MetaInfo>
        </LessonItem>
      ))}

      {/* Quiz Item */}
      {moduleQuiz && (
        <LessonItem
          $active={activeQuiz}
          onClick={() => onQuizClick && onQuizClick()}
          style={{ marginTop: '1rem', borderColor: activeQuiz ? '#ED7E13' : 'rgba(255,255,255,0.1)' }}
        >
          <LeftInfo>
            <IconWrapper $completed={moduleQuiz.is_completed} $active={activeQuiz}>
              {moduleQuiz.is_completed ? <FaCheckCircle /> : <FaFileDownload />} {/* Using FileDownload as generic icon or Star */}
            </IconWrapper>
            <div>
              <LessonTitle $active={activeQuiz}>{moduleQuiz.title || 'Avaliação do Módulo'}</LessonTitle>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                {moduleQuiz.is_completed ? `Aprovado: ${Math.round(moduleQuiz.last_score)}%` : 'Avaliação Obrigatória'}
              </div>
            </div>
          </LeftInfo>
        </LessonItem>
      )}
    </ListContainer>
  )
}
