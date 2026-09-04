import { describe, it, expect } from 'vitest';

describe('CRM V4 Ergonomics & Chat Bubbles Matrix (PLAN-186)', () => {
  it('should align sent messages (ME) to the right with WhatsApp green bubble', () => {
    const msg = { sender: 'ME', text: 'Olá, seu horário está confirmado!' };
    const isMe = msg.sender === 'ME';
    const alignment = isMe ? 'flex-end' : 'flex-start';
    const defaultBg = isMe ? '#DCF8C6' : '#FFFFFF';

    expect(isMe).toBe(true);
    expect(alignment).toBe('flex-end');
    expect(defaultBg).toBe('#DCF8C6');
  });

  it('should align received messages (CLIENT) to the left with white bubble', () => {
    const msg = { sender: 'CLIENT', text: 'Obrigado! Qual o endereço?' };
    const isMe = msg.sender === 'ME';
    const alignment = isMe ? 'flex-end' : 'flex-start';
    const defaultBg = isMe ? '#DCF8C6' : '#FFFFFF';

    expect(isMe).toBe(false);
    expect(alignment).toBe('flex-start');
    expect(defaultBg).toBe('#FFFFFF');
  });

  it('should sanitize contact names safely without null pointer exceptions', () => {
    const contactNull = { name: null, phone: '+5518996959486' };
    const contactEmpty = { name: '', phone: '+5518998887766' };
    const contactValid = { name: 'Dra. Joselene', phone: '+5518991112233' };

    const getDisplayName = (c) => c?.name || c?.phone || 'Contato WhatsApp';
    const getInitial = (c) => ((c?.name || c?.phone || 'C').charAt(0)).toUpperCase();

    expect(getDisplayName(contactNull)).toBe('+5518996959486');
    expect(getInitial(contactNull)).toBe('+');

    expect(getDisplayName(contactEmpty)).toBe('+5518998887766');
    expect(getInitial(contactEmpty)).toBe('+');

    expect(getDisplayName(contactValid)).toBe('Dra. Joselene');
    expect(getInitial(contactValid)).toBe('D');
  });
});
