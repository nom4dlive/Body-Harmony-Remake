# 🧪 TEST INFRASTRUCTURE & ARCHITECTURE SPECIFICATION
## Funil de Onboarding de Licenciadas (PLAN-064) — Nexus Protocol V3.1

**Documento:** `TEST_INFRA.md`  
**Versão:** 3.1.0  
**Data:** 2026-08-21  
**Autor:** E2E Testing Orchestrator / Test Writer (`test_writer_e2e_1`)  
**Ambiente:** PHP 8.4 CLI / Windows 11 / Zero External Dependencies  

---

## 1. Visão Geral & Filosofia de Testes

O ecossistema **Body Harmony (Nexus Protocol V3.1)** exige confiabilidade absoluta na esteira de Onboarding de Licenciadas (PLAN-064). A infraestrutura de testes foi projetada sob o princípio de **Isolamento CLI e Desacoplamento de Serviços (REGRA 6)**, permitindo execução 100% autônoma tanto em ambientes locais de desenvolvimento quanto em pipelines de CI/CD, sem dependência de banco de dados externo ou servidores web ativos.

### Princípios Fundamentais:
1. **Zero-Facade / Testes Genuínos:** Todo caso de teste avalia o comportamento matemático e semântico real das entidades, validadores, algoritmos de cálculo (ex: dígitos verificadores de CPF) e máquinas de estado.
2. **Determinismo & Isolamento:** Cada teste cria seu próprio estado inicial limpo, não depende da ordem de execução de outros testes e executa teardown automático.
3. **Simetria Constitucional (AGENTS.md):**
   - **REGRA 1 (Strict Contracts):** Simetria de 100% com `openspec/contracts/admin/gestor-onboarding-funnel.json`.
   - **REGRA 6 (Service Decoupling):** Lógica concentrada em classes de serviço puras (`BodyHarmony\Services\*`).
   - **REGRA 7 (Clean Markup Invariant):** Nenhuma quebra de linha escapada (`\n`) gravada no banco ou templates.
   - **REGRA 8 (Licenciadas CPF Invariant):** Utilização estrita do identificador `cpf` (nunca `document`) na tabela `licenciadas`.

---

## 2. Matriz de Cobertura em 4 Camadas (Tiers 1-4)

A suíte E2E (`tests/e2e/onboarding_funnel_e2e_test.php`) implementa uma arquitetura em 4 Tiers com mais de 50 casos de teste automatizados:

```
+-------------------------------------------------------------------------------+
|                       TIER 4: REAL-WORLD SCENARIOS                            |
|        Concurrent Multi-Lead Onboarding | Full Lifecycle State Audit          |
+-------------------------------------------------------------------------------+
|                       TIER 3: CROSS-FEATURE INTEGRATION                       |
|   Token -> Public Submit -> OCR -> Agenda Task -> Contract -> Sign -> Pay    |
+-------------------------------------------------------------------------------+
|                       TIER 2: BOUNDARY & CORNER CASES                         |
|   Expired Tokens | Malformed CPF/RG | XSS/SQLi Payloads | Duplicate Prevention |
+-------------------------------------------------------------------------------+
|                       TIER 1: FEATURE UNIT COVERAGE                           |
|  Token Mgmt | SimpleOcrService | Public Form | Agenda Trigger | Contract 1-Click |
|                   Payment 2-Step | WhatsApp 4-Stage Ruler                     |
+-------------------------------------------------------------------------------+
```

### Tier 1: Cobertura por Funcionalidade (Mínimo 5 testes por feature)
- **Feature 1 — Gestão de Tokens Criptográficos (6 testes):**
  - Geração de token 64-hex aleatório seguro.
  - Expiração padrão (7 dias) e personalizada (horas/dias).
  - Estrutura da URL pública `/onboarding/{token}`.
  - Associação de metadados (nome candidata, WhatsApp, categoria).
  - Validação de status ativo e recuperação de dados.
  - Marcação de token utilizado com timestamp `used_at`.
- **Feature 2 — Extração Heurística Defensiva SimpleOcrService (6 testes):**
  - Reconhecimento de CPF com e sem formatação via Regex.
  - Extração de RG em diferentes formatos estaduais.
  - Reconhecimento de CNPJ para candidatas jurídicas.
  - Extração de CEP para preenchimento de endereço.
  - Cálculo de confiança proporcional à densidade de campos extraídos.
  - Zero-Crash Invariant: tolerância a ruído binário, strings vazias e arquivos corrompidos (retornando `confidence: 0`).
- **Feature 3 — Submissão Pública & Validação Cadastral (6 testes):**
  - Submissão com todos os campos obrigatórios válidos.
  - Validação matemática de CPF (cálculo real de dígitos 1 e 2).
  - Validação sintática de e-mail (RFC compliant).
  - Normalização de número de WhatsApp com DDI/DDD.
  - Armazenamento em diretório seguro `private_uploads/onboarding/`.
  - Inicialização com status `pre_cadastro`.
- **Feature 4 — Integração com Agenda do Gestor (5 testes):**
  - Criação automática de tarefa prioritária em `gestor_agenda_events`.
  - Título padronizado `"Emitir contrato para {nome}"`.
  - Cor de urgência/destaque `#ED7E13` (Luxury Gold).
  - Vínculo relacional com `onboarding_id` e tipo `licenciada`.
  - Tolerância a falhas na agenda sem quebrar a submissão do formulário.
- **Feature 5 — Emissão de Contrato em 1-Clique (5 testes):**
  - Resolução dinâmica de variáveis de contrato (`{{LICENCIADA_NOME_RAZAO}}`, `{{LICENCIADA_CPF}}`, etc.).
  - Conformidade com a REGRA 8 (`cpf` utilizado nas tags de contrato).
  - Geração de UUID único e token de assinatura digital (`sign_token`).
  - Transição de status para `contrato_emitido` / `aguardando_assinatura`.
  - Atualização do evento da agenda para "Aguardando Assinatura".
- **Feature 6 — Validação em 2 Etapas & Ativação (6 testes):**
  - Requisito estrito de contrato assinado (`SIGNED`) antes da liberação.
  - Criação/vínculo atômico na tabela `licenciadas` com coluna `cpf`.
  - Provisionamento de chave e flag `lms_access_granted = true`.
  - Conclusão automática da pendência na agenda (`status = 'concluido'`).
  - Promoção do onboarding para o estágio final `ativo_liberado`.
  - Registro de auditoria com ID do gestor e notas administrativas.
- **Feature 7 — Régua de Mensagens WhatsApp (6 testes):**
  - Template 1 (Convite) com link de pré-cadastro formatado.
  - Template 2 (Assinatura) com link de assinatura digital.
  - Template 3 (Lembrete 24h) para contratos pendentes de assinatura.
  - Template 4 (Boas-Vindas) com link do portal e credenciais LMS.
  - Geração de link profundo `https://wa.me/{phone}?text={encoded}`.
  - Fallback limpo para variáveis não preenchidas (`[Dado Pendente]`).

### Tier 2: Casos de Borda & Cenários Adversariais (11 testes)
- Rejeição de tokens expirados (`HTTP 410 / valid: false`).
- Rejeição de tokens já utilizados (`HTTP 409 / valid: false`).
- Rejeição de tokens inexistentes ou de tamanho inválido.
- Rejeição de CPF com dígitos repetidos (`111.111.111-11`, `222.222.222-22`, etc.).
- Rejeição de CPF com dígitos verificadores matematicamente inválidos.
- Rejeição de e-mails mal formatados (sem `@`, domínios inválidos).
- Defesa contra injeção SQL em campos de texto via Prepared Statements.
- Sanitização de scripts e tags HTML (XSS prevention).
- Tratamento de submissão duplicada do mesmo CPF sem quebra de constraint.
- Rejeição de aprovação financeira prematura (contrato não assinado).
- Tolerância a imagens ilegíveis ou sem dados textuais no OCR.

### Tier 3: Integração Cruzada de Funcionalidades (5 testes)
- **Fluxo Completo Pessoa Física (PF):** Token -> Submissão com OCR -> Criação na Agenda -> Emissão de Contrato -> Assinatura Digital -> Validação de Pagamento -> Ativação & LMS.
- **Fluxo Pessoa Jurídica (PJ):** Token com categoria PJ -> Submissão com CNPJ -> Contrato PJ -> Assinatura -> Ativação.
- **Fluxo de Cancelamento/Desistência:** Token -> Submissão -> Rejeição pelo Gestor -> Fechamento de evento na agenda como `cancelado`.
- **Fluxo de Reemissão Contratual:** Contrato emitido -> Reajuste de plano/valores -> Reemissão com novo sign_token.
- **Fluxo Multi-categoria:** Validação isolada de diferentes categorias de licenciamento (`Licenciamento Ouro`, `Licenciamento Prata`, `Clínica Parceira`).

### Tier 4: Cenários do Mundo Real & Concorrência (5 testes)
- **Onboarding Concorrente:** 10 candidatas simultâneas avançando de forma independente pelo funil.
- **Agrupamento Kanban 5 Colunas:** Validação da estrutura `listFunnel()` agregando corretamente os registros nas 5 colunas operacionais (`pre_cadastro`, `contrato_emitido`, `aguardando_assinatura`, `validar_pagamento`, `ativo_liberado`).
- **Consistência de Transição:** Movimentação entre colunas atualiza contadores e timestamps sem inconsistências de cache.
- **Atomicidade & Rollback:** Simulação de falha no MySQL durante ativação garante rollback total (sem licenciadas órfãs).
- **Trilha de Auditoria Forense:** Verificação de logs cronológicos de status com autor, data e histórico completo.

---

## 3. Estrutura de Arquivos de Teste

| Arquivo | Finalidade | Tipo | Localização |
| :--- | :--- | :--- | :--- |
| `tests/e2e/onboarding_funnel_e2e_test.php` | Suíte de testes E2E abrangente (Tiers 1-4) | E2E / CLI Runner | Repositório Principal |
| `tests/onboarding_funnel_smoke_test.php` | Teste de fumaça rápido para PRs e pre-commit | Smoke Test | Repositório Principal |
| `TEST_INFRA.md` | Especificação da infraestrutura de testes | Documentação | Raiz do Repositório |
| `TEST_READY.md` | Certificado de prontidão e métricas da suíte | Documentação | Raiz do Repositório |

---

## 4. Como Executar os Testes

### Execução da Suíte E2E Completa:
```bash
php tests/e2e/onboarding_funnel_e2e_test.php
```

### Execução do Teste de Fumaça:
```bash
php tests/onboarding_funnel_smoke_test.php
```

### Verificação do Build Frontend:
```bash
cd apps/web-app && npm run build
```

---

## 5. Critérios de Aceitação da Infraestrutura de Testes
- **100% de Sucesso:** Todos os testes devem passar com código de saída 0 (`exit code 0`).
- **Tempo de Execução:** Execução completa da suíte E2E em menos de 5 segundos.
- **Zero Falsos Positivos:** Todos os testes de rejeição e casos de borda devem testar a condição de erro real esperada.
