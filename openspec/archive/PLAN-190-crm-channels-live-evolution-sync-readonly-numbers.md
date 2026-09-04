# 🎯 Objetivo Fullstack
1. Garantir que os números de telefone exibidos nos cards da Central de Conexões (`ChannelsManager.jsx`) sejam **100% reais e dinâmicos**, extraídos diretamente da Evolution API v2 (via `ownerJid` / `number` retornado após a leitura do QR Code), eliminando a edição manual de números pelo operador e mantendo sincronização viva de status e bateria.
2. Integrar a **atribuição de atendentes** de forma unificada com a base de usuários do sistema (`https://bodyharmony.com.br/portal-gestor/usuarios` / `admin_users`), consumindo dinamicamente a lista de usuários cadastrados no Gestor para seleção e roteamento de linhas.

---

# 📜 Contratos de API (REGRA 1)
- [x] `openspec/contracts/crm/channels-crud.json` (Atualizado para refletir `phone_number` como campo derivado de telemetria da Evolution API, tornando a edição manual restrita apenas a Nome, Departamento e Atendente).
- [ ] `openspec/contracts/crm/team-access-provisioning.json` (Atualizado para refletir o espelhamento biunívoco com `admin_users`).

---

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Não alterar a tabela `admin_users` nem invalidar senhas ou roles de usuários existentes.
- [x] Manter o gateway Traefik e portas internas da VPS isoladas (REGRA 2).

---

# 🗄️ Camada de Dados (SQL)
- [ ] `crm_channels`: A coluna `phone_number` passa a ser atualizada automaticamente via telemetria da Evolution API quando o status for `CONNECTED` ou `open`. Caso a linha não esteja conectada, o valor exibido será `'Aguardando Leitura do QR'` ou `'Desconectado'`.
- [ ] `crm_attendants`: Sincronização e junção com a tabela mestre `admin_users` (`username`, `email`, `role_name`), garantindo que novos usuários criados no Portal Gestor fiquem imediatamente disponíveis para atendimento no CRM.

---

# ⚙️ Camada de Backend (PHP 8.4)
- [ ] **`api/v1/crm/channels.php`**:
  - No `GET`: Consultar `EvolutionApiService->fetchInstances()`.
  - Para cada canal mapeado, cruzar com a instância real na Evolution API:
    - Se a instância estiver conectada (`open`/`connected`), extrair o número real do `ownerJid` ou `number` (ex: `5518996959486`), formatar no padrão visual (`+55 (18) 99695-9486`) e atualizar no banco.
    - Se a instância estiver desconectada ou sem aparelho pareado, exibir `'Aguardando Leitura do QR Code'` e status `DISCONNECTED`.
  - No `POST`: Bloquear a sobrescrita manual de número; salvar apenas `name`, `department`, `attendant_username` e gerar/vincular a `instance_key`.
- [ ] **`api/v1/crm/team.php`**:
  - Unificar a consulta com `admin_users` (`SELECT u.id, u.username, u.email, r.name as role_name ... FROM admin_users u ...`), garantindo que todos os operadores cadastrados no Gestor sejam listados como atendentes elegíveis.

---

# ⚛️ Camada de Interface (React V3.1)
- [ ] **`ChannelsManager.jsx`**:
  - Consumir a lista de usuários de `api.rbac.getUsers()` para popular dinamicamente o `<select>` de "Atendente Responsável" no modal de criação e edição.
  - Remover o `<input>` de digitação de telefone, substituindo por aviso: *"O número de telefone é detectado e preenchido automaticamente assim que o QR Code for lido no WhatsApp."*
  - Nos cards de instâncias:
    - Se `phoneNumber` estiver vazio ou desconectado, exibir badge sutil: `⏳ Aguardando pareamento`.
    - Se conectado, exibir o número real capturado do WhatsApp.
- [ ] **`TeamManager.jsx`**:
  - Carregar dinamicamente a equipe vinda do `portal-gestor/usuarios` com seus respectivos cargos e linhas atribuídas.

---

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Web Hosting (45.152.44.244):** Build SPA React e novos endpoints PHP via `deploy-hostinger.ps1`.
- **VPS Hostinger Dedicada (2.25.156.25):** Telemetria em tempo real das instâncias da Evolution API v2.

---

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] `apps/web-app/src/backend/api/v1/crm/channels.php`
- [ ] `apps/web-app/src/backend/api/v1/crm/team.php`
- [ ] `apps/web-app/src/backend/api/v1/admin/rbac/users.php`
- [ ] `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/ChannelsManager.jsx`
- [ ] `apps/web-app/src/frontend/src/pages/Admin/CRM/v4/TeamManager.jsx`

---

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Falha temporária de comunicação entre PHP e Evolution API pode retornar instâncias como desconectadas.
- **Mitigação:** Tratamento defensivo com timeout de 3s e preservação do último número conhecido registrado no MySQL.
- **Rollback:** `git checkout HEAD~1` em `channels.php`, `team.php` e `ChannelsManager.jsx`.

---

# ✅ Checklist de Execução Atômica
- [ ] 1. Atualizar `channels.php` para cruzar dados locais com telemetria viva da `EvolutionApiService->fetchInstances()`.
- [ ] 2. Atualizar `team.php` para cruzar e sincronizar os atendentes com `admin_users`.
- [ ] 3. Ajustar `ChannelsManager.jsx` para carregar atendentes dinamicamente de `api.rbac.getUsers()` e tornar o número somente-leitura.
- [ ] 4. Atualizar `TeamManager.jsx` com a listagem dinâmica de usuários do sistema.
- [ ] 5. Rodar testes de fumaça CLI (`tests/crm_channels_live_sync_smoke_test.php`).
- [ ] 6. Compilar release (`npm run build:release`) e sincronizar em produção (`deploy-hostinger.ps1`).
- [ ] 7. Registrar no cofre do Obsidian.
