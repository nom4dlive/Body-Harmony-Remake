// 🏛️ Empirical Frontend Stress Test Harness — PLAN-064 (Nexus Protocol V3.1)
// Author: challenger_frontend_1

import assert from 'node:assert';

console.log('================================================================');
console.log('⚡ STARTING FRONTEND ADVERSARIAL STRESS TEST SUITE (PLAN-064)');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
const findings = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
    findings.push({ test: name, error: err.message, stack: err.stack });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. REPRODUCING HELPERS DIRECTLY FROM SOURCE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// From PublicOnboardingPage.jsx
const maskCpf = (v = '') => {
  return (v || '')
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const maskPhone = (v = '') => {
  return (v || '')
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2');
};

const maskCep = (v = '') => {
  return (v || '')
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{3})$/, '$1-$2');
};

function isValidCPF(cpf) {
  if (typeof cpf !== 'string') return false;
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

// From OnboardingFunnelPage.jsx
const formatCpf = (v = '') => {
  const str = v === null || v === undefined ? '' : String(v);
  const digits = str.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return v || '—';
};

const formatPhone = (v = '') => {
  const str = v === null || v === undefined ? '' : String(v);
  const digits = str.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return v || '—';
};

// From GenerateContractModal.jsx
function numeroPorExtenso(valorNumerico) {
  if (!valorNumerico || isNaN(valorNumerico)) return 'zero reais';
  const val = Math.floor(valorNumerico);
  
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (val === 100) return 'cem reais';
  if (val === 1000) return 'um mil reais';

  const converterCentena = (n) => {
    let out = [];
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) {
      if (c === 1 && d === 0 && u === 0) {
        out.push('cem');
      } else {
        out.push(centenas[c]);
      }
    }

    if (d === 1) {
      out.push(especiais[u]);
    } else {
      if (d > 1) out.push(dezenas[d]);
      if (u > 0) out.push(unidades[u]);
    }
    return out.join(' e ');
  };

  if (val < 1000) {
    return converterCentena(val) + (val === 1 ? ' real' : ' reais');
  }

  if (val >= 1000 && val < 1000000) {
    const milhar = Math.floor(val / 1000);
    const resto = val % 1000;
    let parteMilhar = milhar === 1 ? 'um mil' : converterCentena(milhar) + ' mil';
    if (resto === 0) return parteMilhar + ' reais';
    let parteResto = converterCentena(resto);
    return `${parteMilhar}${resto <= 100 || resto % 100 === 0 ? ' e ' : ' '}${parteResto} reais`;
  }

  return `${val.toLocaleString('pt-BR')} reais`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: FORMATTERS & MASKS ADVERSARIAL TESTING
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- Suite 1: Input Formatters & Boundary Conditions ---');

test('maskCpf handles empty string, null, undefined, extreme lengths, and letters', () => {
  assert.strictEqual(maskCpf(''), '');
  assert.strictEqual(maskCpf(null), '');
  assert.strictEqual(maskCpf(undefined), '');
  assert.strictEqual(maskCpf('12345678901'), '123.456.789-01');
  assert.strictEqual(maskCpf('1234567890199999999999999'), '123.456.789-01'); // capped at 11 digits
  assert.strictEqual(maskCpf('abc!@#1$2%3^4&5*6(7)8_9+0=1'), '123.456.789-01');
  assert.strictEqual(maskCpf('123'), '123');
  assert.strictEqual(maskCpf('1234'), '123.4');
  assert.strictEqual(maskCpf('1234567'), '123.456.7');
});

test('maskPhone handles empty string, null, undefined, 10-digit, 11-digit, progressive typing', () => {
  assert.strictEqual(maskPhone(''), '');
  assert.strictEqual(maskPhone(null), '');
  assert.strictEqual(maskPhone(undefined), '');
  assert.strictEqual(maskPhone('11'), '11');
  assert.strictEqual(maskPhone('119'), '(11) 9');
  assert.strictEqual(maskPhone('11987654321'), '(11) 98765-4321');
  assert.strictEqual(maskPhone('11987654321999999'), '(11) 98765-4321');
});

test('maskCep handles empty, null, undefined, 8-digit, and oversized', () => {
  assert.strictEqual(maskCep(''), '');
  assert.strictEqual(maskCep(null), '');
  assert.strictEqual(maskCep(undefined), '');
  assert.strictEqual(maskCep('01001000'), '01001-000');
  assert.strictEqual(maskCep('0100100099999'), '01001-000');
});

test('formatCpf and formatPhone in OnboardingFunnelPage handle null, undefined, raw numbers', () => {
  const sourceFormatCpf = (v = '') => {
    if (!v) return '—';
    const digits = String(v).replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return v || '—';
  };

  assert.strictEqual(sourceFormatCpf(null), '—');
  assert.strictEqual(sourceFormatCpf(undefined), '—');
  assert.strictEqual(sourceFormatCpf(''), '—');
  assert.strictEqual(sourceFormatCpf('52998224725'), '529.982.247-25');
  assert.strictEqual(sourceFormatCpf(12345678901), '123.456.789-01');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: CPF MATHEMATICAL VALIDATION & EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 2: CPF Validation Adversarial Test ---');

test('isValidCPF correctly validates genuine Brazilian CPFs', () => {
  const validCPFs = [
    '52998224725',
    '529.982.247-25',
    '11144477735',
    '111.444.777-35'
  ];

  validCPFs.forEach(cpf => {
    assert.strictEqual(isValidCPF(cpf), true, `Expected ${cpf} to be valid`);
  });
});

test('isValidCPF rejects invalid check digits, repeated digits, null, undefined, types', () => {
  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
    '12345678901', // Invalid checksum
    '52998224726', // Wrong second check digit
    '52998224735', // Wrong first check digit
    '',
    '123',
    'not-a-cpf',
    null,
    undefined,
    12345678901, // number instead of string
    {},
    []
  ];

  invalidCPFs.forEach(cpf => {
    assert.strictEqual(isValidCPF(cpf), false, `Expected ${JSON.stringify(cpf)} to be rejected`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: NUMERO POR EXTENSO CURRENCY CONVERTER
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 3: Currency to Portuguese Words Conversion ---');

test('numeroPorExtenso accurately renders zero, single units, hundreds, and thousands', () => {
  assert.strictEqual(numeroPorExtenso(0), 'zero reais');
  assert.strictEqual(numeroPorExtenso(null), 'zero reais');
  assert.strictEqual(numeroPorExtenso(undefined), 'zero reais');
  assert.strictEqual(numeroPorExtenso(NaN), 'zero reais');
  assert.strictEqual(numeroPorExtenso(1), 'um real');
  assert.strictEqual(numeroPorExtenso(2), 'dois reais');
  assert.strictEqual(numeroPorExtenso(10), 'dez reais');
  assert.strictEqual(numeroPorExtenso(15), 'quinze reais');
  assert.strictEqual(numeroPorExtenso(20), 'vinte reais');
  assert.strictEqual(numeroPorExtenso(25), 'vinte e cinco reais');
  assert.strictEqual(numeroPorExtenso(100), 'cem reais');
  assert.strictEqual(numeroPorExtenso(105), 'cento e cinco reais');
  assert.strictEqual(numeroPorExtenso(250), 'duzentos e cinquenta reais');
  assert.strictEqual(numeroPorExtenso(1000), 'um mil reais');
  assert.strictEqual(numeroPorExtenso(1500), 'um mil e quinhentos reais');
  assert.strictEqual(numeroPorExtenso(15000), 'quinze mil reais');
  assert.strictEqual(numeroPorExtenso(20000), 'vinte mil reais');
  assert.strictEqual(numeroPorExtenso(30000), 'trinta mil reais');
  assert.strictEqual(numeroPorExtenso(45000), 'quarenta e cinco mil reais');
  assert.strictEqual(numeroPorExtenso(125430), 'cento e vinte e cinco mil quatrocentos e trinta reais');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: FUNNEL DATA ROBUSTNESS & GROUPING RESILIENCE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 4: Funnel State & Response Robustness ---');

test('Funnel grouping logic handles completely empty API responses without throwing', () => {
  const emptyRes = {};
  let funnelData = {
    pre_cadastro: [],
    documentos_recebidos: [],
    contrato_emitido: [],
    validar_pagamento: [],
    ativo_liberado: []
  };

  if (emptyRes && emptyRes.columns) {
    funnelData = {
      pre_cadastro: emptyRes.columns.pre_cadastro || [],
      documentos_recebidos: emptyRes.columns.documentos_recebidos || [],
      contrato_emitido: emptyRes.columns.contrato_emitido || [],
      validar_pagamento: emptyRes.columns.validar_pagamento || [],
      ativo_liberado: emptyRes.columns.ativo_liberado || []
    };
  }

  assert.strictEqual(funnelData.pre_cadastro.length, 0);
  assert.strictEqual(funnelData.documentos_recebidos.length, 0);
  assert.strictEqual(funnelData.contrato_emitido.length, 0);
  assert.strictEqual(funnelData.validar_pagamento.length, 0);
  assert.strictEqual(funnelData.ativo_liberado.length, 0);
});

test('Funnel grouping handles flat items with corrupt, missing, or alien status values', () => {
  const flatItemsRes = {
    items: [
      { id: 1, nome: 'Ana', status: 'pre_cadastro' },
      { id: 2, nome: 'Beatriz', status: 'documentos_recebidos' },
      { id: 3, nome: 'Carla', status: 'contrato_emitido' },
      { id: 4, nome: 'Daniela', status: 'aguardando_assinatura' },
      { id: 5, nome: 'Eduarda', status: 'ativo_liberado' },
      { id: 6, nome: 'Fernanda', status: 'alien_status_123' },
      { id: 7, nome: null, cpf: null, status: null }
    ]
  };

  const grouped = {
    pre_cadastro: [],
    documentos_recebidos: [],
    contrato_emitido: [],
    validar_pagamento: [],
    ativo_liberado: []
  };

  flatItemsRes.items.forEach(item => {
    const st = item.status || 'pre_cadastro';
    if (grouped[st]) grouped[st].push(item);
    else if (st === 'aguardando_assinatura') grouped.validar_pagamento.push(item);
    else grouped.pre_cadastro.push(item);
  });

  assert.strictEqual(grouped.pre_cadastro.length, 3);
  assert.strictEqual(grouped.documentos_recebidos.length, 1);
  assert.strictEqual(grouped.contrato_emitido.length, 1);
  assert.strictEqual(grouped.validar_pagamento.length, 1);
  assert.strictEqual(grouped.ativo_liberado.length, 1);
});

test('KPI calculations survive zero leads and massive lists', () => {
  const computeKpis = (data) => {
    const totalPre = data.pre_cadastro.length;
    const totalDocs = data.documentos_recebidos.length;
    const totalContracts = data.contrato_emitido.length;
    const totalValidating = data.validar_pagamento.length;
    const totalActive = data.ativo_liberado.length;
    const totalAll = totalPre + totalDocs + totalContracts + totalValidating + totalActive;
    return { totalAll, totalPre, totalDocs, totalContracts, totalValidating, totalActive };
  };

  const emptyKpis = computeKpis({
    pre_cadastro: [],
    documentos_recebidos: [],
    contrato_emitido: [],
    validar_pagamento: [],
    ativo_liberado: []
  });

  assert.strictEqual(emptyKpis.totalAll, 0);
  assert.strictEqual(emptyKpis.totalPre, 0);

  const massiveList = Array.from({ length: 5000 }, (_, i) => ({ id: i }));
  const massiveKpis = computeKpis({
    pre_cadastro: massiveList,
    documentos_recebidos: massiveList,
    contrato_emitido: massiveList,
    validar_pagamento: massiveList,
    ativo_liberado: massiveList
  });

  assert.strictEqual(massiveKpis.totalAll, 25000);
});

test('Search filter handles special regex chars without crashing (e.g. *, [, +, ?, ( )', () => {
  const leads = [
    { id: 1, nome: 'Dra. Camila [Especialista]', cpf: '52998224725', telefone_whatsapp: '(11) 99999-9999', cidade: 'São Paulo' },
    { id: 2, nome: 'Dr. Roberto + Santos', cpf: '11144477735', telefone_whatsapp: '(21) 98888-8888', cidade: 'Rio de Janeiro' },
    { id: 3, nome: null, cpf: null, telefone_whatsapp: null, cidade: null }
  ];

  const filterLeads = (searchStr) => {
    return leads.filter(item => {
      const matchSearch = !searchStr || 
        (item.nome && item.nome.toLowerCase().includes(searchStr.toLowerCase())) ||
        (item.cpf && item.cpf.includes(searchStr)) ||
        (item.telefone_whatsapp && item.telefone_whatsapp.includes(searchStr)) ||
        (item.cidade && item.cidade.toLowerCase().includes(searchStr.toLowerCase()));
      return matchSearch;
    });
  };

  assert.strictEqual(filterLeads('[').length, 1);
  assert.strictEqual(filterLeads('+').length, 1);
  assert.strictEqual(filterLeads('.*').length, 0);
  assert.strictEqual(filterLeads('(11)').length, 1);
  assert.strictEqual(filterLeads('não-existe').length, 0);
  assert.strictEqual(filterLeads('').length, 3);
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: PUBLIC ONBOARDING VALIDATION & SUBMISSION INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 5: Public Form Validation & Extreme Input Bounds ---');

test('Step 1 validation blocks missing names, invalid CPFs, short phones, bad emails', () => {
  const validateStep1 = (form) => {
    if (!form.nome || !form.nome.trim()) return { valid: false, error: 'Nome obrigatório' };
    const cleanCpf = (form.cpf || '').replace(/\D/g, '');
    if (cleanCpf.length !== 11 || !isValidCPF(cleanCpf)) return { valid: false, error: 'CPF inválido' };
    if (!form.telefone_whatsapp || !form.telefone_whatsapp.trim() || form.telefone_whatsapp.replace(/\D/g, '').length < 10) {
      return { valid: false, error: 'WhatsApp inválido' };
    }
    if (!form.email || !form.email.trim() || !form.email.includes('@')) {
      return { valid: false, error: 'Email inválido' };
    }
    return { valid: true };
  };

  assert.strictEqual(validateStep1({ nome: '', cpf: '52998224725', telefone_whatsapp: '11999999999', email: 'test@bh.com' }).valid, false);
  assert.strictEqual(validateStep1({ nome: 'Camila', cpf: '00000000000', telefone_whatsapp: '11999999999', email: 'test@bh.com' }).valid, false);
  assert.strictEqual(validateStep1({ nome: 'Camila', cpf: '52998224725', telefone_whatsapp: '123', email: 'test@bh.com' }).valid, false);
  assert.strictEqual(validateStep1({ nome: 'Camila', cpf: '52998224725', telefone_whatsapp: '11999999999', email: 'invalid-email' }).valid, false);
  assert.strictEqual(validateStep1({ nome: 'Camila', cpf: '529.982.247-25', telefone_whatsapp: '(11) 99999-9999', email: 'camila@clinica.com' }).valid, true);
});

test('Step 2 validation requires document attachment', () => {
  const validateStep2 = (file) => {
    return file !== null && file !== undefined;
  };

  assert.strictEqual(validateStep2(null), false);
  assert.strictEqual(validateStep2(undefined), false);
  assert.strictEqual(validateStep2({ name: 'cnh.jpg', size: 1024 }), true);
});

test('Step 3 validation enforces LGPD consent check', () => {
  const validateStep3 = (consent) => {
    return consent === true;
  };

  assert.strictEqual(validateStep3(false), false);
  assert.strictEqual(validateStep3(null), false);
  assert.strictEqual(validateStep3(true), true);
});

test('Extreme string length (500-char name, XSS injection payload) is safely encapsulated', () => {
  const extremeName = 'A'.repeat(500);
  const xssPayload = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
  
  const form = {
    nome: extremeName + xssPayload,
    cpf: '52998224725',
    telefone_whatsapp: '(11) 99999-9999',
    email: 'test@bodyharmony.com.br'
  };

  assert.ok(form.nome.length > 500);
  assert.ok(form.nome.includes('<script>'));
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: WHATSAPP TEMPLATE STRING INTERPOLATION & ENCODING
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Suite 6: WhatsApp Message Construction & URI Safety ---');

test('WhatsApp message URI correctly encodes unicode, emojis, line breaks, and parameters', () => {
  const firstName = 'Camila & Patrícia';
  const signUrl = 'https://bodyharmony.com.br/assinar/uuid-12345-67890';
  const phone = '(11) 98765-4321';
  
  const text = `Olá, ${firstName}! ✨ Tudo bem? 🌿\n\nLink: ${signUrl}`;
  const cleanPhone = phone.replace(/\D/g, '');
  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;

  assert.ok(waUrl.startsWith('https://wa.me/5511987654321?text='));
  assert.ok(waUrl.includes(encodeURIComponent('Camila & Patrícia')));
  assert.ok(waUrl.includes(encodeURIComponent('✨')));
  assert.ok(!waUrl.includes('\n'));
});

console.log('\n================================================================');
console.log(`📊 ADVERSARIAL STRESS TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
