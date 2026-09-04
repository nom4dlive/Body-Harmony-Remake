import styled from 'styled-components'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaEnvelope, FaWhatsapp, FaTrash, FaCheck, FaSearch } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import { ROUTES } from '../../config/routes'

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  flex: 1;
  display: flex;
  flex-direction: column;
  
  strong {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  span {
    color: #666;
    font-size: 0.9rem;
  }
`

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  margin-bottom: 2rem;
  
  input {
    flex: 1;
    border: none;
    font-size: 1rem;
    &:focus { outline: none; }
  }
`

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const MessageCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
  border-left: 5px solid ${({ $status, theme }) => $status === 'new' ? theme.colors.secondary : '#ddd'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`

const UserInfo = styled.div`
  h3 {
    margin: 0 0 0.25rem 0;
    color: ${({ theme }) => theme.colors.dark};
  }
  
  div {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #666;
    align-items: center;
    
    a {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: ${({ theme }) => theme.colors.primary};
      &:hover { text-decoration: underline; }
    }
  }
`

const DateBadge = styled.span`
  font-size: 0.8rem;
  color: #888;
  background: #f5f5f5;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
`

const MessageBody = styled.p`
  color: #444;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &.read {
    background: #e8f5e9;
    color: #2e7d32;
    &:hover { background: #c8e6c9; }
  }
  
  &.delete {
    background: #ffebee;
    color: #c62828;
    &:hover { background: #ffcdd2; }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export default function LeadsManager() {
  const { leads = [], updateLead, deleteLead } = useData()
  const [searchTerm, setSearchTerm] = useState('')

  const handleMarkAsRead = (id) => {
    updateLead(id, { status: 'read' })
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja apagar esta mensagem?')) {
      deleteLead(id)
    }
  }

  const filteredLeads = leads
    .filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const newCount = leads.filter(l => l.status === 'new').length

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <PageWrapper>
        <Header>
          <BackLink to={ROUTES.ADMIN_DASHBOARD}>
            <FaArrowLeft /> Voltar ao Painel
          </BackLink>
          <h1 style={{ color: '#1B4E6B' }}>Caixa de Entrada (CRM)</h1>
        </Header>

        <Stats>
          <StatCard>
            <strong>{newCount}</strong>
            <span>Novas Mensagens</span>
          </StatCard>
          <StatCard>
            <strong>{leads.length}</strong>
            <span>Total Recebido</span>
          </StatCard>
        </Stats>

        <SearchBar>
          <FaSearch style={{ color: '#ccc' }} />
          <input 
            placeholder="Buscar por nome ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>

        <MessageList>
          {filteredLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              Nenhuma mensagem encontrada.
            </div>
          ) : (
            filteredLeads.map(lead => (
              <MessageCard key={lead.id} $status={lead.status}>
                <MessageHeader>
                  <UserInfo>
                    <h3>{lead.name}</h3>
                    <div>
                      <a href={`mailto:${lead.email}`}><FaEnvelope /> {lead.email}</a>
                      {lead.whatsapp && (
                        <a href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                          <FaWhatsapp /> {lead.whatsapp}
                        </a>
                      )}
                    </div>
                  </UserInfo>
                  <DateBadge>{new Date(lead.date).toLocaleString('pt-BR')}</DateBadge>
                </MessageHeader>
                
                <MessageBody>{lead.message}</MessageBody>
                
                <Actions>
                  {lead.status === 'new' && (
                    <ActionButton className="read" onClick={() => handleMarkAsRead(lead.id)}>
                      <FaCheck /> Marcar como lido
                    </ActionButton>
                  )}
                  <ActionButton className="delete" onClick={() => handleDelete(lead.id)}>
                    <FaTrash /> Apagar
                  </ActionButton>
                </Actions>
              </MessageCard>
            ))
          )}
        </MessageList>
      </PageWrapper>
    </div>
  )
}
