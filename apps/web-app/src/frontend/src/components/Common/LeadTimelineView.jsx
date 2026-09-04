import React from 'react';
import styled from 'styled-components';
import { FaClock, FaCheckCircle } from 'react-icons/fa';

const Container = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  h5 {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #0a3e60;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    svg {
      color: #ed7e13;
    }
  }
`;

const TimelineList = styled.div`
  position: relative;
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 6px;
    bottom: 6px;
    width: 2px;
    background: #cbd5e1;
  }
`;

const StepItem = styled.div`
  position: relative;

  .node {
    position: absolute;
    left: -1.5rem;
    top: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${props => props.$done ? '#16a34a' : 'white'};
    color: ${props => props.$done ? 'white' : '#64748b'};
    border: 1px solid ${props => props.$done ? '#16a34a' : '#cbd5e1'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    font-weight: 800;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 0.8rem;
        font-weight: 700;
        color: ${props => props.$done ? '#0a3e60' : '#64748b'};
      }

      .date {
        font-size: 0.68rem;
        color: #94a3b8;
        font-family: monospace;
      }
    }

    p {
      margin: 0;
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.35;
    }
  }
`;

export default function LeadTimelineView({ lead }) {
  if (!lead) return null;

  const stages = [
    {
      key: 'pre_cadastro',
      label: '1. Link Enviado & Pré-cadastro',
      desc: 'Token gerado e formulário público submetido.',
      done: true,
      date: lead.created_at
    },
    {
      key: 'documentos_recebidos',
      label: '2. Documentos & Anexos Recebidos',
      desc: lead.documento_img ? 'Anexos enviados com sucesso.' : 'Aguardando envio dos documentos.',
      done: !!lead.documento_img || lead.status !== 'LINK_ENVIADO',
      date: lead.updated_at
    },
    {
      key: 'contrato_emitido',
      label: '3. Homologação & Emissão de Contrato',
      desc: lead.contract_uuid ? 'Contrato emitido e pronto para assinatura.' : 'Aguardando validação do gestor.',
      done: !!lead.contract_uuid,
      date: lead.contract_created_at || null
    },
    {
      key: 'validar_pagamento',
      label: '4. Validação Financeira',
      desc: lead.payment_confirmed_at ? 'Pagamento confirmado pelo gestor.' : 'Aguardando comprovante / conciliação.',
      done: !!lead.payment_confirmed_at,
      date: lead.payment_confirmed_at
    },
    {
      key: 'ativo_liberado',
      label: '5. Licenciada Ativada & LMS',
      desc: lead.activated_at ? 'Conta provisionada e liberada.' : 'Aguardando ativação final.',
      done: !!lead.activated_at,
      date: lead.activated_at
    }
  ];

  return (
    <Container>
      <h5>
        <FaClock /> Linha do Tempo / Ciclo de Vida do Lead
      </h5>

      <TimelineList>
        {stages.map((st, idx) => (
          <StepItem key={idx} $done={st.done}>
            <div className="node">
              {st.done ? <FaCheckCircle size={10} /> : idx + 1}
            </div>
            <div className="content">
              <div className="header-row">
                <span className="title">{st.label}</span>
                {st.date && (
                  <span className="date">
                    {st.date.slice(0, 16).replace('T', ' ')}
                  </span>
                )}
              </div>
              <p>{st.desc}</p>
            </div>
          </StepItem>
        ))}
      </TimelineList>
    </Container>
  );
}
