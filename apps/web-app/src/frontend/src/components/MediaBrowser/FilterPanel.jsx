import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, X, Calendar, Ruler, HardDrive, TrendingUp } from 'lucide-react';

const Panel = styled.div`
  background: #0d0d0d;
  border-bottom: 1px solid #333;
  transition: all 0.3s ease;
`;

const PanelHeader = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: #111;
  }
  
  h3 {
    margin: 0;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .toggle-icon {
    color: #666;
    transition: transform 0.2s;
  }
`;

const PanelContent = styled.div`
  padding: ${props => props.$isOpen ? '0 24px 20px' : '0'};
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const FilterGroup = styled.div`
  .label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    color: #999;
    font-size: 0.85rem;
    font-weight: 500;
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  span {
    color: #666;
    font-size: 0.85rem;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0; /* High contrast */
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #0A3E60;
    background: #1a1a1a; /* Maintain dark bg on focus */
  }
  
  &::placeholder {
    color: #555;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #222;
`;

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #0A3E60;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #fff;
  
  .remove-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    opacity: 0.8;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const ClearButton = styled.button`
  padding: 6px 16px;
  background: transparent;
  border: 1px solid #444;
  border-radius: 6px;
  color: #999;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  
  &:hover {
    background: #222;
    border-color: #666;
    color: #fff;
  }
`;

const FilterPanel = ({ filters, onFiltersChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const removeFilter = (key) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        onFiltersChange({});
    };

    const activeFilterCount = Object.keys(filters).filter(key =>
        filters[key] !== undefined && filters[key] !== ''
    ).length;

    const getFilterLabel = (key, value) => {
        const labels = {
            date_from: `De: ${value}`,
            date_to: `Até: ${value}`,
            min_size: `Min: ${(value / 1024).toFixed(0)}KB`,
            max_size: `Max: ${(value / 1024).toFixed(0)}KB`,
            min_width: `Largura ≥ ${value}px`,
            max_width: `Largura ≤ ${value}px`,
            min_height: `Altura ≥ ${value}px`,
            max_height: `Altura ≤ ${value}px`,
            min_usage: `Uso ≥ ${value}`,
            max_usage: `Uso ≤ ${value}`
        };
        return labels[key] || `${key}: ${value}`;
    };

    return (
        <Panel>
            <PanelHeader onClick={() => setIsOpen(!isOpen)}>
                <h3>
                    🔍 Filtros Avançados
                    {activeFilterCount > 0 && (
                        <span style={{
                            background: '#ED7E13',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                        }}>
                            {activeFilterCount}
                        </span>
                    )}
                </h3>
                {isOpen ? <ChevronUp size={20} className="toggle-icon" /> : <ChevronDown size={20} className="toggle-icon" />}
            </PanelHeader>

            <PanelContent $isOpen={isOpen}>
                <FilterGrid>
                    {/* Date Range */}
                    <FilterGroup>
                        <div className="label">
                            <Calendar size={14} />
                            Data de Upload
                        </div>
                        <InputRow>
                            <Input
                                type="date"
                                value={filters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                placeholder="De"
                            />
                            <span>até</span>
                            <Input
                                type="date"
                                value={filters.date_to || ''}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                placeholder="Até"
                            />
                        </InputRow>
                    </FilterGroup>

                    {/* File Size */}
                    <FilterGroup>
                        <div className="label">
                            <HardDrive size={14} />
                            Tamanho do Arquivo (KB)
                        </div>
                        <InputRow>
                            <Input
                                type="number"
                                value={filters.min_size ? filters.min_size / 1024 : ''}
                                onChange={(e) => handleFilterChange('min_size', e.target.value ? parseInt(e.target.value) * 1024 : undefined)}
                                placeholder="Mín"
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                value={filters.max_size ? filters.max_size / 1024 : ''}
                                onChange={(e) => handleFilterChange('max_size', e.target.value ? parseInt(e.target.value) * 1024 : undefined)}
                                placeholder="Máx"
                            />
                        </InputRow>
                    </FilterGroup>

                    {/* Dimensions */}
                    <FilterGroup>
                        <div className="label">
                            <Ruler size={14} />
                            Dimensões (px)
                        </div>
                        <InputRow>
                            <Input
                                type="number"
                                value={filters.min_width || ''}
                                onChange={(e) => handleFilterChange('min_width', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Largura mín"
                            />
                            <span>×</span>
                            <Input
                                type="number"
                                value={filters.min_height || ''}
                                onChange={(e) => handleFilterChange('min_height', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Altura mín"
                            />
                        </InputRow>
                    </FilterGroup>

                    {/* Usage Count */}
                    <FilterGroup>
                        <div className="label">
                            <TrendingUp size={14} />
                            Popularidade (Acessos)
                        </div>
                        <InputRow>
                            <Input
                                type="number"
                                value={filters.min_usage || ''}
                                onChange={(e) => handleFilterChange('min_usage', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Mín"
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                value={filters.max_usage || ''}
                                onChange={(e) => handleFilterChange('max_usage', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Máx"
                            />
                        </InputRow>
                    </FilterGroup>
                </FilterGrid>

                {/* Active Filters */}
                {activeFilterCount > 0 && (
                    <ActiveFilters>
                        {Object.entries(filters).map(([key, value]) =>
                            value !== undefined && value !== '' && (
                                <FilterChip key={key}>
                                    {getFilterLabel(key, value)}
                                    <div className="remove-btn" onClick={() => removeFilter(key)}>
                                        <X size={14} />
                                    </div>
                                </FilterChip>
                            )
                        )}
                        <ClearButton onClick={clearAllFilters}>
                            Limpar Todos
                        </ClearButton>
                    </ActiveFilters>
                )}
            </PanelContent>
        </Panel>
    );
};

export default FilterPanel;
