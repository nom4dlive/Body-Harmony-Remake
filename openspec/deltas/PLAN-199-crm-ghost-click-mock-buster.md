# 📋 DELTA PLAN-199: Ghost Click Hunter & Mock Buster no CRM Frontend

- **Data**: 2026-09-02
- **Autor**: @antigravity & @hermes
- **Status**: EM PLANEJAMENTO
- **Alvo**: Frontend CRM (`apps/web-app/src/frontend/src/pages/Admin/CRM/`) e `api.js`

## 🎯 Objetivo
Eliminar cliques mortos, falsas promessas de UI e lacunas de conexão entre o frontend React do CRM e o backend PHP, garantindo que 100% dos botões e recursos sejam funcionais.

## 🛡️ Espaço Negativo
- Preservar áreas não-CRM da aplicação.

## ⚡ Micro-Steps de Dopamina (3-5 min)
- [ ] 1. Scanner automatizado de cliques mortos, handlers vazios e dados mockados.
- [ ] 2. Matriz de simetria de contratos (`crmApi` vs `/api/v1/crm/*.php`).
- [ ] 3. Conexão e ativação dos botões órfãos e remoção de mocks residuais.
- [ ] 4. Build de release, deploy no Hostinger e validação em produção.
