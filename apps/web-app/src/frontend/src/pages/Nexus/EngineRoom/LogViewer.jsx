import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../../../services/api';
import { RefreshCw, Trash2, Code } from 'lucide-react';
import { pt } from '../../../i18n/translations';

const TerminalContainer = styled.div`
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
  font-family: 'Consolas', 'Monaco', monospace;
  display: flex;
  flex-direction: column;
  height: 500px;
`;

const TerminalHeader = styled.div`
  background: #1a1a1a;
  padding: 8px 15px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 0.8rem;
`;

const LogContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  font-size: 0.85rem;
  color: #ccc;
  white-space: pre-wrap;
  line-height: 1.4;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #0d0d0d;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
`;

const LogLine = styled.div`
  margin-bottom: 2px;
  color: ${props => props.$error ? '#ff5555' : props.$warn ? '#ffbb33' : '#cccccc'};
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 2px;
`;

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    // bottomRef removed - no longer needed without auto-scroll

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await api.nexus.getLogs();
            if (data && data.logs) {
                // ✅ Reverse order: most recent logs first
                setLogs([...data.logs].reverse());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // Poll every 30s (reduzido de 5s — Hostinger connection limit)
        return () => clearInterval(interval);
    }, []);

    // ❌ Removed auto-scroll to bottom - logs now show newest first
    // useEffect(() => {
    //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [logs]);

    return (
        <TerminalContainer>
            <TerminalHeader>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Code size={14} />
                    <span>system.log (Tail -100, Mais Recentes Primeiro)</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchLogs} style={{ background: 'none', border: 'none', color: loading ? '#fff' : '#666', cursor: 'pointer' }}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </TerminalHeader>
            <LogContent>
                {logs.length === 0 && <div style={{ color: '#444' }}>Nenhum log disponível ou permissão negada.</div>}
                {logs.map((item, i) => {
                    let displayLine = '';

                    if (item && typeof item === 'object') {
                        const date = item.created_at || '';
                        const severity = (item.severity || 'INFO').toUpperCase();
                        const action = item.action || 'LOG';
                        const desc = item.description || '';
                        displayLine = `[${date}] [${severity}] ${action}: ${desc}`;
                    } else {
                        displayLine = String(item);
                    }

                    const isError = displayLine.toLowerCase().includes('error') || displayLine.toLowerCase().includes('fatal');
                    const isWarn = displayLine.toLowerCase().includes('warning');

                    return (
                        <LogLine key={i} $error={isError} $warn={isWarn}>
                            {displayLine}
                        </LogLine>
                    );
                })}
                {/* bottomRef removed - no longer needed without auto-scroll */}
            </LogContent>
        </TerminalContainer>
    );
};

export default LogViewer;
