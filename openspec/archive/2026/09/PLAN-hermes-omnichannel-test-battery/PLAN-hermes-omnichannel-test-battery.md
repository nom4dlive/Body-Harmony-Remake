# 🚀 PLAN: Bateria de Testes Omnichannel & Controle Total do Hermes (V4.7)

**Identificador:** `PLAN-hermes-omnichannel-test-battery`  
**Data:** 2026-09-01  
**Status:** COMPLETED (Archived)  
**Autor:** Antigravity Architect  

---

## 🎯 Objetivo
Executar uma bateria de testes exaustiva para comprovar que o Hermes Agent possui acesso e controle total do ecossistema CRM, efetuando disparos de mensagens de texto, áudios (PTT), mídias (imagens e documentos), fluxo de agendamento Google Calendar com Google Meet, geração de cobrança Pix, resposta dos Protocolos Clínicos 3S e ciclo Anti No-Show direcionados para o número do gestor `+5518996959486`.

---

## 📋 Lista de Tarefas (Tracker)

### 1. Camada de Integração de Mensageria
- [x] Atualizar `EvolutionApiService.php` com schema nativo da Evolution API v2.
- [x] Criar runner da bateria de testes `apps/web-app/src/backend/bin/hermes_live_battery_test.php`.
- [x] Criar endpoint HTTP `apps/web-app/src/backend/api/v1/crm/hermes_battery.php`.

### 2. Execução da Bateria para +5518996959486
- [x] Teste 1: Linha Clínica — Acolhimento + Agendamento Google Calendar + Google Meet + Áudio PTT (HTTP 201).
- [x] Teste 2: Linha Comercial — Proposta Congresso + Chave Pix Copia e Cola (HTTP 201).
- [x] Teste 3: Linha Suporte — RAG Protocolos 3S Dra. Joselene Silva + Documento PDF (HTTP 201).
- [x] Teste 4: Linha Jurídico — Validação de Política 100% Humano (Muted) (HTTP 201).
- [x] Teste 5: Anti No-Show — Lembrete e confirmação autônoma NLP (HTTP 201).
- [x] Teste 6: AI Audit Trail — Registro e consulta na Trilha Forense.

### 3. Validação & Build
- [x] Executar script CLI `php apps/web-app/src/backend/bin/hermes_live_battery_test.php --target="5518996959486"`.
- [x] Executar `nexus_gate.ps1` e validar Exit Code 0 (NEXUS GATE PASS).
- [x] Registrar entrega no Obsidian Vault via `agent_vault_logger.py`.
