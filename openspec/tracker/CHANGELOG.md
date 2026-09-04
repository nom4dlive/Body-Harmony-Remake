# 📜 CHANGELOG — Ecossistema Body Harmony (Nexus V3.1)

## [PLAN-hermes-complex-reasoning-and-transfer] 2026-09-01 — Raciocínio Profundo, Resolução de Problemas & Transbordo (V4.8)
- **Inteligência Artificial & Chain-of-Thought**:
  - Implementação do método `runDeepReasoningTurn` em `HermesCrmAgentService.php` com análise de contraindicações clínicas, quebra de objeções comerciais e condutas de emergência para licenciadas.
  - Execução autônoma de ferramentas (`google_calendar_schedule`, `crm_generate_pix`, `crm_transfer_agent`).
  - Runner CLI `hermes_reasoning_scenarios_test.php` com 3 cenários complexos validados com **HTTP 201** para o WhatsApp `+5518996959486`.
- **Governança & Hard-Gate**: `nexus_gate.ps1` com 100% de integridade e registro no Vault.

## [PLAN-hermes-omnichannel-test-battery] 2026-09-01 — Bateria de Testes Omnichannel & Controle Total do Hermes (V4.7)
- **Mensageria & Evolution API v2**:
  - Atualização do `EvolutionApiService.php` com o schema raiz plano nativo da Evolution API v2 (`sendTextMessage`, `sendWhatsAppAudio`, `sendMedia`).
  - Runner CLI `apps/web-app/src/backend/bin/hermes_live_battery_test.php` e endpoint HTTP `hermes_battery.php`.
  - Disparos reais de texto, áudio PTT, proposta Pix, RAG dos Protocolos 3S, documento PDF, lembrete Anti No-Show e validação da governança jurídica (MUTED) validados com **HTTP 201** para `+5518996959486`.
- **Governança & Hard-Gate**: `nexus_gate.ps1` com 100% de integridade e registro no Vault.

## [PLAN-crm-frontend-audit-and-hermes-real-ai] 2026-08-31 — Auditoria de Frontend do CRM, Fix de Logs & IA Real (V4.6)
- **Frontend & UI Luxury**:
  - Fix de proporção 1:1 circular inviolável nos avatares (`flex-shrink: 0`, `aspect-ratio: 1/1`).
  - Parser inteligente de mídias para renderizar imagens clicáveis e áudios nativos no corpo do chat.
  - Limpeza reativa instantânea de não lidas ao abrir conversas (`c.unread = 0`).
  - Filtro de mensagens de sistema (`Atribuído a...`) e badge visual de Atendente Responsável.
- **Backend & Copilot**:
  - Correção de erro 400 em `inbox_messages.php` e suporte a `mark_read`.
  - Motor contextual no `generateCopilotDraft` com histórico multi-turnos, dossiê e integração neural Qwen.
- **Backend**:
  - Migration `V191` com tabelas `crm_hermes_audit_trail`, `crm_patient_longterm_memory` e `crm_clinical_knowledge_base`.
  - Serviço `HermesAdvancedIntelligenceService.php` e endpoint `hermes_audit.php` com suporte a transcrição Whisper, análise de sentimento, RAG de protocolos 3S e feed de auditoria forense.
- **Frontend**:
  - Componente `HermesAuditTrailView.jsx` com 4 top metrics, feed ao vivo de ações da IA e explorador RAG.
  - Sub-abas no `HermesAgentCockpit.jsx` e suporte a badge de sentimento e botão de transcrição no `OmnichannelInbox.jsx`.

## [PLAN-crm-background-workers] 2026-08-31 — Background Workers & Motor Anti No-Show 24h/2h (V4.4)
- **Backend**:
  - Migration `V190` com `crm_worker_logs` e índices otimizados.
  - Serviço `CrmBackgroundWorkerService.php` com varredura anti no-show (24h/2h antes), reconhecimento NLP de confirmação/remarcação e conciliação em lote da Google Agenda e People API.
  - Runner duplo: CLI daemon `bin/crm_worker.php` para crontab na VPS e endpoint HTTP `worker_runner.php`.
- **Frontend**:
  - Componente `BackgroundWorkersCard.jsx` montado no topo do `GoogleWorkspaceHub.jsx` com métricas em tempo real e disparador manual.

## [PLAN-188] 2026-08-31 — Central Blindada de Cupons & Template de Passaporte Virtual
- **Backend**:
  - Atualização do schema da tabela `congress_coupons` com colunas `restricted_cpf`, `restricted_email`, `expires_at`, `description`, `allowed_tier_id`.
  - Blindagem de `validateCoupon()` com verificação de `is_active`, `expires_at`, `max_uses`, `restricted_cpf` e trava contra reuso pelo mesmo CPF.
  - Implementação das rotas e métodos administrativos `listAdminCoupons`, `saveAdminCoupon`, `deleteAdminCoupon`, `getCouponUsages`.
- **Frontend**:
  - Criação do componente `CongressCouponsManager.jsx` com suporte a cupons de uso único, trava nominal por CPF e log de participantes.
  - Integração no `CongressCockpitPanel.jsx` da central de cupons e editor de textos/horários do passaporte virtual.
  - Remoção definitiva de placeholders sensíveis com exemplos de cupons no checkout público.
- **Deploy**: Sincronizado e validado 100% em produção na Hostinger.

## [PLAN-187] 2026-08-31 — Cockpit Unificado do Congresso no Portal do Gestor & Asaas Direct
- Implementação de gestão unificada de lotes, preços e limite de 40 vagas VIP.
- Seletor de modo de checkout (Modal Transparente Nativo vs Link Oficial Asaas Direct).
- Geração automática de links de pagamento Asaas via API.

## [PLAN-186] 2026-08-31 — Integração Completa Gateway Asaas Produção
- Configuração das chaves de produção da Asaas e secret do Webhook.
- Implementação de `AsaasGatewayService.php` e `AsaasWebhookController.php`.
- Sincronização em tempo real de pagamentos de Ingressos do Congresso e Loja.
