import React from 'react'
import { Navigate } from 'react-router-dom'
import { useLicenciadaAuth } from '../../context/LicenciadaAuthContext'
import { ROUTES } from '../../config/routes'
import styled, { keyframes } from 'styled-components'
import { FaSpinner } from 'react-icons/fa'

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const LoadingContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors?.surface || '#F5F5F5'};
  color: ${({ theme }) => theme.colors?.primary || '#0A3E60'};
  font-size: 2rem;
`

const Spinner = styled(FaSpinner)`
  animation: ${rotate} 1s linear infinite;
`

/**
 * LicenciadaGuard (Legacy: AlunaGuard)
 * Protege rotas exclusivas para licenciadas autenticadas.
 * Nexus V52 Nomenclature Sync
 */
export default function LicenciadaGuard({ children }) {
    const { licenciada, loading } = useLicenciadaAuth()

    if (loading) {
        return (
            <LoadingContainer>
                <Spinner />
            </LoadingContainer>
        )
    }

    // Fallback para 'student' em sessões de transição se necessário, 
    // mas aqui buscamos a propriedade normalizada 'licenciada' do context.
    if (!licenciada) {
        return <Navigate to={ROUTES.PORTAL} replace />
    }

    return children
}
