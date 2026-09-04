import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaTimes, FaCalendarAlt, FaClock, FaExclamationTriangle, 
  FaUser, FaTag, FaFileAlt, FaCheckCircle
} from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 62, 96, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 580px;
  padding: 1.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #94a3b8;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    color: #0a3e60;
    background: #f1f5f9;
  }
`;

const ModalTitle = styled.h3`
  color: #0a3e60;
  font-size: 1.3rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.25rem 0;

  svg {
    color: #ed7e13;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #0a3e60;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  height: 44px;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.88rem;
  color: #1e293b;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;

  &:focus {
    border-color: #0a3e60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
  }
`;

const Select = styled.select`
  height: 44px;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.88rem;
  color: #1e293b;
  background: white;
  outline: none;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: #0a3e60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.88rem;
  color: #1e293b;
  min-height: 75px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    border-color: #0a3e60;
    box-shadow: 0 0 0 3px rgba(10, 62, 96, 0.1);
  }
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitBtn = styled.button`
  height: 48px;
  min-height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ed7e13 0%, #d96d07 100%);
  color: white;
  border: none;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.25);
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

export default function EventModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    event_type: 'pendencia',
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    priority: 'media',
    status: 'pendente',
    client_type: 'licenciada',
    color: '#0A3E60'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        event_type: initialData.event_type || 'pendencia',
        title: initialData.title || '',
        description: initialData.description || '',
        start_datetime: initialData.start_datetime ? initialData.start_datetime.replace(' ', 'T').substring(0, 16) : '',
        end_datetime: initialData.end_datetime ? initialData.end_datetime.replace(' ', 'T').substring(0, 16) : '',
        priority: initialData.priority || 'media',
        status: initialData.status || 'pendente',
        client_type: initialData.client_type || 'licenciada',
        color: initialData.color || '#0A3E60'
      });
    } else {
      const now = new Date().toISOString().substring(0, 16);
      setFormData({
        event_type: 'pendencia',
        title: '',
        description: '',
        start_datetime: now,
        end_datetime: '',
        priority: 'media',
        status: 'pendente',
        client_type: 'licenciada',
        color: '#0A3E60'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start_datetime) return;
    onSave(formData);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose} title="Fechar">
          <FaTimes />
        </CloseBtn>

        <ModalTitle>
          <FaCalendarAlt />
          {initialData ? 'Editar Evento / Pendência' : 'Novo Evento / Agendamento'}
        </ModalTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Tipo de Registro</Label>
            <Select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            >
              <option value="agendamento_cliente">📅 Agendamento de Cliente</option>
              <option value="pendencia">📌 Pendência / Tarefa Operacional</option>
              <option value="urgencia">🚨 Urgência Crítica</option>
              <option value="evento_geral">🏢 Evento Geral / Reunião</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Título *</Label>
            <Input
              type="text"
              required
              placeholder="Ex: Reunião de Onboarding Dra. Juliana"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </FormGroup>

          <GridRow>
            <FormGroup>
              <Label>Data / Hora Início *</Label>
              <Input
                type="datetime-local"
                required
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>Data / Hora Término</Label>
              <Input
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
              />
            </FormGroup>
          </GridRow>

          <GridRow>
            <FormGroup>
              <Label>Prioridade</Label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="critica">🔴 Crítica (Ação Imediata)</option>
                <option value="alta">🟠 Alta</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🔵 Baixa</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pendente">⏳ Pendente</option>
                <option value="em_andamento">🔄 Em Andamento</option>
                <option value="concluido">✅ Concluído</option>
                <option value="cancelado">❌ Cancelado / Adiado</option>
              </Select>
            </FormGroup>
          </GridRow>

          <FormGroup>
            <Label>Descrição / Instruções</Label>
            <Textarea
              rows={3}
              placeholder="Detalhes adicionais, orientações para a equipe ou pauta da reunião..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormGroup>

          <SubmitBtn type="submit">
            <FaCheckCircle /> {initialData ? 'Salvar Alterações' : 'Criar Registro na Agenda'}
          </SubmitBtn>
        </Form>
      </ModalCard>
    </ModalOverlay>
  );
}
