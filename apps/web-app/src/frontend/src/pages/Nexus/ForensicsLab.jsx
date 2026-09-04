import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    Upload, FileText, CheckCircle, AlertTriangle,
    Search, Shield, User, MapPin,
    Beaker, Download, Layers, Sliders, Eye, EyeOff
} from 'lucide-react';
import { api } from '../../services/api';
import ForensicsLogsTable from '../../components/Nexus/ForensicsLogsTable';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.05)'};
  color: ${({ $active }) => $active ? '#000' : '#fff'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
`;

const LabLayout = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr 350px;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const GroupTitle = styled.h3`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SliderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    display: flex;
    justify-content: space-between;
  }
  
  input[type="range"] {
    width: 100%;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Toggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  cursor: pointer;
  
  span {
    font-size: 0.9rem;
  }
`;

const PreviewCanvas = styled.div`
  background: #222;
  border: 2px solid #333;
  width: 100%;
  aspect-ratio: 210 / 297; /* A4 Ratio */
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PageLayer = styled.div`
  background: #fff;
  width: 90%;
  height: 90%;
  position: relative;
  color: #000;
`;

const WatermarkPreview = styled.div`
  position: absolute;
  left: ${({ $x }) => ($x / 210) * 100}%;
  top: ${({ $y }) => ($y / 297) * 100}%;
  opacity: ${({ $opacity }) => $opacity};
  font-weight: bold;
  font-size: ${({ $size }) => $size || 8}px;
  pointer-events: none;
  white-space: nowrap;
  transform: translate(-50%, -50%);
`;

const LogoPreview = styled.img`
  position: absolute;
  left: ${({ $x }) => ($x / 210) * 100}%;
  top: ${({ $y }) => ($y / 297) * 100}%;
  width: ${({ $size }) => $size || 30}px;
  height: auto;
  opacity: ${({ $opacity }) => $opacity};
  pointer-events: none;
  transform: translate(-50%, -50%);
`;

const SecurityPreview = styled.img`
  position: absolute;
  left: ${({ $x }) => ($x / 210) * 100}%;
  top: ${({ $y }) => ($y / 297) * 100}%;
  width: ${({ $size }) => $size || 20}px;
  height: auto;
  opacity: ${({ $opacity }) => $opacity};
  pointer-events: none;
  transform: translate(-50%, -50%);
`;

const LayerSelector = styled.div`
  display: flex;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 0.2rem;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
`;

const LayerTab = styled.button`
  flex: 1;
  background: ${({ $active }) => $active ? '#00F2FF' : 'transparent'};
  color: ${({ $active }) => $active ? '#000' : '#888'};
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) => $active ? '#00F2FF' : 'rgba(255,255,255,0.05)'};
  }
`;

const StudentList = styled.div`
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #333;
  border-radius: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }
`;

const StudentItem = styled.div`
  padding: 0.8rem;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? 'rgba(0, 242, 255, 0.1)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  input {
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionButton = styled.button`
  background: ${({ theme, $variant }) => $variant === 'secondary' ? 'transparent' : theme.colors.primary};
  color: ${({ $variant }) => $variant === 'secondary' ? '#00F2FF' : '#000'};
  border: ${({ $variant }) => $variant === 'secondary' ? '1px solid #00F2FF' : 'none'};
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  margin-top: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const DropZone = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  background: rgba(0, 242, 255, 0.05);

  &:hover {
    background: rgba(0, 242, 255, 0.1);
  }
  
  input { display: none; }
`;

const ForensicsLab = () => {
    // Tabs & Global
    const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'lab' | 'config'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Audit State
    const [file, setFile] = useState(null);
    const [report, setReport] = useState(null);

    // Lab State
    const [licenciadas, setLicenciadas] = useState([]);
    const [selectedLicenciadas, setSelectedLicenciadas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLayer, setActiveLayer] = useState('text'); // 'text' | 'logo' | 'security'
    const [labConfig, setLabConfig] = useState({
        text: { x: 105, y: 148, opacity: 0.4, visible: true, size: 10 },
        logo: { x: 25, y: 25, opacity: 0.1, visible: true, size: 30 },
        security: { x: 185, y: 275, opacity: 0.05, visible: true, size: 20 }
    });

    const [globalConfig, setGlobalConfig] = useState(null);
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        if (activeTab === 'lab') fetchLicenciadas();
        if (activeTab === 'config') fetchGlobalConfig();
    }, [activeTab]);

    const fetchGlobalConfig = async () => {
        try {
            setLoading(true);
            const data = await api.nexus.getForensicsConfig();
            setGlobalConfig(data || labConfig);
        } catch (err) {
            console.error("Erro ao carregar config:", err);
            setError("Falha ao carregar configuração padrão.");
        } finally {
            setLoading(false);
        }
    };

    const saveGlobalConfig = async () => {
        try {
            setSavingConfig(true);
            await api.nexus.updateForensicsConfig(globalConfig);
            alert("Configuração salva com sucesso! Todos os novos downloads usarão este padrão.");
        } catch (err) {
            alert("Erro ao salvar configuração.");
        } finally {
            setSavingConfig(false);
        }
    };

    const fetchLicenciadas = async () => {
        try {
            const response = await api.nexus.getForensicsLicenciadas();
            setLicenciadas(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Falha ao carregar licenciadas.');
        }
    };

    const handleAuditSelect = (e) => {
        const selected = e.target.files[0];
        if (selected?.type === 'application/pdf') setFile(selected);
        else setError('Apenas arquivos PDF são permitidos.');
    };

    const analyzeFile = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.nexus.analyzeForensics(formData);
            setReport(response);
        } catch (err) {
            setError('Falha na análise.');
        } finally {
            setLoading(false);
        }
    };

    const handleInspectHash = async (hash) => {
        if (!hash) return;
        setLoading(true);
        setError('');
        try {
            const data = await api.nexus.lookupForensicsHash(hash);
            setReport(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            setError('Falha na busca pelo hash.');
        } finally {
            setLoading(false);
        }
    };

    const toggleLicenciadaSelection = (id) => {
        setSelectedLicenciadas(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedLicenciadas.length === licenciadas.length) setSelectedLicenciadas([]);
        else setSelectedLicenciadas(licenciadas.map(s => s.id));
    };

    const generateMatrices = async () => {
        if (selectedLicenciadas.length === 0) return;
        setLoading(true);
        setError('');
        try {
            const response = await api.nexus.generateForensicsBatch({
                student_ids: selectedLicenciadas,
                config: labConfig
            });
            if (response?.download_url) {
                window.location.href = response.download_url;
            }
        } catch (err) {
            setError('Falha ao gerar matrizes.');
        } finally {
            setLoading(false);
        }
    };

    const filteredLicenciadas = (licenciadas || []).filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.cpf && s.cpf.includes(searchTerm))
    );

    return (
        <Container>
            <Header>
                <Title>
                    <Search size={32} color="#00F2FF" />
                    FORENSICS LAB
                </Title>
            </Header>

            <TabContainer>
                <Tab $active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>
                    <Search size={18} /> Auditoria
                </Tab>
                <Tab $active={activeTab === 'lab'} onClick={() => setActiveTab('lab')}>
                    <Beaker size={18} /> Lab Experimental
                </Tab>
                <Tab $active={activeTab === 'config'} onClick={() => setActiveTab('config')}>
                    <Sliders size={18} /> Configuração Global
                </Tab>
            </TabContainer>

            {activeTab === 'audit' ? (
                <>
                    <Card>
                        {!report ? (
                            <DropZone onClick={() => document.getElementById('fileInput').click()}>
                                <input id="fileInput" type="file" accept="application/pdf" onChange={handleAuditSelect} />
                                <Upload size={48} color="#00F2FF" style={{ marginBottom: '1rem' }} />
                                <h3>Arraste um PDF suspeito ou selecione um arquivo</h3>
                                {file && <p style={{ color: '#00F2FF', marginTop: '1rem' }}>Selecionado: {file.name}</p>}
                            </DropZone>
                        ) : (
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2>Relatório de Análise</h2>
                                    <span style={{ background: report.verdict === 'POSITIVE_IDENTIFICATION' ? '#00FF99' : '#FFDD00', color: '#000', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
                                        {report.verdict}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                        <small style={{ color: '#aaa' }}>Hash do Arquivo</small>
                                        <p style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>{report.file_hash}</p>
                                    </div>
                                    {report.verdict === 'POSITIVE_IDENTIFICATION' && (
                                        <div style={{ background: 'rgba(0,255,153,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #00FF99' }}>
                                            <small style={{ color: '#00FF99' }}>Licenciada Identificada</small>
                                            <p>{report.fingerprint_analysis.extracted_data?.student_name || report.database_match?.licenciada}</p>
                                            <p style={{ fontSize: '0.8rem' }}>CPF: {report.fingerprint_analysis.extracted_data?.cpf || report.database_match?.cpf}</p>
                                        </div>
                                    )}
                                </div>
                                <ActionButton $variant="secondary" onClick={() => { setReport(null); setFile(null); }}>
                                    NOVA ANÁLISE
                                </ActionButton>
                            </div>
                        )}

                        {file && !report && (
                            <ActionButton onClick={analyzeFile} disabled={loading}>
                                {loading ? 'ANALISANDO...' : 'INICIAR ANÁLISE'}
                            </ActionButton>
                        )}
                    </Card>
                    <ForensicsLogsTable onSelectHash={handleInspectHash} />
                </>
            ) : activeTab === 'lab' ? (
                <Card>
                    <LabLayout>
                        <ControlPanel>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                                <GroupTitle><Search size={16} /> Selecionar Licenciadas</GroupTitle>
                                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome ou CPF..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '0.8rem', borderRadius: '8px', color: '#fff' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <small>{selectedLicenciadas.length} selecionadas</small>
                                    <small style={{ color: '#00F2FF', cursor: 'pointer' }} onClick={selectAll}>
                                        {selectedLicenciadas.length === licenciadas.length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
                                    </small>
                                </div>
                                <StudentList>
                                    {filteredLicenciadas.map(s => (
                                        <StudentItem key={s.id} $selected={selectedLicenciadas.includes(s.id)} onClick={() => toggleLicenciadaSelection(s.id)}>
                                            <input type="checkbox" checked={selectedLicenciadas.includes(s.id)} readOnly />
                                            <div>
                                                <div>{s.name}</div>
                                                <small style={{ color: '#666' }}>{s.cpf || 'Sem CPF'}</small>
                                            </div>
                                        </StudentItem>
                                    ))}
                                </StudentList>
                            </div>
                        </ControlPanel>

                        <div>
                            <GroupTitle><Eye size={16} /> Preview da Matriz (A4)</GroupTitle>
                            <PreviewCanvas>
                                <PageLayer>
                                    {labConfig.logo.visible && (
                                        <LogoPreview
                                            src="/logo.svg"
                                            $x={labConfig.logo.x}
                                            $y={labConfig.logo.y}
                                            $opacity={labConfig.logo.opacity}
                                            $size={labConfig.logo.size}
                                        />
                                    )}

                                    {labConfig.text.visible && (
                                        <WatermarkPreview
                                            $x={labConfig.text.x}
                                            $y={labConfig.text.y}
                                            $opacity={labConfig.text.opacity}
                                            $size={labConfig.text.size}
                                            style={{ textAlign: 'center', lineHeight: '1.2' }}
                                        >
                                            Documento gerado para uso exclusivo de:<br />
                                            NOME DA LICENCIADA (CPF: 000.000.000-00)
                                        </WatermarkPreview>
                                    )}

                                    {labConfig.security.visible && (
                                        <SecurityPreview
                                            src="/assets/icons/security-icon.svg"
                                            $x={labConfig.security.x}
                                            $y={labConfig.security.y}
                                            $opacity={labConfig.security.opacity}
                                            $size={labConfig.security.size}
                                        />
                                    )}

                                    <div style={{ position: 'absolute', bottom: 5, left: 5, fontSize: '4px', opacity: 0.1 }}>
                                        Generated by Admin (0.0.0.0)
                                    </div>
                                </PageLayer>
                            </PreviewCanvas>
                        </div>

                        <ControlPanel>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                                <GroupTitle><Sliders size={16} /> Ajustes da camada</GroupTitle>

                                <LayerSelector>
                                    <LayerTab $active={activeLayer === 'text'} onClick={() => setActiveLayer('text')}>Texto</LayerTab>
                                    <LayerTab $active={activeLayer === 'logo'} onClick={() => setActiveLayer('logo')}>Logo</LayerTab>
                                    <LayerTab $active={activeLayer === 'security'} onClick={() => setActiveLayer('security')}>Shield</LayerTab>
                                </LayerSelector>

                                <SliderGroup>
                                    <label>Eixo X (Horizontal) <span>{labConfig[activeLayer].x}mm</span></label>
                                    <input
                                        type="range" min="0" max="210" step="1"
                                        value={labConfig[activeLayer].x}
                                        onChange={(e) => setLabConfig({
                                            ...labConfig,
                                            [activeLayer]: { ...labConfig[activeLayer], x: parseInt(e.target.value) }
                                        })}
                                    />
                                </SliderGroup>

                                <SliderGroup style={{ marginTop: '1rem' }}>
                                    <label>Eixo Y (Vertical) <span>{labConfig[activeLayer].y}mm</span></label>
                                    <input
                                        type="range" min="0" max="297" step="1"
                                        value={labConfig[activeLayer].y}
                                        onChange={(e) => setLabConfig({
                                            ...labConfig,
                                            [activeLayer]: { ...labConfig[activeLayer], y: parseInt(e.target.value) }
                                        })}
                                    />
                                </SliderGroup>

                                <SliderGroup style={{ marginTop: '1rem' }}>
                                    <label>Opacidade <span>{Math.round(labConfig[activeLayer].opacity * 100)}%</span></label>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={labConfig[activeLayer].opacity}
                                        onChange={(e) => setLabConfig({
                                            ...labConfig,
                                            [activeLayer]: { ...labConfig[activeLayer], opacity: parseFloat(e.target.value) }
                                        })}
                                    />
                                </SliderGroup>

                                <SliderGroup style={{ marginTop: '1rem' }}>
                                    <label>Tamanho <span>{labConfig[activeLayer].size || (activeLayer === 'text' ? 10 : 20)}px</span></label>
                                    <input
                                        type="range" min="5" max={activeLayer === 'text' ? 40 : 200} step="1"
                                        value={labConfig[activeLayer].size || (activeLayer === 'text' ? 10 : 20)}
                                        onChange={(e) => setLabConfig({
                                            ...labConfig,
                                            [activeLayer]: { ...labConfig[activeLayer], size: parseInt(e.target.value) }
                                        })}
                                    />
                                </SliderGroup>
                                <div style={{ marginTop: '2rem' }}>
                                    <GroupTitle><Layers size={16} /> Visibilidade</GroupTitle>
                                    <Toggle onClick={() => setLabConfig({
                                        ...labConfig,
                                        [activeLayer]: { ...labConfig[activeLayer], visible: !labConfig[activeLayer].visible }
                                    })}>
                                        <span>Exibir Camada de {activeLayer}</span>
                                        {labConfig[activeLayer].visible ? <Eye size={18} color="#00F2FF" /> : <EyeOff size={18} color="#666" />}
                                    </Toggle>
                                </div>
                            </div>

                            <ActionButton onClick={generateMatrices} disabled={loading || selectedLicenciadas.length === 0}>
                                <Download size={20} />
                                {loading ? 'GERANDO...' : `GERAR ${selectedLicenciadas.length} MATRIZES`}
                            </ActionButton>
                            <p style={{ fontSize: '0.7rem', color: '#666', textAlign: 'center', marginTop: '1rem' }}>
                                Os arquivos serão compactados em um .TAR para download único.
                            </p>
                        </ControlPanel>
                    </LabLayout>
                </Card>
            ) : null}

            {activeTab === 'config' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    <Card style={{ padding: '1rem', background: '#111' }}>
                        <GroupTitle><Eye size={16} /> Preview do Padrão Global</GroupTitle>
                        <PreviewCanvas>
                            <PageLayer>
                                {globalConfig?.logo?.visible && (
                                    <LogoPreview
                                        src="/logo.svg"
                                        $x={globalConfig.logo.x}
                                        $y={globalConfig.logo.y}
                                        $opacity={globalConfig.logo.opacity}
                                        $size={globalConfig.logo.size}
                                    />
                                )}

                                {globalConfig?.text?.visible && (
                                    <WatermarkPreview
                                        $x={globalConfig.text.x}
                                        $y={globalConfig.text.y}
                                        $opacity={globalConfig.text.opacity}
                                        $size={globalConfig.text.size}
                                        style={{ textAlign: 'center', lineHeight: '1.2' }}
                                    >
                                        Documento gerado para uso exclusivo de:<br />
                                        ID DA licenciada (CPF: 000.000.000-00)
                                    </WatermarkPreview>
                                )}

                                {globalConfig?.security?.visible && (
                                    <SecurityPreview
                                        src="/assets/icons/security-icon.svg"
                                        $x={globalConfig.security.x}
                                        $y={globalConfig.security.y}
                                        $opacity={globalConfig.security.opacity}
                                        $size={globalConfig.security.size}
                                    />
                                )}
                            </PageLayer>
                        </PreviewCanvas>
                    </Card>

                    <ControlPanel>
                        <Card style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <GroupTitle><Sliders size={16} /> Ajustar Camada Padrão</GroupTitle>

                            <LayerSelector>
                                <LayerTab $active={activeLayer === 'text'} onClick={() => setActiveLayer('text')}>Texto</LayerTab>
                                <LayerTab $active={activeLayer === 'logo'} onClick={() => setActiveLayer('logo')}>Logo</LayerTab>
                                <LayerTab $active={activeLayer === 'security'} onClick={() => setActiveLayer('security')}>Shield</LayerTab>
                            </LayerSelector>

                            {globalConfig && (
                                <>
                                    <SliderGroup>
                                        <label>Eixo X (Horizontal) <span>{globalConfig[activeLayer].x}mm</span></label>
                                        <input
                                            type="range" min="0" max="210" step="1"
                                            value={globalConfig[activeLayer].x}
                                            onChange={(e) => setGlobalConfig({
                                                ...globalConfig,
                                                [activeLayer]: { ...globalConfig[activeLayer], x: parseInt(e.target.value) }
                                            })}
                                        />
                                    </SliderGroup>

                                    <SliderGroup style={{ marginTop: '1rem' }}>
                                        <label>Eixo Y (Vertical) <span>{globalConfig[activeLayer].y}mm</span></label>
                                        <input
                                            type="range" min="0" max="297" step="1"
                                            value={globalConfig[activeLayer].y}
                                            onChange={(e) => setGlobalConfig({
                                                ...globalConfig,
                                                [activeLayer]: { ...globalConfig[activeLayer], y: parseInt(e.target.value) }
                                            })}
                                        />
                                    </SliderGroup>

                                    <SliderGroup style={{ marginTop: '1rem' }}>
                                        <label>Opacidade <span>{Math.round(globalConfig[activeLayer].opacity * 100)}%</span></label>
                                        <input
                                            type="range" min="0" max="1" step="0.01"
                                            value={globalConfig[activeLayer].opacity}
                                            onChange={(e) => setGlobalConfig({
                                                ...globalConfig,
                                                [activeLayer]: { ...globalConfig[activeLayer], opacity: parseFloat(e.target.value) }
                                            })}
                                        />
                                    </SliderGroup>

                                    <SliderGroup style={{ marginTop: '1rem' }}>
                                        <label>Tamanho <span>{globalConfig[activeLayer].size || (activeLayer === 'text' ? 10 : 20)}px</span></label>
                                        <input
                                            type="range" min="5" max={activeLayer === 'text' ? 40 : 200} step="1"
                                            value={globalConfig[activeLayer].size || (activeLayer === 'text' ? 10 : 20)}
                                            onChange={(e) => setGlobalConfig({
                                                ...globalConfig,
                                                [activeLayer]: { ...globalConfig[activeLayer], size: parseInt(e.target.value) }
                                            })}
                                        />
                                    </SliderGroup>

                                    <div style={{ marginTop: '1.5rem' }}>
                                        <Toggle onClick={() => setGlobalConfig({
                                            ...globalConfig,
                                            [activeLayer]: { ...globalConfig[activeLayer], visible: !globalConfig[activeLayer].visible }
                                        })}>
                                            <span>Visível por padrão</span>
                                            {globalConfig[activeLayer].visible ? <Eye size={18} color="#00F2FF" /> : <EyeOff size={18} color="#666" />}
                                        </Toggle>
                                    </div>

                                    <ActionButton
                                        onClick={saveGlobalConfig}
                                        disabled={savingConfig}
                                        style={{ marginTop: '2rem', background: '#00F2FF' }}
                                    >
                                        <CheckCircle size={18} /> {savingConfig ? 'Salvando...' : 'Salvar como Padrão'}
                                    </ActionButton>
                                </>
                            )}
                        </Card>
                    </ControlPanel>
                </div>
            )}

            {error && (
                <div style={{ color: '#FF0055', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}
        </Container>
    );
};

export default ForensicsLab;
