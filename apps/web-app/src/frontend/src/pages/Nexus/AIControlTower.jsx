import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    Brain, Settings, Bug, History, Shield,
    Save, RefreshCw, AlertCircle, CheckCircle,
    Eye, FileText, Activity, Terminal, Server
} from 'lucide-react';
import { api } from '../../services/api';

const Container = styled.div`
  color: #E0E0FF;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
  padding-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-family: 'Bison', sans-serif;
  font-size: 2.8rem;
  letter-spacing: 3px;
  color: #E0E0FF;
  display: flex;
  align-items: center;
  gap: 20px;

  span {
    color: #00F2FF;
    text-shadow: 0 0 15px rgba(0, 242, 255, 0.5);
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  background: ${props => props.active ? 'rgba(0, 242, 255, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.active ? '#00F2FF' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#00F2FF' : '#8B8B9E'};
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  font-size: 0.85rem;

  &:hover {
    background: rgba(0, 242, 255, 0.05);
    border-color: #00F2FF88;
  }
`;

const ContentPanel = styled.div`
  background: rgba(10, 62, 96, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  min-height: 500px;
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.label`
  color: #8B8B9E;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E0E0FF;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  width: 100%;

  &:focus {
    border-color: #00F2FF;
    outline: none;
    box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
  }
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E0E0FF;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  width: 100%;
  cursor: pointer;

  &:focus {
    border-color: #00F2FF;
    outline: none;
    box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
  }

  option {
    background: #051A29;
    color: #E0E0FF;
  }
`;

const TextArea = styled.textarea`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E0E0FF;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  width: 100%;
  min-height: 250px;
  resize: vertical;

  &:focus {
    border-color: #00F2FF;
    outline: none;
  }
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #00F2FF 0%, #0077FF 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-family: 'Bison', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GhostButton = styled.button`
  background: transparent;
  border: 1px solid rgba(0, 242, 255, 0.3);
  color: #00F2FF;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 242, 255, 0.05);
    border-color: #00F2FF;
  }
`;

const AuditTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;

  th {
    text-align: left;
    color: #8B8B9E;
    padding: 1rem;
    border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  background: ${props => {
        if (props.status === 'ANALYZED') return 'rgba(0, 255, 148, 0.1)';
        if (props.status === 'PENDING') return 'rgba(255, 184, 0, 0.1)';
        return 'rgba(255, 0, 85, 0.1)';
    }};
  color: ${props => {
        if (props.status === 'ANALYZED') return '#00FF94';
        if (props.status === 'PENDING') return '#FFB800';
        return '#FF0055';
    }};
`;

const AIControlTower = () => {
    const [activeTab, setActiveTab] = useState('config');
    const [configs, setConfigs] = useState({
        gemini_api_key: '',
        gemini_model: '',
        doctor_harmony_system_prompt: '',
        confidence_threshold: '0.80',
        ai_provider: 'gemini',
        nvidia_api_key: '',
        nvidia_model: 'meta/llama-3.2-11b-vision-instruct'
    });
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [health, setHealth] = useState(null);

    useEffect(() => {
        fetchConfigs();
        fetchLogs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await api.doctorHarmony.getConfig();
            if (res.success) setConfigs(res.config);
        } catch (e) {
            console.error('Failed to load configs', e);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.doctorHarmony.getAuditLogs();
            if (res.success) setAuditLogs(res.logs);
        } catch (e) {
            console.error('Failed to load logs', e);
        }
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            const res = await api.doctorHarmony.updateConfig(configs);
            if (res.success) alert('Configurações salvas!');
        } catch (e) {
            alert('Falha ao salvar: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const checkHealth = async () => {
        setLoading(true);
        try {
            const res = await api.doctorHarmony.healthCheck();
            setHealth(res);
        } catch (e) {
            setHealth({ success: false, message: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSandboxSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        try {
            const res = await api.doctorHarmony.runSandbox(formData);
            setTestResult(res.result);
        } catch (e) {
            alert('Erro no sandbox: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Header>
                <Title>
                    <Brain size={40} />
                    NEURAL // <span>OVERSIGHT CENTER</span>
                </Title>
                <GhostButton onClick={checkHealth} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    SYSTEM HEALTH: {health?.status || 'UNKNOWN'}
                </GhostButton>
            </Header>

            <TabBar>
                <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')}>
                    <Settings size={18} /> Configuration
                </TabButton>
                <TabButton active={activeTab === 'sandbox'} onClick={() => setActiveTab('sandbox')}>
                    <Bug size={18} /> Clinical Sandbox
                </TabButton>
                <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>
                    <History size={18} /> Shadow Log
                </TabButton>
            </TabBar>

            <ContentPanel>
                {activeTab === 'config' && (
                    <ConfigGrid>
                        <InputGroup>
                            <SectionTitle><Brain size={20} /> CORE ANALYTICS</SectionTitle>

                            <InputGroup>
                                <Label><Brain size={14} /> AI Provider Gateway</Label>
                                <Select
                                    value={configs.ai_provider || 'gemini'}
                                    onChange={(e) => setConfigs({ ...configs, ai_provider: e.target.value })}
                                >
                                    <option value="gemini">Google Gemini API</option>
                                    <option value="nvidia">NVIDIA NIM API (Llama / Nemotron)</option>
                                </Select>
                            </InputGroup>

                            {(!configs.ai_provider || configs.ai_provider === 'gemini') ? (
                                <>
                                    <InputGroup>
                                        <Label><Shield size={14} /> Gemini API Key</Label>
                                        <Input
                                            type="password"
                                            value={configs.gemini_api_key || ''}
                                            onChange={(e) => setConfigs({ ...configs, gemini_api_key: e.target.value })}
                                        />
                                    </InputGroup>

                                    <InputGroup>
                                        <Label><Server size={14} /> Gemini Model Selection</Label>
                                        <Input
                                            value={configs.gemini_model || ''}
                                            onChange={(e) => setConfigs({ ...configs, gemini_model: e.target.value })}
                                            placeholder="ex: gemini-2.0-flash"
                                        />
                                    </InputGroup>
                                </>
                            ) : (
                                <>
                                    <InputGroup>
                                        <Label><Shield size={14} /> NVIDIA API Key</Label>
                                        <Input
                                            type="password"
                                            value={configs.nvidia_api_key || ''}
                                            onChange={(e) => setConfigs({ ...configs, nvidia_api_key: e.target.value })}
                                        />
                                    </InputGroup>

                                    <InputGroup>
                                        <Label><Server size={14} /> NVIDIA Model Selection</Label>
                                        <Input
                                            value={configs.nvidia_model || ''}
                                            onChange={(e) => setConfigs({ ...configs, nvidia_model: e.target.value })}
                                            placeholder="ex: meta/llama-3.2-11b-vision-instruct"
                                        />
                                    </InputGroup>
                                </>
                            )}

                            <InputGroup>
                                <Label><Activity size={14} /> Confidence Threshold</Label>
                                <Input
                                    type="number" step="0.05"
                                    value={configs.confidence_threshold}
                                    onChange={(e) => setConfigs({ ...configs, confidence_threshold: e.target.value })}
                                />
                            </InputGroup>

                            <PrimaryButton onClick={handleSaveConfig} disabled={saving} style={{ marginTop: '1rem' }}>
                                <Save size={20} /> {saving ? 'SALVANDO...' : 'ATUALIZAR CONFIG'}
                            </PrimaryButton>
                        </InputGroup>

                        <InputGroup>
                            <SectionTitle><FileText size={20} /> SYSTEM PROMPT</SectionTitle>
                            <Label>Influência Clínica da Doctor Harmony</Label>
                            <TextArea
                                value={configs.doctor_harmony_system_prompt}
                                onChange={(e) => setConfigs({ ...configs, doctor_harmony_system_prompt: e.target.value })}
                            />
                            <div style={{ color: '#666', fontSize: '0.8rem' }}>
                                Use este campo para injetar novos protocolos ou limites clínicos sem deploy.
                            </div>
                        </InputGroup>
                    </ConfigGrid>
                )}

                {activeTab === 'sandbox' && (
                    <form onSubmit={handleSandboxSubmit}>
                        <ConfigGrid>
                            <InputGroup>
                                <SectionTitle><Terminal size={20} /> RUN TEST CASE</SectionTitle>
                                <InputGroup>
                                    <Label>Imagem de Avaliação</Label>
                                    <Input type="file" name="file" accept="image/*" />
                                </InputGroup>
                                <InputGroup>
                                    <Label>Notas do Admin (Prompt Usuario)</Label>
                                    <TextArea name="notes" placeholder="Descreva um caso hipotético..." />
                                </InputGroup>
                                <PrimaryButton type="submit" disabled={loading}>
                                    <Bug size={18} /> EXECUTAR TESTE
                                </PrimaryButton>
                            </InputGroup>

                            <InputGroup>
                                <SectionTitle><Eye size={20} /> LIVE RESPONSE</SectionTitle>
                                {loading ? (
                                    <div className="animate-pulse" style={{ color: '#888' }}>Processando via Gemini...</div>
                                ) : testResult ? (
                                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ color: '#00FF94', marginBottom: '1rem' }}>Confiança: {(testResult.confidence * 100).toFixed(1)}%</div>
                                        <div style={{ color: '#E0E0FF' }}>{testResult.opinion}</div>
                                    </div>
                                ) : (
                                    <div style={{ color: '#666' }}>Aguardando submissão do sandbox...</div>
                                )}
                            </InputGroup>
                        </ConfigGrid>
                    </form>
                )}

                {activeTab === 'audit' && (
                    <div>
                        <SectionTitle><History size={20} /> CLINICAL SHADOW LOG</SectionTitle>
                        <AuditTable>
                            <thead>
                                <tr>
                                    <th>licenciada / LICENÇA</th>
                                    <th>CONTEÚDO</th>
                                    <th>CONFIANÇA</th>
                                    <th>STATUS</th>
                                    <th>AÇÃO</th>
                                    <th>DATA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <div style={{ color: '#E0E0FF' }}>{log.student_name}</div>
                                            <div style={{ color: '#666', fontSize: '0.7rem' }}>{log.license_key}</div>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.case_description}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: log.confidence_score > 0.8 ? '#00FF94' : '#FF0055' }}>
                                                {(log.confidence_score * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td><StatusBadge status={log.status}>{log.status}</StatusBadge></td>
                                        <td>
                                            {log.photo_path && (
                                                <GhostButton
                                                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                                                    onClick={() => window.open(`${api.API_BASE}/download.php?case_id=${log.id}&mode=view`, '_blank')}
                                                >
                                                    <Eye size={12} style={{ marginRight: '4px' }} /> VER
                                                </GhostButton>
                                            )}
                                        </td>
                                        <td>{new Date(log.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </AuditTable>
                    </div>
                )}
            </ContentPanel>
        </Container>
    );
};

const SectionTitle = styled.h3`
  font-family: 'Bison', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #E0E0FF;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export default AIControlTower;
