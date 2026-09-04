import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Play, Activity, Terminal, ShieldAlert, CheckCircle, Clock, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { api } from '../../../services/api';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon {
    padding: 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
  }

  .info {
    h3 { font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary}; margin: 0; }
    p { font-size: 1.5rem; font-weight: bold; margin: 0; color: ${({ theme }) => theme.colors.accent}; }
  }
`;

const TestArea = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  height: 600px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
    min-height: 600px;
  }
`;

const SuiteList = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
`;

const SuiteItem = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.$active ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${props => props.$active ? props.theme.colors.accent : 'transparent'};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  span { font-size: 0.9rem; font-family: ${({ theme }) => theme.fonts.detail}; }
`;

const ConsoleOutput = styled.div`
  background: #000;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.accent}44;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.detail};
  font-size: 0.85rem;
  color: #00FF94;
  overflow-y: auto;
  white-space: pre-wrap;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 255, 148, 0.1);

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
`;

const RunButton = styled.button`
  background: ${({ theme, $running }) => $running ? theme.colors.border : theme.colors.accent};
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: ${props => props.$running ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover {
    transform: ${props => props.$running ? 'none' : 'scale(1.05)'};
    box-shadow: 0 0 15px ${({ theme }) => theme.colors.accent}66;
  }
`;

export default function TestingHub() {
    const [suites, setSuites] = useState([]);
    const [selectedSuite, setSelectedSuite] = useState(null);
    const [logs, setLogs] = useState("Nexus E2E Terminal Ready...\nWaiting for execution directive.");
    const [running, setRunning] = useState(false);
    const consoleRef = useRef(null);

    useEffect(() => {
        loadSuites();
        pollStatus();
        const interval = setInterval(pollStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [logs]);

    const loadSuites = async () => {
        try {
            const data = await api.nexus.getTestSuites();
            setSuites(data.suites || []);
        } catch (e) { console.error(e); }
    };

    const pollStatus = async () => {
        try {
            const data = await api.nexus.getTestStatus();
            setRunning(data.running);
            if (data.logs) setLogs(data.logs);
        } catch (e) { /* silent fail on poll */ }
    };

    const runTests = async () => {
        if (running) return;
        setRunning(true);
        setLogs(`[SYSTEM] Initializing test execution for: ${selectedSuite?.name || 'All Suites'}\n`);
        try {
            await api.nexus.runTest(selectedSuite);
        } catch (e) {
            setLogs(prev => prev + `\n[ERROR] Failed to trigger tests: ${e.message}`);
            setRunning(false);
        }
    };

    return (
        <PageContainer>
            <Header>
                <Title>TESTING HUB</Title>
                <RunButton onClick={runTests} $running={running}>
                    {running ? <Activity size={20} className="animate-spin" /> : <Play size={20} />}
                    {running ? "EXECUTANDO..." : "EXECUTAR TESTES"}
                </RunButton>
            </Header>

            <StatsGrid>
                <StatCard>
                    <div className="icon"><Activity color="#00F2FF" /></div>
                    <div className="info">
                        <h3>Status</h3>
                        <p>{running ? "Operação Ativa" : "Standby"}</p>
                    </div>
                </StatCard>
                <StatCard>
                    <div className="icon"><Terminal color="#00FF94" /></div>
                    <div className="info">
                        <h3>Suítes</h3>
                        <p>{suites.length}</p>
                    </div>
                </StatCard>
                <StatCard>
                    <div className="icon"><ShieldAlert color="#FF0055" /></div>
                    <div className="info">
                        <h3>Falhas Recentes</h3>
                        <p>0</p>
                    </div>
                </StatCard>
            </StatsGrid>

            <TestArea>
                <SuiteList>
                    <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>SUÍTES DISPONÍVEIS</h2>
                    <SuiteItem
                        $active={selectedSuite === null}
                        onClick={() => setSelectedSuite(null)}
                    >
                        <span>Run All Tests</span>
                        <CheckCircle size={16} />
                    </SuiteItem>
                    {suites.map(suite => (
                        <SuiteItem
                            key={suite.id || suite.name}
                            $active={selectedSuite?.id === suite.id}
                            onClick={() => setSelectedSuite(suite)}
                        >
                            <span>{suite.name}</span>
                            <Play size={14} />
                        </SuiteItem>
                    ))}

                    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                        <a
                            href="/reports"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#00F2FF', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                        >
                            <ExternalLink size={14} /> Open Full HTML Report
                        </a>
                    </div>
                </SuiteList>

                <ConsoleOutput ref={consoleRef}>
                    {logs}
                </ConsoleOutput>
            </TestArea>
        </PageContainer>
    );
}
