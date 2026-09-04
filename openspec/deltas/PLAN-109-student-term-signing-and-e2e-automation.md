# DELTA SPEC: PLAN-109 — Assinatura Digital de Termos de Cursos/Módulos & Suite E2E de Testes Pré/Pós-Deploy

## 1. Contexto & Diagnóstico
Alunas de cursos e módulos individuais (ex: Protocolo 3S, Glúteo Max, etc.) necessitam de assinatura eletrônica formal de Termo de Ciência, Responsabilidade e Concordância antes do consumo dos vídeos. O sistema precisa garantir zero atrito, suporte mobile perfeito e automação de validação contínua (sem necessidade de testes manuais tela por tela).

## 2. Requisitos de Engenharia
1. **Template Parametrizado Dinâmico (`termo_modulo_individual`)**:
   - Injeção dinâmica de `{ALUNA_NOME}`, `{ALUNA_CPF}`, `{CURSO_NOME}`, `{CURSO_DESCRICAO}`, `{DATA_EXTENSO}`.
   - Cláusulas de consumo imediato, natureza autoral, não-reembolso após liberação (Art. 49 CDC) e propriedade intelectual.
2. **Hard Gate Híbrido**:
   - Link de assinatura pública mobile-friendly `/assinar/:signToken`.
   - Gate in-app no `PortalAluna`: Bloqueio do player de aulas até que o termo referente àquele curso/módulo seja assinado.
   - Geração de PDF com mPDF, QR Code de validação, IP, Geolocation e Hash SHA-256.
3. **Suite Automatizada E2E (`scripts/devops/test_contract_signing_e2e.ps1`)**:
   - Teste sintético automatizado pré-deploy (`nexus_gate.ps1`) e pós-deploy (`deploy-hostinger.ps1`) cobrindo:
     - Geração de contrato
     - Renderização de preview
     - Assinatura com canvas mock
     - Compilação do PDF assinado
     - Validação de integridade do QR Code e hash SHA-256
     - Download HTTP 200 e limpeza segura dos dados de teste.
