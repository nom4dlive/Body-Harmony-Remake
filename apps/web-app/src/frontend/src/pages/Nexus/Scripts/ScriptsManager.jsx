import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Play, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../../../services/api';
import ScriptExecutor from './ScriptExecutor';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
  
  h1 {
    color: #fff;
    font-size: 1.75rem;
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  p { color: #999; margin: 0; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const ScriptCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #0A3E60;
    transform: translateY(-2px);
  }
  
  .icon { font-size: 2rem; margin-bottom: 12px; }
  h3 { color: #fff; margin: 0 0 8px; }
  p { color: #999; margin: 0 0 16px; font-size: 0.9rem; }
  .category {
    display: inline-block;
    padding: 4px 12px;
    background: #0A3E60;
    color: #fff;
    border-radius: 12px;
    font-size: 0.75rem;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #0A3E60;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover { background: #0d5080; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const HistorySection = styled.div`
  margin-top: 40px;
  h2 {
    color: #fff;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const HistoryTable = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
`;

const HistoryRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr 150px 120px 100px;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
  
  &:last-child { border-bottom: none; }
  &:hover { background: #222; }
  
  .script-name { color: #fff; font-weight: 500; }
  .executor { color: #999; font-size: 0.9rem; }
  .timestamp { color: #666; font-size: 0.85rem; }
  .duration { color: #999; font-size: 0.85rem; }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  ${props => props.$status === 'success' && `background: rgba(34, 197, 94, 0.1); color: #22c55e;`}
  ${props => props.$status === 'error' && `background: rgba(239, 68, 68, 0.1); color: #ef4444;`}
  ${props => props.$status === 'running' && `background: rgba(59, 130, 246, 0.1); color: #3b82f6;`}
`;

const ScriptsManager = () => {
    const [scripts, setScripts] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScript, setSelectedScript] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [scriptsRes, historyRes] = await Promise.all([
                api.media.listScripts(),
                api.media.getScriptHistory()
            ]);
            setScripts(scriptsRes.scripts || []);
            setHistory(historyRes.executions || []);
        } catch (err) {
            console.error('Failed to load:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshHistory = async () => {
        setRefreshing(true);
        try {
            const res = await api.media.getScriptHistory();
            setHistory(res.executions || []);
        } finally {
            setRefreshing(false);
        }
    };

    const handleExecutionComplete = () => {
        setSelectedScript(null);
        refreshHistory();
    };

    if (loading) return <Container><p style={{ color: '#999' }}>Carregando...</p></Container>;

    return (
        <Container>
            <Header>
                <h1>📜 Scripts Manager</h1>
                <p>Execute scripts de manutenção e sincronização do sistema</p>
            </Header>

            <Grid>
                {scripts.map(script => (
                    <ScriptCard key={script.id}>
                        <div className="icon">{script.icon}</div>
                        <span className="category">{script.category}</span>
                        <h3>{script.name}</h3>
                        <p>{script.description}</p>
                        <Button onClick={() => setSelectedScript(script)}>
                            <Play size={16} />
                            Executar
                        </Button>
                    </ScriptCard>
                ))}
            </Grid>

            <HistorySection>
                <h2>
                    <Clock size={20} />
                    Histórico de Execuções
                    <Button
                        onClick={refreshHistory}
                        disabled={refreshing}
                        style={{ marginLeft: 'auto', width: 'auto', padding: '8px 16px' }}
                    >
                        <RefreshCw size={16} />
                        Atualizar
                    </Button>
                </h2>

                <HistoryTable>
                    {history.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            Nenhuma execução registrada
                        </div>
                    ) : (
                        history.map(exec => (
                            <HistoryRow key={exec.id}>
                                <div className="script-name">{exec.script_id}</div>
                                <div className="executor">{exec.executed_by_name}</div>
                                <div className="timestamp">
                                    {new Date(exec.executed_at).toLocaleString('pt-BR')}
                                </div>
                                <div className="duration">
                                    {exec.duration_ms ? `${exec.duration_ms}ms` : '-'}
                                </div>
                                <StatusBadge $status={exec.status}>
                                    {exec.status === 'success' && <CheckCircle size={14} />}
                                    {exec.status === 'error' && <XCircle size={14} />}
                                    {exec.status === 'running' && <RefreshCw size={14} />}
                                    {exec.status}
                                </StatusBadge>
                            </HistoryRow>
                        ))
                    )}
                </HistoryTable>
            </HistorySection>

            {selectedScript && (
                <ScriptExecutor
                    script={selectedScript}
                    onClose={() => setSelectedScript(null)}
                    onComplete={handleExecutionComplete}
                />
            )}
        </Container>
    );
};

export default ScriptsManager;
