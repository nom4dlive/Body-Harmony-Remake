import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import NexusLayout from '../NexusLayout';
import LogViewer from './LogViewer';
import { api } from '../../../services/api';
import { HardDrive, Cpu, Activity, Trash2, Power } from 'lucide-react';
import { pt } from '../../../i18n/translations';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: #111;
  border: 1px solid #222;
  padding: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const StatInfo = styled.div`
  h3 { margin: 0; color: #666; font-size: 0.8rem; text-transform: uppercase; }
  div { margin-top: 5px; font-size: 1.2rem; color: #fff; font-weight: bold; }
`;

const SectionTitle = styled.h2`
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 15px;
  border-left: 3px solid #00ff00;
  padding-left: 10px;
`;

const SystemStatus = () => {
    const [health, setHealth] = useState({ disk: '...', php: '...', memory: '...' });
    const [maintenance, setMaintenance] = useState(false);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await api.nexus.getServerHealth();
                if (!data) return;

                const freeGB = (data.disk_free_space / 1024 / 1024 / 1024).toFixed(2);
                const totalGB = (data.disk_total_space / 1024 / 1024 / 1024).toFixed(2);

                setHealth({
                    disk: `${freeGB} GB / ${totalGB} GB`,
                    php: data.php_version,
                    memory: (data.memory_usage / 1024 / 1024).toFixed(2) + ' MB'
                });
            } catch (e) {
                console.error(e);
            }
        };
        fetchHealth();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '30px', color: '#fff' }}>{pt.nexus.engineRoom.title}</h1>

            <Grid>
                <StatCard>
                    <HardDrive size={30} color="#00bcd4" />
                    <StatInfo>
                        <h3>Espaço em Disco</h3>
                        <div>{health.disk}</div>
                    </StatInfo>
                </StatCard>
                <StatCard>
                    <Cpu size={30} color="#e91e63" />
                    <StatInfo>
                        <h3>Versão PHP</h3>
                        <div>{health.php}</div>
                    </StatInfo>
                </StatCard>
                <StatCard>
                    <Activity size={30} color="#ff9800" />
                    <StatInfo>
                        <h3>Uso de Memória</h3>
                        <div>{health.memory}</div>
                    </StatInfo>
                </StatCard>
            </Grid>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div>
                    <SectionTitle>Painel de Controle</SectionTitle>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={async () => {
                                if (confirm('FLUSH SYSTEM CACHE? This might slow down the first few requests.')) {
                                    try {
                                        await api.nexus.flushCache();
                                        alert('Cache Flushed Successfully');
                                    } catch (e) { alert(e.message) }
                                }
                            }}
                            style={{ background: '#333', color: '#fff', border: '1px solid #444', padding: '15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            <Trash2 size={20} /> Limpar Cache
                        </button>

                        <button
                            onClick={async () => {
                                // Simple toggle for now, ideally fetch state first
                                const newState = !maintenance;
                                if (confirm(`SWITCH MAINTENANCE MODE ${newState ? 'ON' : 'OFF'}?`)) {
                                    try {
                                        await api.nexus.toggleMaintenance(newState);
                                        setMaintenance(newState);
                                        alert(`Maintenance Mode: ${newState ? 'ON' : 'OFF'}`);
                                    } catch (e) { alert(e.message) }
                                }
                            }}
                            style={{
                                background: maintenance ? '#ff4444' : '#333',
                                color: '#fff',
                                border: maintenance ? '1px solid #ff0000' : '1px solid #444',
                                padding: '15px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <Power size={20} /> {maintenance ? 'Desativar Manutenção' : 'Ativar Manutenção'}
                        </button>
                    </div>
                </div>
            </div>

            <SectionTitle>Logs de Erro ao Vivo</SectionTitle>
            <LogViewer />
        </div>
    );
};

export default SystemStatus;
