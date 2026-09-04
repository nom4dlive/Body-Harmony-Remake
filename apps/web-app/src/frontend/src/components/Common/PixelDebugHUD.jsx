import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { trackPageView, trackBeginCheckout, trackPurchase } from '../../services/telemetry';

const pulse = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

const Container = styled.div`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const MinimizedPill = styled.button`
  background: rgba(10, 62, 96, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(237, 126, 19, 0.5);
  color: #fff;
  padding: 0.6rem 1rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #ed7e13;
    box-shadow: 0 10px 35px rgba(237, 126, 19, 0.3);
  }
`;

const LiveDot = styled.span`
  width: 9px;
  height: 9px;
  background: #22c55e;
  border-radius: 50%;
  animation: ${pulse} 2s infinite;
`;

const Panel = styled.div`
  width: 360px;
  max-width: calc(100vw - 2rem);
  background: rgba(10, 25, 41, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(237, 126, 19, 0.4);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  color: #f1f5f9;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 0.8rem 1rem;
  background: rgba(10, 62, 96, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f8fafc;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #94a3b8;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }
`;

const MetaInfo = styled.div`
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.72rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
`;

const SimulatorBar = styled.div`
  padding: 0.6rem 0.8rem;
  background: rgba(237, 126, 19, 0.08);
  border-bottom: 1px solid rgba(237, 126, 19, 0.15);
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const SimButton = styled.button`
  background: rgba(237, 126, 19, 0.2);
  border: 1px solid rgba(237, 126, 19, 0.4);
  color: #fbd38d;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #ed7e13;
    color: #fff;
  }
`;

const EventsList = styled.div`
  max-height: 220px;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`;

const EmptyNotice = styled.div`
  padding: 1.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
`;

const EventItem = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 3px solid ${props => props.$color || '#3b82f6'};
  border-radius: 6px;
  padding: 0.45rem 0.6rem;
  font-size: 0.72rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const EventRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EventName = styled.span`
  font-weight: 700;
  color: ${props => props.$color || '#fff'};
`;

const EventTime = styled.span`
  color: #64748b;
  font-size: 0.65rem;
`;

const EventData = styled.pre`
  margin: 0;
  color: #cbd5e1;
  font-family: monospace;
  font-size: 0.65rem;
  white-space: pre-wrap;
  word-break: break-all;
`;

export default function PixelDebugHUD() {
  const [enabled, setEnabled] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const hasParam = urlParams.get('debug_pixel') === 'true';
    const hasStorage = localStorage.getItem('debug_pixel') === 'true';

    if (hasParam) {
      localStorage.setItem('debug_pixel', 'true');
      setEnabled(true);
    } else if (hasStorage) {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleTelemetryEvent = (e) => {
      if (e?.detail) {
        setEvents(prev => [e.detail, ...prev].slice(0, 30));
      }
    };

    window.addEventListener('bh_telemetry_event', handleTelemetryEvent);
    return () => {
      window.removeEventListener('bh_telemetry_event', handleTelemetryEvent);
    };
  }, [enabled]);

  if (!enabled) return null;

  const getEventColor = (type) => {
    switch (type) {
      case 'Purchase': return '#22c55e'; // Verde
      case 'InitiateCheckout': return '#ed7e13'; // Dourado
      case 'PageView': return '#38bdf8'; // Azul céu
      default: return '#a855f7'; // Roxo
    }
  };

  if (minimized) {
    return (
      <Container>
        <MinimizedPill onClick={() => setMinimized(false)}>
          <LiveDot />
          <span>Pixel X-Ray ({events.length})</span>
        </MinimizedPill>
      </Container>
    );
  }

  return (
    <Container>
      <Panel>
        <Header>
          <Title>
            <LiveDot />
            <span>Meta Pixel X-Ray</span>
          </Title>
          <HeaderActions>
            <IconButton onClick={() => setEvents([])} title="Limpar eventos">
              ✕
            </IconButton>
            <IconButton onClick={() => setMinimized(true)} title="Minimizar">
              _
            </IconButton>
          </HeaderActions>
        </Header>

        <MetaInfo>
          <span>Pixel: 964269182520586</span>
          <span>GTM: NKXVL374</span>
        </MetaInfo>

        <SimulatorBar>
          <SimButton onClick={() => trackPageView(window.location.pathname, document.title)}>
            ▶ PageView
          </SimButton>
          <SimButton onClick={() => trackBeginCheckout({ tierName: 'Ingresso Experience', valueCents: 69700, tierId: 1 })}>
            ▶ Checkout (R$ 697)
          </SimButton>
          <SimButton onClick={() => trackPurchase({ orderId: 'test_' + Date.now(), tierName: 'Passaporte VIP Exclusive', valueCents: 149700, paymentMethod: 'credit_card' })}>
            ▶ Compra VIP (R$ 1.497)
          </SimButton>
        </SimulatorBar>

        <EventsList>
          {events.length === 0 ? (
            <EmptyNotice>
              Nenhum evento registrado ainda.<br />
              Navegue pelo site ou clique nos botões acima para simular!
            </EmptyNotice>
          ) : (
            events.map((evt, idx) => {
              const color = getEventColor(evt.type);
              return (
                <EventItem key={idx} $color={color}>
                  <EventRow>
                    <EventName $color={color}>● {evt.type}</EventName>
                    <EventTime>{evt.timestamp}</EventTime>
                  </EventRow>
                  <EventData>{JSON.stringify(evt.detail, null, 1)}</EventData>
                </EventItem>
              );
            })
          )}
        </EventsList>
      </Panel>
    </Container>
  );
}
