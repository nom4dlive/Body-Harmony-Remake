import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Database, Server, RefreshCw, ShieldCheck, AlertTriangle, Layers, Table, HardDrive, Zap, Download, Activity, Upload, FileUp } from 'lucide-react';
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
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: 2px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ theme, color }) => color || theme.colors.accent};
    opacity: 0.3;
  }

  .icon {
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
  }

  .info {
    h3 { font-size: 0.75rem; color: #CBD5E1; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    p { font-size: 1.7rem; font-weight: 800; margin: 0; color: #FFFFFF; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
`;

const TableList = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1.5rem;
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th {
    text-align: left;
    padding: 12px;
    color: #94A3B8;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  }

  td {
    padding: 14px 12px;
    font-size: 0.95rem;
    color: #F8FAFC;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  h2 {
    color: #F8FAFC;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ActionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h2 { 
    font-size: 1.1rem; 
    margin: 0; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    color: #FFFFFF;
    font-weight: 700;
  }
  p { 
    font-size: 0.9rem; 
    color: #CBD5E1; 
    margin: 0; 
    line-height: 1.5; 
  }
`;

const Button = styled.button`
  background: ${({ theme, variant }) => variant === 'danger' ? '#FF0055' : theme.colors.accent};
  color: #000;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Badge = styled.span`
  background: ${({ color }) => color || '#00FF94'}22;
  color: ${({ color }) => color || '#00FF94'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
`;

export default function DatabaseGovernance() {
  const [status, setStatus] = useState(null);
  const [exports, setExports] = useState([]);
  const [migrations, setMigrations] = useState({ available: [], applied: [] });
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [isTablesCollapsed, setIsTablesCollapsed] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importingLicenciadas, setImportingLicenciadas] = useState(false);

  const handleLicenciadasImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      alert("Apenas arquivos .csv são permitidos.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setImportingLicenciadas(true);
    try {
      const res = await api.nexus.importLicenciadasCSV(formData);
      alert(res.message || "Importação de licenciadas concluída com sucesso!");
      loadAll();
    } catch (e) {
      alert("Falha na importação: " + e.message);
    } finally {
      setImportingLicenciadas(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const dbStatus = await api.nexus.getNexusDbStatus();
      setStatus(dbStatus);
      const dbExports = await api.nexus.getDbExports();
      setExports(dbExports.exports || []);
      const dbMigrations = await api.nexus.getMigrations();
      setMigrations(dbMigrations || { available: [], applied: [] });
    } catch (e) {
      console.error("Database Ops failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.nexus.exportSnapshot();
      alert("Snapshot gerado com sucesso!");
      loadAll();
    } catch (e) {
      alert("Erro ao exportar: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleMigration = async (file) => {
    if (!window.confirm(`Deseja aplicar a migração ${file}? Esta ação pode alterar o schema do banco.`)) return;
    setMigrating(file);
    try {
      const res = await api.nexus.runMigration(file);
      alert(res.message || "Migration aplicada com sucesso!");
      loadAll();
    } catch (e) {
      alert("Erro ao aplicar migration: " + e.message);
    } finally {
      setMigrating(false);
    }
  };

  const handleSync = async () => {
    if (!window.confirm("Executar NEXUS SYNC? Isso aplicará todas as migrations pendentes localizadas no servidor.")) return;
    setRebuilding(true);
    try {
      const res = await api.nexus.nexusSync();
      alert(res.message || "Sincronia concluída!");
      loadAll();
    } catch (e) {
      alert("Erro no Sync: " + e.message);
    } finally {
      setRebuilding(false);
    }
  };

  const handleHeal = async () => {
    if (!window.confirm("Iniciar PROTOCOL HEAL? Isso analisará o banco e limpará logs com mais de 90 dias.")) return;
    setLoading(true);
    try {
      const res = await api.nexus.nexusHeal();
      alert(res.message);

      if (res.report_csv) {
        const link = document.createElement('a');
        link.href = 'data:text/csv;base64,' + res.report_csv;
        link.download = `integrity_report_${new Date().getTime()}.csv`;
        link.click();
      }
      loadAll();
    } catch (e) {
      alert("Protocol Heal falhou: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.sql')) {
      alert("Apenas arquivos .sql são permitidos.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.nexus.uploadMigration(formData);
      alert(res.message || "Migration enviada!");
      loadAll();
    } catch (e) {
      alert("Falha no upload: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSwitchNode = async (target) => {
    const label = target === 'oracle' ? 'UBUNTU STAGE' : 'HOSTINGER PROD';
    if (!window.confirm(`Deseja realmente trocar o nó de banco de dados para ${label}?`)) return;

    setLoading(true);
    try {
      await api.nexus.switchDb(target);
      alert(`Nó trocado para ${label} com sucesso!`);
      // Reload everything to see the changes
      window.location.reload();
    } catch (e) {
      alert("Erro ao trocar nó: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Carregando integridade do banco...</div>;

  const isStage = status?.db_label === 'UBUNTU_STAGE' || status?.db_label === 'ORACLE_STAGE' || status?.db_label === 'ORACLE_CLOUD';

  return (
    <PageContainer>
      <Header>
        <Title>DATABASE CONTROL</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Badge color={isStage ? "#ED7E13" : "#00F2FF"}>
            <Server size={12} style={{ marginRight: 4 }} />
            {status?.db_label || 'DESCONHECIDO'} ({status?.db_host})
          </Badge>
          <Badge color="#00FF94"><ShieldCheck size={12} style={{ marginRight: 4 }} /> Status: Healthy</Badge>
        </div>
      </Header>

      <StatsGrid>
        <StatCard color="#00F2FF">
          <div className="icon"><Table color="#00F2FF" /></div>
          <div className="info">
            <h3>Tabelas</h3>
            <p>{status?.total_tables || 0}</p>
          </div>
        </StatCard>
        <StatCard color="#00FF94">
          <div className="icon"><Layers color="#00FF94" /></div>
          <div className="info">
            <h3>Registros Totais</h3>
            <p>{status?.total_rows?.toLocaleString() || 0}</p>
          </div>
        </StatCard>
        <StatCard color="#ED7E13">
          <div className="icon"><HardDrive color="#ED7E13" /></div>
          <div className="info">
            <h3>Tamanho em Disco</h3>
            <p>{status?.total_size_mb || 0} MB</p>
          </div>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <TableList>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>LISTA DE TABELAS & AUDITORIA</h2>
              <Button
                onClick={() => setIsTablesCollapsed(!isTablesCollapsed)}
                style={{ padding: '4px 12px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
              >
                {isTablesCollapsed ? 'EXPANDIR LISTA' : 'RECOLHER'}
              </Button>
            </div>

            {!isTablesCollapsed && (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Tabela</th>
                      <th>Registros</th>
                      <th>Tamanho</th>
                      <th>Integridade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status?.tables?.map(t => (
                      <tr key={t.table}>
                        <td>{t.table}</td>
                        <td>{t.rows}</td>
                        <td>{t.size_mb} MB</td>
                        <td><Badge color="#00FF94">OK</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {isTablesCollapsed && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94A3B8', fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {status?.total_tables} tabelas monitoradas. Clique em expandir para ver detalhes.
              </div>
            )}
          </TableList>

          <TableList>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>CONTROLE DE MIGRATIONS (SCHEMA)</h2>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  id="migration-upload"
                  hidden
                  onChange={handleFileUpload}
                  accept=".sql"
                  disabled={uploading}
                />
                <Button
                  as="label"
                  htmlFor="migration-upload"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: uploading ? 'not-allowed' : 'pointer' }}
                >
                  <Upload size={14} /> {uploading ? "SUBINDO..." : "UPLOAD .SQL"}
                </Button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {migrations.available.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', opacity: 0.5 }}>Nenhuma migration encontrada em /api/migrations.</td></tr>
                ) : (
                  migrations.available.map(file => {
                    const isApplied = migrations.applied.includes(file);
                    return (
                      <tr key={file}>
                        <td>{file}</td>
                        <td>
                          {isApplied ? (
                            <Badge color="#00FF94">APLICADA</Badge>
                          ) : (
                            <Badge color="#ED7E13">PENDENTE</Badge>
                          )}
                        </td>
                        <td>
                          {!isApplied && (
                            <Button
                              onClick={() => handleMigration(file)}
                              disabled={migrating === file}
                              style={{ padding: '4px 12px', fontSize: '0.7rem' }}
                            >
                              {migrating === file ? "APLICANDO..." : "EXECUTAR"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </TableList>

          <TableList>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>SNAPSHOTS DISPONÍVEIS</h2>
              <Button onClick={handleExport} disabled={exporting} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                {exporting ? "GERANDO..." : "NOVO SNAPSHOT"}
              </Button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Tamanho</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {exports.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', opacity: 0.5 }}>Nenhum snapshot encontrado.</td></tr>
                ) : (
                  exports.map(exp => (
                    <tr key={exp.name}>
                      <td>{exp.name}</td>
                      <td>{exp.size}</td>
                      <td>{exp.date}</td>
                      <td>
                        <Button
                          onClick={() => api.nexus.downloadSnapshot(exp.name)}
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          DOWNLOAD
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableList>
        </div>

        <ControlPanel>
          <ActionCard>
            <h2><RefreshCw size={18} /> Nexus Sync</h2>
            <p>Sincroniza o banco de produção com todas as migrações (arquivos .sql) pendentes no servidor.</p>
            <Button variant="danger" onClick={handleSync} disabled={rebuilding}>
              {rebuilding ? "SINCRONIZANDO..." : "EXECUTAR NEXUS SYNC"}
            </Button>
          </ActionCard>

          <ActionCard>
            <h2><Activity size={18} /> Protocol Heal</h2>
            <p>Analisa integridade de tabelas, limpa logs &gt; 90 dias e gera relatório CSV de inconsistências.</p>
            <Button onClick={handleHeal} disabled={loading}>
              <Download size={14} /> INICIAR PROTOCOL HEAL
            </Button>
          </ActionCard>

          <ActionCard>
            <h2><HardDrive size={18} /> Licenciadas Backup</h2>
            <p>Exportar base completa para CSV ou importar/sincronizar dados em lote via CSV (Upsert seguro por CPF/E-mail).</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
              <Button onClick={() => api.nexus.exportLicenciadasCSV()} style={{ flex: 1 }}>
                <Download size={14} /> EXPORTAR
              </Button>
              <input
                type="file"
                id="licenciadas-csv-upload"
                hidden
                onChange={handleLicenciadasImport}
                accept=".csv"
                disabled={importingLicenciadas}
              />
              <Button
                as="label"
                htmlFor="licenciadas-csv-upload"
                style={{ flex: 1, cursor: importingLicenciadas ? 'not-allowed' : 'pointer' }}
              >
                <Upload size={14} /> {importingLicenciadas ? "LENDO..." : "IMPORTAR"}
              </Button>
            </div>
          </ActionCard>

          <ActionCard>
            <h2><Zap size={18} /> Switch Active Node</h2>
            <p>Altera o nó de banco de dados principal modificando o `env` global. Use com extrema cautela.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
              <Button
                onClick={() => handleSwitchNode('oracle')}
                disabled={isStage}
                style={{ flex: 1, background: isStage ? '#333' : '#ED7E13' }}
              >
                UBUNTU STAGE
              </Button>
              <Button
                onClick={() => handleSwitchNode('hostinger')}
                disabled={!isStage}
                style={{ flex: 1, background: !isStage ? '#333' : '#0A3E60' }}
              >
                HOSTINGER
              </Button>
            </div>
          </ActionCard>

          <ActionCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ED7E13' }}>
              <AlertTriangle size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SISTEMA DE GOVERNANÇA ATIVO</span>
            </div>
          </ActionCard>
        </ControlPanel>
      </ContentGrid>
    </PageContainer>
  );
}
