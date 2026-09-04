import React, { useState } from 'react';
import styled from 'styled-components';
import { FaLock, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { api } from '../../../services/api';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  background: ${({ theme }) => theme.colors.darkSurface};
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);

  h2 {
    color: ${({ theme }) => theme.colors.secondary};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.darkTextMuted};
  cursor: pointer;
  transition: color 0.3s;
  &:hover { color: #FFF; }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  
  label {
    display: block;
    color: ${({ theme }) => theme.colors.darkTextMuted};
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #FFF;
    font-size: 1rem;
    transition: border-color 0.3s;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.secondary};
      outline: none;
    }
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
  font-size: 0.95rem;
  transition: all 0.3s;
  
  &:hover {
    background: #e67300;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMsg = styled.div`
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 0.9rem;
`;

export const ChangePasswordModal = ({ onClose }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPass.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.studentChangePassword(currentPass, newPass);
      alert('Senha alterada com sucesso!');
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay>
      <ModalCard>
        <CloseBtn onClick={onClose}><FaTimes size={20} /></CloseBtn>
        <h2><FaLock /> Alterar Senha</h2>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Senha Atual</label>
            <input
              type="password"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>Nova Senha</label>
            <input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <label>Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              required
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? <FaSpinner className="spin" /> : <FaSave />}
            {loading ? 'Salvando...' : 'Atualizar Senha'}
          </Button>
        </form>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </ModalCard>
    </Overlay>
  );
};
