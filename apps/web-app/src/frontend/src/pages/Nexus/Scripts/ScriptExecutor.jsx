import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Play, Loader } from 'lucide-react';
import { api } from '../../../services/api';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 { margin: 0; color: #fff; font-size: 1.25rem; }
  .close-btn { cursor: pointer; color: #999; &:hover { color: #fff; } }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const ParamField = styled.div`
  margin-bottom: 20px;
  
  label { display: block; color: #ccc; font-size: 0.95rem; font-weight: 500; margin-bottom: 8px; }
  .description { color: #666; font-size: 0.85rem; margin-top: 4px; }
  
  select, input[type="checkbox"] {
    width: 100%;
    padding: 10px 14px;
    background: #0d0d0d;
    border: 1px solid #333;
    border-radius: 8px;
    color: #fff;
    font-size: 0.95rem;
    
    &:focus { outline: none; border-color: #0A3E60; }
  }
  
  input[type="checkbox"] { width: auto; margin-right: 8px; }
`;

const ResultPanel = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 8px;
  
  h3 { color: #fff; margin: 0 0 12px; font-size: 1rem; }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .stat {
    text-align: center;
    padding: 12px;
    background: #1a1a1a;
    border-radius: 6px;
    
    .value { font-size: 1.5rem; font-weight: 600; color: #0A3E60; }
    .label { font-size: 0.8rem; color: #999; margin-top: 4px; }
  }
  
  .details {
    max-height: 300px;
    overflow-y: auto;
    background: #000;
    padding: 12px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    
    div { color: #ccc; margin-bottom: 4px; }
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 24px;
  background: ${props => props.$primary ? '#0A3E60' : 'transparent'};
  border: 1px solid ${props => props.$primary ? '#0A3E60' : '#444'};
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { background: ${props => props.$primary ? '#0d5080' : '#222'}; }
`;

const ScriptExecutor = ({ script, onClose, onComplete }) => {
    const [params, setParams] = useState({});
    const [executing, setExecuting] = useState(false);
    const [result, setResult] = useState(null);

    const handleParamChange = (paramName, value) => {
        setParams(prev => ({ ...prev, [paramName]: value }));
    };

    const handleExecute = async () => {
        setExecuting(true);
        setResult(null);

        try {
            const res = await api.media.executeScript(script.id, params);
            setResult(res.result);
            setTimeout(() => onComplete(), 2000);
        } catch (err) {
            console.error('Execution failed:', err);
            setResult({ error: err.message || 'Execution failed' });
        } finally {
            setExecuting(false);
        }
    };

    return (
        <Modal onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Header>
                    <h2>{script.icon} {script.name}</h2>
                    <X size={24} className="close-btn" onClick={onClose} />
                </Header>

                <Body>
                    <p style={{ color: '#999', marginBottom: '24px' }}>{script.description}</p>

                    {script.params?.map(param => (
                        <ParamField key={param.name}>
                            <label>{param.label}</label>

                            {param.type === 'select' && (
                                <select
                                    value={params[param.name] || param.default}
                                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                                >
                                    {param.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            )}

                            {param.type === 'boolean' && (
                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={params[param.name] || param.default}
                                        onChange={(e) => handleParamChange(param.name, e.target.checked)}
                                    />
                                    {param.description}
                                </label>
                            )}

                            {param.description && param.type !== 'boolean' && (
                                <div className="description">{param.description}</div>
                            )}
                        </ParamField>
                    ))}

                    {result && (
                        <ResultPanel>
                            <h3>Resultado da Execução</h3>

                            {result.error ? (
                                <div style={{ color: '#ef4444' }}>❌ {result.error}</div>
                            ) : (
                                <>
                                    <div className="stats">
                                        <div className="stat">
                                            <div className="value">{result.scanned || 0}</div>
                                            <div className="label">Escaneados</div>
                                        </div>
                                        <div className="stat">
                                            <div className="value">{result.synced || 0}</div>
                                            <div className="label">Sincronizados</div>
                                        </div>
                                        <div className="stat">
                                            <div className="value">{result.skipped || 0}</div>
                                            <div className="label">Ignorados</div>
                                        </div>
                                        <div className="stat">
                                            <div className="value">{result.errors || 0}</div>
                                            <div className="label">Erros</div>
                                        </div>
                                    </div>

                                    {result.details && result.details.length > 0 && (
                                        <div className="details">
                                            {result.details.map((detail, i) => (
                                                <div key={i}>{detail}</div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </ResultPanel>
                    )}
                </Body>

                <Footer>
                    <Button onClick={onClose}>Fechar</Button>
                    <Button $primary onClick={handleExecute} disabled={executing}>
                        {executing ? (
                            <>
                                <Loader size={16} className="spinning" />
                                Executando...
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                Executar
                            </>
                        )}
                    </Button>
                </Footer>
            </ModalContent>
        </Modal>
    );
};

export default ScriptExecutor;
