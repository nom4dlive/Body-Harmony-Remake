import React from 'react';
import styled from 'styled-components';
import { FaClipboardList, FaBrain, FaShieldAlt, FaCoins } from 'react-icons/fa';

const ActionsContainer = styled.div`
    display: flex;
    gap: 0.8rem;
    padding: 1rem 1.5rem;
    overflow-x: auto;
    background: rgba(10, 62, 96, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    
    &::-webkit-scrollbar { height: 4px; }
    &::-webkit-scrollbar-thumb { background: rgba(237, 126, 19, 0.3); border-radius: 4px; }
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #E2E8F0;
    padding: 0.6rem 1rem;
    border-radius: 12px;
    font-size: 0.85rem;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(5px);

    &:hover {
        background: rgba(237, 126, 19, 0.15);
        border-color: #ED7E13;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(237, 126, 19, 0.2);
    }

    svg { color: #ED7E13; }
`;

export default function HarmonyActions({ onAction }) {
    const actions = [
        { id: 'parameters', label: 'Parâmetros Clínicos', icon: <FaClipboardList /> },
        { id: 'technique', label: 'Explicar Técnica', icon: <FaBrain /> },
        { id: 'safety', label: 'Riscos e Segurança', icon: <FaShieldAlt /> },
        { id: 'credits', label: 'Ver Meus Créditos', icon: <FaCoins /> }
    ];

    return (
        <ActionsContainer>
            {actions.map(action => (
                <ActionButton key={action.id} onClick={() => onAction(action.id)}>
                    {action.icon}
                    {action.label}
                </ActionButton>
            ))}
        </ActionsContainer>
    );
}
