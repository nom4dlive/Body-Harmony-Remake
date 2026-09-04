# 📋 DELTA PLAN-201: Silo Dedicado Instagram no CRM via Zernio API

- **Data**: 2026-09-02
- **Autor**: @antigravity & @hermes
- **Status**: EM PLANEJAMENTO
- **Alvo**: `ZernioApiService.php`, `instagram_inbox.php`, `OmnichannelInbox.jsx`, `api.js`

## 🎯 Objetivo
Habilitar a gestão fullstack de DMs, comentários e menções do `@bodyharmonyoficial` via Zernio API com suporte ao Hermes Copilot no CRM.

## 🛡️ Espaço Negativo
- Preservar integridade do WhatsApp e canais já homologados.

## ⚡ Micro-Steps de Dopamina (3-5 min)
- [ ] 1. Criar service backend `ZernioApiService.php`.
- [ ] 2. Criar endpoint `api/v1/crm/instagram_inbox.php` e prompt Hermes Instagram.
- [ ] 3. Integrar `instagramApi` no `api.js` e interface do Silo Instagram no `OmnichannelInbox.jsx`.
- [ ] 4. Build de release, deploy no Hostinger e validação em produção.
