import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaEllipsisV, FaDownload, FaPen, FaLink, FaCopy } from 'react-icons/fa';
import LMSService from '../../../../services/LMSService';

const MenuContainer = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #F1F5F9;
    color: #0F172A;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  min-width: 180px;
  padding: 4px;
`;

const MenuItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #334155;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;

  &:hover {
    background: #F8FAFC;
    color: #0F172A;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickActionsMenu = ({ lesson, onRename }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const res = await LMSService.getDownloadUrl(lesson.id);
            if (res.url) {
                // Determine origin to make absolute URL if needed (but API returns relative usually or absolute)
                // New backend logic returns /api/download.php...
                const downloadLink = document.createElement('a');
                downloadLink.href = res.url;
                downloadLink.setAttribute('download', '');
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        } catch (error) {
            alert('Erro ao gerar download: ' + error.message);
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    const handleCopyLink = async () => {
        setLoading(true);
        try {
            const res = await LMSService.getDownloadUrl(lesson.id);
            if (res.url) {
                const fullUrl = window.location.origin + res.url;
                await navigator.clipboard.writeText(fullUrl);
                alert('Link copiado para a área de transferência!');
            }
        } catch (error) {
            alert('Erro ao copiar link');
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    if (lesson.video_type !== 'hostinger') return null;

    return (
        <MenuContainer ref={menuRef}>
            <MenuButton onClick={() => setIsOpen(!isOpen)} title="Ações do Arquivo">
                <FaEllipsisV />
            </MenuButton>

            {isOpen && (
                <Dropdown>
                    <MenuItem onClick={handleDownload} disabled={loading}>
                        <FaDownload size={14} /> Baixar Original
                    </MenuItem>
                    <MenuItem onClick={handleCopyLink} disabled={loading}>
                        <FaLink size={14} /> Copiar Link Seguro
                    </MenuItem>
                    <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                    <MenuItem onClick={() => { onRename(lesson); setIsOpen(false); }}>
                        <FaPen size={14} /> Renomear Arquivo
                    </MenuItem>
                </Dropdown>
            )}
        </MenuContainer>
    );
};

export default QuickActionsMenu;
