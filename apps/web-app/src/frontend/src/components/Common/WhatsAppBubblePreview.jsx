import React from 'react';
import styled from 'styled-components';
import { FaCheckDouble } from 'react-icons/fa';

const Container = styled.div`
  background: #0b141a;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  user-select: none;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.5rem;

  .left {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #25d366;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 800;
    }

    .name {
      font-size: 0.78rem;
      font-weight: 700;
      color: #e2e8f0;
    }
  }

  .label {
    font-size: 0.68rem;
    color: #94a3b8;
  }
`;

const BubbleWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Bubble = styled.div`
  max-width: 88%;
  background: #005c4b;
  color: #f1f5f9;
  padding: 0.85rem;
  border-radius: 12px;
  border-top-right-radius: 2px;
  font-size: 0.78rem;
  line-height: 1.45;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  p {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;

    svg {
      color: #53bdeb;
    }
  }
`;

export default function WhatsAppBubblePreview({ text, recipientName, time = '12:00' }) {
  if (!text) return null;

  return (
    <Container>
      <TopBar>
        <div className="left">
          <div className="avatar">
            {(recipientName || 'L')[0]}
          </div>
          <span className="name">{recipientName || 'Candidata Licenciada'}</span>
        </div>
        <span className="label">Pré-visualização WhatsApp</span>
      </TopBar>

      <BubbleWrapper>
        <Bubble>
          <p>{text}</p>
          <div className="footer">
            <span>{time}</span>
            <FaCheckDouble size={10} />
          </div>
        </Bubble>
      </BubbleWrapper>
    </Container>
  );
}
