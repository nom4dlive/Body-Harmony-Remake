import React from 'react';
import styled from 'styled-components';

const TabsContainer = styled.nav`
  display: flex;
  background: #0B1626;
  border-bottom: 1px solid #1E3A5F;
  flex-shrink: 0;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 14px 8px;
  min-height: 48px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: ${props => (props.active ? '#ED7E13' : '#9AA0A6')};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => (props.active ? '#ED7E13' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    color: ${props => (props.active ? '#ED7E13' : '#E8EAED')};
    background: rgba(237, 126, 19, 0.04);
  }

  .tab-badge {
    background: ${props => (props.active ? '#ED7E13' : '#1E3A5F')};
    color: ${props => (props.active ? '#FFFFFF' : '#9AA0A6')};
    font-size: 10px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 10px;
  }
`;

export function SmartBookTabs({ activeTab, onTabChange, sourcesCount = 0 }) {
  return (
    <TabsContainer>
      <TabButton
        active={activeTab === 'sources'}
        onClick={() => onTabChange('sources')}
      >
        <span>Fontes</span>
        {sourcesCount > 0 && <span className="tab-badge">{sourcesCount}</span>}
      </TabButton>
      
      <TabButton
        active={activeTab === 'chat'}
        onClick={() => onTabChange('chat')}
      >
        <span>Chat</span>
      </TabButton>
      
      <TabButton
        active={activeTab === 'studio'}
        onClick={() => onTabChange('studio')}
      >
        <span>Estúdio</span>
      </TabButton>
    </TabsContainer>
  );
}
