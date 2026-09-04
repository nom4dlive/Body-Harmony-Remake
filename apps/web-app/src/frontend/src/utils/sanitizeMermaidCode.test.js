/**
 * Testes Unitários do Escudo Anti-Alucinação de Mermaid
 * Demonstração dos 3 Casos de Teste (Strings Sujas do Qwen vs Saída Limpa)
 */

import { sanitizeMermaidCode } from './sanitizeMermaidCode.js';

// ============================================================================
// CASO DE TESTE 1: Aspas duplas aninhadas geradas pelo Qwen
// ============================================================================
export const testCase1_Dirty = `
\`\`\`mermaid
flowchart TB
    A["Protocolo "3S" de Eletroestimulação"] --> B["Parâmetro "Rise" de 2s"]
    B --> C["Fase de "Sensibilização" Muscular"]
\`\`\`
`;

export const testCase1_Clean = sanitizeMermaidCode(testCase1_Dirty);

// ============================================================================
// CASO DE TESTE 2: Omissão de cabeçalho oficial
// ============================================================================
export const testCase2_Dirty = `
    A["Início do Atendimento"] --> B["Higienização do Paciente"]
    B --> C["Posicionamento de Eletrodos"]
`;

export const testCase2_Clean = sanitizeMermaidCode(testCase2_Dirty);

// ============================================================================
// CASO DE TESTE 3: Caracteres XML/HTML não escapados (<, >, &)
// ============================================================================
export const testCase3_Dirty = `
flowchart TB
    A["Intensidade < 10mA & Frequência > 80Hz"] --> B["Cronaxia < 300us"]
`;

export const testCase3_Clean = sanitizeMermaidCode(testCase3_Dirty);

// Validação imediata
console.log('--- TESTE 1 (Aspas Aninhadas) ---');
console.log(testCase1_Clean);
console.log('\n--- TESTE 2 (Omissão de Cabeçalho) ---');
console.log(testCase2_Clean);
console.log('\n--- TESTE 3 (Caracteres XML) ---');
console.log(testCase3_Clean);
