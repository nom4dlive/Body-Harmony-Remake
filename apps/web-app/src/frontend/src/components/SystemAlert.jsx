import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Radio } from 'lucide-react';
import { api } from '../services/api';

const AlertContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  pointer-events: none; // Let clicks pass through if empty
`;

const AlertBanner = styled.div`
  background: ${props => props.$type === 'alert' ? '#d32f2f' : props.$type === 'warning' ? '#f57c00' : '#0288d1'};
  color: white;
  padding: 10px 20px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  pointer-events: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }
`;

const renderMessage = (text) => {
    if (!text) return null;
    const parts = text.split(/(wa\.me\/\d+)/g);
    return parts.map((part, i) => {
        if (part.startsWith('wa.me/')) {
            return <a key={i} href={`https://${part}`} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline', color: '#FFF', fontWeight: 'bold'}}>{part}</a>;
        }
        return part;
    });
};

const SystemAlert = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await api.nexus.getBroadcasts();
                if (res && res.broadcasts) {
                    setAlerts(res.broadcasts);
                }
            } catch (e) {
                // Silent fail
            }
        };
        fetchAlerts();
        // Poll infrequently
        const interval = setInterval(fetchAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    if (alerts.length === 0) return null;

    return (
        <AlertContainer>
            {alerts.map(alert => (
                <AlertBanner key={alert.id} $type={alert.type}>
                    <Radio size={16} className="pulse" /> {renderMessage(alert.message)}
                </AlertBanner>
            ))}
        </AlertContainer>
    );
};

export default SystemAlert;
