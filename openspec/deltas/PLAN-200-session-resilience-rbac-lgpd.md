# 📋 DELTA PLAN-200: Blindagem de Sessão, RBAC por Linha & Mascaramento LGPD no CRM

- **Data**: 2026-09-02
- **Autor**: @antigravity & @hermes
- **Status**: EM PLANEJAMENTO
- **Alvo**: `inbox_conversations.php`, `inbox_messages.php`, `OmnichannelInbox.jsx`

## 🎯 Objetivo
Proteger dados sensíveis via mascaramento LGPD, isolar o acesso operacional por linhas de atendimento com RBAC e garantir zero perda de mensagens digitadas com auto-save em LocalStorage.

## 🛡️ Espaço Negativo
- Preservar integridade dos contratos de IA e webhooks.

## ⚡ Micro-Steps de Dopamina (3-5 min)
- [ ] 1. RBAC Backend nas Listagens e Mensagens (`inbox_conversations.php`, `inbox_messages.php`).
- [ ] 2. Restrição Visual de Linhas no Frontend (`OmnichannelInbox.jsx`).
- [ ] 3. Mascaramento LGPD de Documentos Sensíveis no Dossiê 360º e Lista.
- [ ] 4. Draft Auto-Save no Chat Input com `localStorage`.
- [ ] 5. Build de release, deploy no Hostinger e validação em produção.
