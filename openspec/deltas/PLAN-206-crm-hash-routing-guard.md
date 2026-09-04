# PLAN-206: Blindagem Definitiva do Roteamento por Hash no CRM Workspace

## 🎯 [OBJETIVO]
Eliminar o redirecionamento indevido para `#inbox` ao clicar em qualquer sub-aba de configuração do CRM (`#settings-google`, `#settings-hermes`, etc.), unificando a resolução de hashes em um módulo SSOT (`crmRoutingGuard.js`) e implementando testes de matriz de hash.

---

## 🛡️ [ESPAÇO NEGATIVO]
- Não alterar lógica de atendimento, kanban ou conexões sociais.
- Não alterar banco de dados ou endpoints backend.
- Não alterar estilização ou componentes visuais já validados.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Step 1**: Criar módulo SSOT `crmRoutingGuard.js`.
- [ ] **Step 2**: Atualizar `CRMWorkspaceV4.jsx` e `UnifiedSettingsHub.jsx` com o guardião unificado.
- [ ] **Step 3**: Criar e executar suíte de testes de matriz de rota hash (`tests/crm_routing_hash_guard_test.php`).
- [ ] **Step 4**: Validação e verificação via `nexus_gate.ps1` com Exit Code 0.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/crmRoutingGuard.js`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/CRMWorkspaceV4.jsx`
- `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/UnifiedSettingsHub.jsx`
- `tests/crm_routing_hash_guard_test.php`
