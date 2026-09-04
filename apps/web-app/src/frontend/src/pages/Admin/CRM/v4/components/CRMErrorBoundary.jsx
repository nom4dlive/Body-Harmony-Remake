import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaRedo, FaComments, FaShieldAlt } from 'react-icons/fa';

const FallbackCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  margin: 1rem auto;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(10, 62, 96, 0.08);

  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #FEE2E2;
    color: #EF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    margin: 0 auto 1.25rem auto;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: #0A3E60;
  }

  p {
    margin: 0 0 1.25rem 0;
    font-size: 0.85rem;
    color: #64748B;
    line-height: 1.5;
  }

  .error-details {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 0.85rem;
    text-align: left;
    font-family: monospace;
    font-size: 0.76rem;
    color: #991B1B;
    margin-bottom: 1.5rem;
    max-height: 140px;
    overflow-y: auto;
    word-break: break-word;
  }

  .btn-group {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;

    button {
      min-height: 44px;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      transition: all 0.2s ease;

      &.primary {
        background: #0A3E60;
        color: #FFFFFF;
        border: none;
        &:hover {
          background: #ED7E13;
          transform: translateY(-1px);
        }
      }

      &.secondary {
        background: #F1F5F9;
        color: #475569;
        border: 1px solid #CBD5E1;
        &:hover {
          background: #E2E8F0;
        }
      }
    }
  }

  .security-notice {
    margin-top: 1.5rem;
    font-size: 0.72rem;
    color: #10B981;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    font-weight: 600;
  }
`;

export default class CRMErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[CRMErrorBoundary - ${this.props.moduleName || 'Module'}]`, error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoToInbox = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.hash = '#inbox';
    }
  };

  render() {
    if (this.state.hasError) {
      const moduleName = this.props.moduleName || 'Painel do CRM';
      return (
        <FallbackCard>
          <div className="icon-box">
            <FaExclamationTriangle />
          </div>
          <h3>Falha Temporária no Módulo {moduleName}</h3>
          <p>
            Ocorreu uma inconsistência de renderização isolada neste painel.
            Sua sessão de login permanece 100% segura e ativa.
          </p>

          <div className="error-details">
            {this.state.error?.toString() || 'Erro desconhecido'}
          </div>

          <div className="btn-group">
            <button className="primary" onClick={this.handleReset}>
              <FaRedo /> Tentar Novamente
            </button>
            <button className="secondary" onClick={this.handleGoToInbox}>
              <FaComments /> Voltar ao Atendimento
            </button>
          </div>

          <div className="security-notice">
            <FaShieldAlt /> Sessão e tokens preservados com segurança.
          </div>
        </FallbackCard>
      );
    }

    return this.props.children;
  }
}
