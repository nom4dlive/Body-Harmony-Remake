import { describe, it, expect } from 'vitest';
import {
  formatPhoneNumber,
  formatContactTitle,
  getDocMeta,
  formatFileSize
} from '../src/pages/Admin/CRM/v4/OmnichannelInbox';

describe('CRM UX Refinement & Helpers (PLAN-227)', () => {
  it('formata números de telefone no padrão brasileiro canônico E.164 legível', () => {
    expect(formatPhoneNumber('5518996193745')).toBe('+55 (18) 99619-3745');
    expect(formatPhoneNumber('5518997114455@s.whatsapp.net')).toBe('+55 (18) 99711-4455');
    expect(formatPhoneNumber('1203630248596102@g.us')).toBe('1203630248596102@g.us');
  });

  it('formata títulos de contatos com regra [Número Formatado] • [PushName] ou Nome de Grupo', () => {
    // Grupo
    const group = { isGroup: true, name: 'Congresso Body Harmony 2026', remote_jid: '123@g.us' };
    expect(formatContactTitle(group)).toBe('Congresso Body Harmony 2026');

    // Contato com nome e telefone
    const contactWithName = { name: 'Dra. Renata', phone: '5518997114455' };
    expect(formatContactTitle(contactWithName)).toBe('+55 (18) 99711-4455 • Dra. Renata');

    // Contato cujo nome é apenas o telefone bruto
    const contactOnlyNum = { name: '5518996193745', phone: '5518996193745' };
    expect(formatContactTitle(contactOnlyNum)).toBe('+55 (18) 99619-3745');

    // Contato nulo / fallback
    expect(formatContactTitle(null)).toBe('Contato WhatsApp');
  });

  it('classifica metadados de documentos por extensão e MIME type', () => {
    const pdfMeta = getDocMeta('contrato_franquia.pdf', 'application/pdf');
    expect(pdfMeta.ext).toBe('PDF');
    expect(pdfMeta.color).toBe('#DC2626');
    expect(pdfMeta.icon).toBe('📄');

    const docMeta = getDocMeta('proposta_comercial.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(docMeta.ext).toBe('DOCX');
    expect(docMeta.color).toBe('#2563EB');

    const xlsMeta = getDocMeta('planilha_faturamento.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(xlsMeta.ext).toBe('XLSX');
    expect(xlsMeta.color).toBe('#059669');
  });

  it('formata tamanho de arquivo em bytes para formato humano legível', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1024 * 50)).toBe('50.0 KB');
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    expect(formatFileSize(null)).toBe('');
  });
});
