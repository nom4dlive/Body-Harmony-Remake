# 🧠 BRAINSTORM: Background Workers, Anti No-Show Engine & Conciliação em Lote (V4.4)

**Identificador:** `BRAINSTORM-crm-background-workers-004`  
**Data:** 2026-08-31  
**Status:** Consolidado via `/grill-me`  
**Autor:** Antigravity Architect  

---

## 🎯 Contexto e Decisões Alinhadas

1. **Objetivo Central:**
   Construir o motor de automação assíncrona do ecossistema Body Harmony CRM para prevenção ativa de faltas de pacientes (Anti No-Show), conciliação periódica de agendamentos do Google Calendar e sincronização em lote da People API.

2. **Decisões Alinhadas via `/grill-me`:**
   - **Runner Duplo Híbrido:**
     - Script PHP CLI (`bin/crm_worker.php`) pronto para crontab na VPS a cada 5 minutos.
     - Endpoint HTTP seguro (`/api/v1/crm/worker_runner.php`) protegido por Bearer Token e ação manual no painel do Gestor (`GoogleWorkspaceHub.jsx` / `HermesAgentCockpit.jsx`).
   - **Fluxo Anti No-Show Inteligente (24h e 2h antes):**
     - Leitura de eventos em `gestor_agenda_events` com data prevista.
     - Envio de lembrete humanizado via WhatsApp (Evolution API / Linha 01 Clínica).
     - Reconhecimento de resposta do paciente:
       - Se *"Sim / Confirmo / Estarei aí"*: Atualiza status para `CONFIRMED` no MySQL e Google Calendar.
       - Se *"Não / Quero reagendar / Imprevisto"*: Atualiza status para `RESCHEDULE_REQUESTED`, notifica a clínica e sugere novos horários disponíveis.
   - **Conciliação em Lote do Google Workspace:**
     - Sincronização automática de eventos modificados diretamente no Google Calendar sem intervenção humana.
     - Atualização de contatos pendentes em `crm_google_contacts_sync`.

---

## 🔬 Análise Transversal em Seis Camadas

### 1. Camada de Dados
- **Tabela `crm_auto_reminders`:** Registro de cada lembrete gerado, horário de disparo, tipo (`24H` ou `2H`), telefone, payload da mensagem e status (`PENDING`, `SENT`, `CONFIRMED`, `CANCELLED`).
- **Tabela `crm_worker_logs`:** Log histórico de execuções do worker (tempo de execução, total de lembretes disparados, eventos sincronizados, erros).

### 2. Camada de Backend (PHP 8.4)
- **`CrmBackgroundWorkerService.php`:**
  - `processUpcomingReminders()`: Varre a agenda para as próximas 24h e 2h e despacha mensagens via WhatsApp.
  - `processIncomingReminderReply(string $phone, string $msg)`: Interpreta a resposta de confirmação/reagendamento.
  - `syncBatchGoogleCalendar()`: Concilia eventos do Google Calendar.
  - `syncBatchGoogleContacts()`: Atualiza contatos pendentes.
- **`worker_runner.php`:** Endpoint que recebe `POST ?action=run_all` ou `POST ?action=reminders`.
- **`bin/crm_worker.php`:** Script CLI executável via terminal/cron.

### 3. Camada de Interface (Frontend React 18)
- Adição de card/botão **"Executar Automações em Lote"** e histórico de execuções na aba do Hermes / Google Workspace Hub.

---

## 🏆 Opção Recomendada
Implementar o pipeline com `CrmBackgroundWorkerService.php`, `worker_runner.php` e `bin/crm_worker.php`, garantindo autonomia 24/7 na VPS e controle sob demanda na interface web.
