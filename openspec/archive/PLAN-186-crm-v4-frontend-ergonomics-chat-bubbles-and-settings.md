# 🎯 Objetivo Fullstack (PLAN-186)
Reformulação completa da ergonomia do frontend do CRM V4, eliminando poluição visual e menus verticais desordenados, corrigindo balões de mensagens com alinhamento e cores diferenciadas (WhatsApp/Customizável), implementando fotos de perfil reais com fallback, gaveta retrátil para o Dossiê 360° com dados reais, limpeza de seeds fictícias de números e criação do painel de configurações de aparência para administradores.

---

# 📜 Contratos de API (REGRA 1)
- [x] Contrato JSON criado em [`openspec/contracts/crm/settings-ergonomics.json`](file:///f:/Body-Harmony-Remake/openspec/contracts/crm/settings-ergonomics.json)
- [x] Endpoint `api/v1/crm/settings.php` para persistência de preferências de UI dos administradores.

---

# 🚫 Espaço Negativo (Fora de Escopo)
- [ ] Alteração de credenciais e portas de conexão na VPS Hostinger Dedicada (Imutável)
- [ ] Alteração no core da Evolution API

---

# 🗄️ Camada de Dados (SQL)
- [ ] Migration `V186__crm_settings_and_clean_seeds.sql`:
  - Criação da tabela `crm_settings` (`setting_key`, `setting_value`, `updated_at`).
  - Limpeza de números fictícios de seed (como `+55 18 99711-4455`) na tabela `crm_channels`, mantendo apenas o número institucional oficial `+55 (18) 99695-9486` e deixando as demais linhas aguardando configuração direta do gestor.

---

# ⚙️ Camada de Backend (PHP 8.4)
- [ ] `apps/web-app/src/backend/api/v1/crm/settings.php`:
  - `GET`: Retorna configurações de cores de balão, notificações e visual.
  - `POST`: Atualiza preferências visuais.
- [ ] `apps/web-app/src/backend/api/v1/crm/inbox_conversations.php`:
  - Inclusão do campo `avatar_url` extraído do Chatwoot / Evolution API.
- [ ] `apps/web-app/src/backend/api/v1/crm/inbox_messages.php`:
  - Garantir distinção estrita de `sender_type` (`ME` / `USER` / `AGENT` / `WHISPER`).

---

# ⚛️ Camada de Interface (React V3.1)
- [ ] `OmnichannelInbox.jsx`:
  - **Barra Lateral de Linhas/Silos:** Menu de ícones compacto com tooltip e badges de contagem, eliminando os botões empilhados e cortados abaixo da busca.
  - **Árvore de Conversas:** Abas horizontais limpas: `Todas`, `Não Lidas`, `Em Atendimento` e `Grupos`.
  - **Balões de Mensagens:**
    - **Enviadas:** Alinhadas à DIREITA, fundo verde suave WhatsApp (`#DCF8C6`) ou customizado, texto escuro e horário à direita.
    - **Recebidas:** Alinhadas à ESQUERDA, fundo branco (`#FFFFFF`), borda suave `#E2E8F0` e sombra sutil.
    - **Notas Internas (Whispers):** Fundo amarelo/âmbar (`#FEF3C7`) centralizado com ícone de cadeado.
  - **Fotos de Perfil dos Contatos:** Renderização da imagem real se `c.avatar_url` existir; se não, iniciais com avatar colorido gradiente.
  - **Dossiê 360° Retrátil:** Fechado por padrão (`dossierOpen = false`), abre com transição suave (Slide-over) de 320px ao clicar no botão "Dossiê" ou no avatar do contato.
  - **Dados 100% Reais:** Estados vazios limpos e elegantes (sem strings de mentira como "1x Ingresso Congresso VIP" para quem não comprou).
- [ ] `CRMWorkspaceV4.jsx`:
  - Adição da aba **⚙️ Configurações & Aparência** para administradores customizarem cores de balão e comportamento.
  - Compactação da barra de navegação superior e banners informativos para maximizar a área de trabalho.

---

# 🧪 Metodologia TDD & Verificação
- [ ] Teste unitário Vitest para sanitização de avatares e cálculo de alinhamento de balões.
- [ ] Teste de fumaça PHP para `api/v1/crm/settings.php`.

---

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Site/Frontend):** `CRMWorkspaceV4.jsx`, `OmnichannelInbox.jsx`, `settings.php` e `api.js` via `deploy-hostinger.ps1`.
- **VPS Hostinger Dedicada (API/DB):** Execução da migration `V186`.

---

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Incompatibilidade com cores salvas no LocalStorage.
- **Mitigação:** Fallbacks padrão seguros para o tema WhatsApp nativo.
- **Rollback:** `git checkout HEAD~1`.

---

# ✅ Checklist de Execução Atômica
- [ ] 1. Criar migration SQL `V186__crm_settings_and_clean_seeds.sql`
- [ ] 2. Implementar endpoint PHP `api/v1/crm/settings.php`
- [ ] 3. Atualizar `inbox_conversations.php` para retornar `avatar_url`
- [ ] 4. Atualizar `api.js` com `crmApi.getSettings()` e `saveSettings()`
- [ ] 5. Refatorar `OmnichannelInbox.jsx` (balões alinhados/coloridos, menu lateral compacto, abas de organização, fotos reais e dossiê retrátil)
- [ ] 6. Adicionar aba de Configurações no `CRMWorkspaceV4.jsx`
- [ ] 7. Executar testes automatizados Vitest / PHP
- [ ] 8. Executar build e deploy na Hostinger
- [ ] 9. Registrar no Obsidian Vault
