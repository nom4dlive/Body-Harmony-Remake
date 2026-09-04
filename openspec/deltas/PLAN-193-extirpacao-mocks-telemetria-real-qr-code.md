# PLAN-193: Extirpação de Mocks Forenses, Telemetria Real de Linhas e Geração Confiável de QR Code

## [OBJETIVO]
Eliminar 100% dos mock data na Trilha Forense, calcular KPIs reais baseados em histórico vivo do banco de dados, corrigir a geração de QR Code da Evolution API v2 para todas as linhas e exibir telemetria real (bateria/sinal só quando conectado, 'Desconectado' quando offline).

## [ESPAÇO NEGATIVO]
- NÃO alterar as credenciais de autenticação nem o roteamento de proxy neural já validado.
- NÃO apagar históricos de conversas existentes nas caixas de entrada do Chatwoot.

## [MICRO-STEPS DE DOPAMINA]
1. [ ] **Backend Telemetria & Evolution API**:
   - Atualizar `EvolutionApiService.php` com `integration: WHATSAPP-BAILEYS`, timeout de 15s e método seguro `getOrGenerateQrCode()`.
   - Atualizar `channels.php` para sincronizar status, criar instâncias faltantes automaticamente, vincular ao Chatwoot e retornar bateria/sinal reais (ou `null` quando desconectado).
2. [ ] **Backend Trilha Forense Real (`crm_hermes_audit_trail`)**:
   - Atualizar `HermesAdvancedIntelligenceService.php` para calcular KPIs dinamicamente (total de execuções reais, tempo médio de resposta `execution_time_ms`, assertividade baseada em sentimento real).
   - Fazer `HermesCrmAgentService.php` e `hermes_agent_webhook.php` registrarem cada chamada (`test_prompt`, `copilot_draft`, `internal_assistant_chat`, `summarize_dossier`) na tabela `crm_hermes_audit_trail`.
3. [ ] **Frontend - Central de Conexões & Modal QR Code**:
   - Corrigir `ChannelsManager.jsx` e `OmnichannelInbox.jsx` para exibir estado de carregamento real, código de pareamento numérico (se disponível), botão de recarregar QR e mensagens de erro transparentes.
   - Corrigir a exibição de Sinal/Bateria: quando `status !== 'CONNECTED'`, exibir `-- (Desconectado)` ou `⚠️ Sem Sinal`.
4. [ ] **Build & Deploy Release**:
   - Compilar frontend com `npm run build:release` e sincronizar com a Hostinger via WinSCP/FTP.
5. [ ] **Validação com Testes Automatizados**:
   - Validar endpoint de QR Code, persistência de auditoria e cálculo dinâmico de KPIs em produção.
