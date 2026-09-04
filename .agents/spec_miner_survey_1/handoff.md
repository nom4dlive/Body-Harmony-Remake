# 5-Component Handoff Report — PLAN-064 Specification Mining

**Agent:** `spec_miner_survey_1` (Specification & Requirements Miner)  
**Target:** `parent` (`cfbb8f91-87f5-4919-900c-bc45c32f58fd`)  
**Task:** Mineração Completa de Especificações & Requisitos para o PLAN-064 (Funil de Onboarding de Licenciadas)  
**Date:** 2026-08-20  
**Type:** Hard Handoff (Task Complete)

---

## 1. Observation

Durante a investigação exaustiva do repositório e da documentação do ecossistema Body Harmony, foram observados os seguintes fatos concretos:

1. **Constituição & Invariantes (`AGENTS.md`):**
   - Regra 1: Contratos de API obrigatórios em `openspec/contracts/`.
   - Regra 2: Espaço negativo e loopback isolado da VPS (`127.0.0.1:3306`).
   - Regra 3: Identidade estética Luxury (`#0A3E60`, `#ED7E13`, alvos $\ge 44\times 44\text{px}$).
   - Regra 6: Desacoplamento de serviços e isolamento de testes CLI sem invocar controllers globais com headers HTTP/auth_check.
   - Regra 8: Licenciadas CPF Invariant — proibido o uso da coluna `document` na tabela `licenciadas`; o campo oficial é `cpf` (verificado no `DATABASE_MASTER_V36_1.sql:90`).

2. **Planejamento Existente & Contratos (`openspec/`):**
   - `openspec/deltas/PLAN-064-funil-onboarding-licenciadas.md` (61 linhas) detalha o pipeline de 6 etapas: Link com OCR, Tarefa na Agenda, Emissão 1-Clique, Régua WhatsApp, Validação em 2 Etapas e Visão Dupla React.
   - `openspec/contracts/admin/gestor-onboarding-funnel.json` (85 linhas) define os endpoints: `POST /admin/onboarding/links`, `POST /public/onboarding/submit`, `GET /admin/onboarding/funnel`, `POST /admin/onboarding/{id}/generate-contract`, `POST /admin/onboarding/{id}/confirm-payment`.
   - `openspec/deltas/BRAINSTORM-mensagens-whatsapp-gestor-051.md` (96 linhas) e `ensure_tables.php:1144-1250` definem a biblioteca de templates humanizados de WhatsApp.

3. **Camada de Serviços Backend & Contratos:**
   - `AgendaTriggerService.php:21-37` possui o método `onLicenseeRegistered(int $licenciadaId, string $name, string $cpf)` que cria tarefas do tipo `pendencia` na cor `#ED7E13`.
   - `AgendaService.php:1-491` provê gerenciamento completo de eventos, pendências, subtarefas e logs de auditoria.
   - `ContractPdfService.php:1-465` compila PDFs oficiais de contratos com mPDF e gera trilha forense SHA-256.
   - `MagicTokenService.php:1-71` estabelece o padrão de tokens de uso único com `bin2hex(random_bytes(32))` e expiração.

4. **Frontend & Roteamento (`apps/web-app/src/frontend/`):**
   - `routes.js:1-28` e `App.jsx:1-267` centralizam as rotas administrativas e públicas (`/portal-gestor/contratos`, `/portal-gestor/agenda`, `/assinar/:signToken`, `/validar/:uuid`).
   - `Dashboard.jsx:446-478` organiza os cards de gestão em *Equipe & Licenciadas*.

---

## 2. Logic Chain

A dedução dos requisitos e do plano arquitetural seguiu as seguintes etapas lógicas:

1. **Premissa de Entrada:** O `ORIGINAL_REQUEST.md` exige a implementação completa de um Funil de Onboarding de Licenciadas integrado à Agenda do Gestor, Contratos e WhatsApp com validação em 2 etapas.
2. **Integração de Dados:** Para suportar os 5 estágios do funil (`pre_cadastro`, `contrato_emitido`, `aguardando_assinatura`, `validar_pagamento`, `ativo_liberado`) sem alterar tabelas legadas diretamente, é necessária a criação das tabelas `licenciada_onboarding_tokens` e `licenciada_onboarding_requests` na migration `V107_Create_Licenciada_Onboarding_Funnel_Table.sql`.
3. **Resiliência do OCR:** Para garantir operação contínua sem quebras na VPS Hostinger (que pode não ter binários externos pesados instalados), o `SimpleOcrService.php` deve adotar abordagem defensiva em PHP 8.4 nativo baseada em extração por regex de padrões de CPF, RG, CEP e CNPJ, com fallback gracioso para preenchimento manual (`confidence: 0`) sem falhas HTTP 500.
4. **Isolamento de Testes CLI:** Em conformidade com a REGRA 6, o script de fumaça `tests/onboarding_funnel_smoke_test.php` deve implementar mock puro de PDO (`MockPDOStatement`), permitindo validar todas as 7 etapas do ciclo de onboarding de forma independente da conexão de rede ou do banco de dados ao vivo.
5. **Garantia de Não-Regressão:** O fluxo respeita integralmente os watchpoints críticos (**WP-01**, **WP-02**, **WP-05**, **WP-16**, **WP-17**) e estabelece a base para o novo **WP-18** (*Onboarding & Funil de Licenciadas*).

---

## 3. Caveats

- **Ambiente de Produção vs Mock CLI:** O teste de fumaça CLI usa MockPDO para validação isolada, mas a migration `V107` deve ser aplicada via PDO no boot da aplicação ou script de deploy para persistência real no MySQL.
- **Armazenamento de Fotos de Documentos:** Os arquivos de upload de documentos contêm dados sensíveis (LGPD) e devem residir estritamente em `private_uploads/onboarding/`, nunca em diretórios públicos do web server.

---

## 4. Conclusion

A mineração de especificações para o **PLAN-064** está 100% concluída. Todas as regras de negócio, tabelas SQL, métodos de backend, contratos JSON de API, templates de WhatsApp, requisitos de UI React e roteamento foram exaustivamente catalogados e formalizados no arquivo:
`f:\Body-Harmony-Remake\.agents\spec_miner_survey_1\analysis.md`.

O escopo está delimitado, as restrições e invariantes constitucionais estão respeitadas, e a equipe está pronta para prosseguir com a elaboração da arquitetura e implementação.

---

## 5. Verification Method

Para verificar de forma independente as informações documentadas neste relatório:

1. **Inspecionar o relatório de mineração:**
   ```powershell
   # Visualizar o arquivo analysis.md gerado
   cat f:\Body-Harmony-Remake\.agents\spec_miner_survey_1\analysis.md
   ```
2. **Inspecionar contratos e planos de referência:**
   - `f:\Body-Harmony-Remake\openspec\contracts\admin\gestor-onboarding-funnel.json`
   - `f:\Body-Harmony-Remake\openspec\deltas\PLAN-064-funil-onboarding-licenciadas.md`
   - `f:\Body-Harmony-Remake\AGENTS.md`
3. **Condições de Invalidação:**
   - Caso qualquer rota backend utilize `document` em vez de `cpf` na tabela `licenciadas` (violação da REGRA 8).
   - Caso qualquer chamada de banco de dados não utilize Prepared Statements com PDO parametrizado.
   - Caso o teste de fumaça CLI dependa de conexão externa ou execute `auth_check.php` no escopo global.
