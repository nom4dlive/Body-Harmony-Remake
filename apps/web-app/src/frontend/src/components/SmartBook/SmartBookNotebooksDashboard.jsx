import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaBook, FaSearch, FaCheckCircle, FaLayerGroup, 
  FaChevronRight, FaSyncAlt, FaGraduationCap 
} from 'react-icons/fa';

const DashboardContainer = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
  color: #E8EAED;
`;

const SearchHeader = styled.div`
  margin-bottom: 20px;

  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h2 {
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;

      .icon {
        color: #ED7E13;
      }
    }

    .badge {
      background: rgba(237, 126, 19, 0.15);
      border: 1px solid #ED7E13;
      color: #ED7E13;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 8px;
    }
  }

  .search-box {
    position: relative;

    input {
      width: 100%;
      background: #0B1626;
      border: 1px solid #1E3A5F;
      border-radius: 12px;
      padding: 12px 16px 12px 42px;
      color: #FFFFFF;
      font-size: 14px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #ED7E13;
        box-shadow: 0 0 15px rgba(237, 126, 19, 0.2);
      }

      &::placeholder {
        color: #5F6B7A;
      }
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #5F6B7A;
      font-size: 15px;
    }
  }
`;

const NotebooksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const NotebookCard = styled.div`
  background: ${props => (props.active ? 'linear-gradient(135deg, #11223A 0%, #173254 100%)' : '#0B1626')};
  border: 1px solid ${props => (props.active ? '#ED7E13' : '#1E3A5F')};
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  overflow: hidden;

  ${props => props.active && `
    box-shadow: 0 8px 24px rgba(237, 126, 19, 0.25);
  `}

  &:hover {
    transform: translateY(-2px);
    border-color: #ED7E13;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: ${props => (props.active ? '#ED7E13' : 'rgba(237, 126, 19, 0.1)')};
      color: ${props => (props.active ? '#FFFFFF' : '#ED7E13')};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .info {
      min-width: 0;

      .title {
        font-size: 14px;
        font-weight: 700;
        color: #FFFFFF;
        margin-bottom: 4px;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .description {
        font-size: 12px;
        color: #9AA0A6;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  .card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(30, 58, 95, 0.5);
    padding-top: 10px;
    font-size: 11px;

    .metrics {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #9AA0A6;

      span {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .synced {
        color: #22C55E;
      }
    }

    .action-badge {
      color: #ED7E13;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

export function SmartBookNotebooksDashboard({ 
  notebooks = [], 
  selectedNotebook, 
  onSelectNotebook, 
  onClose 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotebooks = notebooks.filter(nb => {
    const term = searchTerm.toLowerCase();
    const title = (nb.title || nb.name || '').toLowerCase();
    const desc = (nb.description || '').toLowerCase();
    return title.includes(term) || desc.includes(term);
  });

  return (
    <DashboardContainer>
      <SearchHeader>
        <div className="title-row">
          <h2>
            <FaBook className="icon" /> Cadernos Clínicos da Dra. Harmony
          </h2>
          <span className="badge">{notebooks.length} Módulos Disponíveis</span>
        </div>

        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar módulo por nome ou parâmetros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </SearchHeader>

      <NotebooksGrid>
        {filteredNotebooks.map((nb) => {
          const isSelected = selectedNotebook?.id === nb.id;
          const lessonsCount = nb.lessons_count || (nb.lessons ? nb.lessons.length : 0);

          return (
            <NotebookCard
              key={nb.id}
              active={isSelected}
              onClick={() => {
                onSelectNotebook(nb);
                if (onClose) onClose();
              }}
            >
              <div className="card-top">
                <div className="icon-wrapper">
                  <FaGraduationCap />
                </div>
                <div className="info">
                  <div className="title">{nb.title || nb.name}</div>
                  <div className="description">{nb.description || 'Caderno oficial com aulas práticas e dosimetrias.'}</div>
                </div>
              </div>

              <div className="card-bottom">
                <div className="metrics">
                  <span>
                    <FaLayerGroup /> {lessonsCount} aulas
                  </span>
                  <span className="synced">
                    <FaCheckCircle /> Sincronizado
                  </span>
                </div>

                <div className="action-badge">
                  {isSelected ? 'Ativo' : 'Abrir'} <FaChevronRight size={10} />
                </div>
              </div>
            </NotebookCard>
          );
        })}
      </NotebooksGrid>
    </DashboardContainer>
  );
}
