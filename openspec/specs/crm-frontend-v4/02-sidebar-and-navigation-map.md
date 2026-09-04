# 🧭 Mapeamento do Menu Lateral & Navegação — CRM Body Harmony V4
**Contexto:** Sidebar Global e Roteamento SPA  
**Comportamento:** Retrátil via `Ctrl+B` ou botão `☰`, densidade compacta, badges reativos em tempo real.

---

## 1. Estrutura Visual e Agrupamentos do Sidebar

O menu lateral é estruturado em **4 Seções Operacionais Principais** e uma barra inferior de **Ações Rápidas do Operador**:

```
+-------------------------------------------------------------+
| [LOGO BODY HARMONY LUXURY - Branco #FFFFFF & Ouro #ED7E13]  |
| Status: ● 3 WhatsApp | 📸 Instagram OK | ✈️ Telegram OK     |
+-------------------------------------------------------------+
| [+ NOVO PACIENTE / LEAD] (Fundo #ED7E13, Texto Branco #FFF) |
+-------------------------------------------------------------+
| ─── ATENDIMENTO OMNICHANNEL ─────────────────────────────── |
| [💬] Inbox Unificado (WhatsApp + Insta + TG) [Ativo]    [8] |
| [📂] Minhas Conversas (Texto Claro #E2E8F0)             [3] |
| [🤖] Fila IA / Transbordo Hermes (Alerta Ouro)          [1] |
|                                                             |
| ─── VENDAS & CLÍNICO ────────────────────────────────────── |
| [📊] Funil de Vendas & Franquias (Texto Claro #E2E8F0)      |
| [🩺] Suporte Clínico & Licenciadas (Texto Claro #E2E8F0)    |
| [👥] Base 360° de Contatos (Texto Claro #E2E8F0)            |
|                                                             |
| ─── GOOGLE WORKSPACE SUITE ──────────────────────────────── |
| [📅] Agenda & Consultas (Google Calendar / Meet)            |
| [📁] Pastas & Exames (Google Drive dos Pacientes)           |
| [📇] Sincronizador Google Contacts (People API)             |
|                                                             |
| ─── AUTOMAÇÃO & MARKETING ───────────────────────────────── |
| [🚀] Disparador em Massa Anti-Ban (Texto Claro #E2E8F0)     |
| [⚡] Automações & Hermes AI Agent (Texto Claro #E2E8F0)     |
|                                                             |
| ─── CANAIS & GESTÃO ─────────────────────────────────────── |
| [📱] Conexões (WhatsApp, Instagram, Telegram)  [● Ativos]   |
| [📈] Analytics & Looker Studio (Texto Claro #E2E8F0)        |
| [⚙️] Configurações & Respostas Rápidas                      |
+-------------------------------------------------------------+
| [PERFIL ATENDENTE] (Nome em Branco #FFFFFF)                 |
| [Status Toggle: 🟢 Disponível]             [🔔] [🌙] [⮜]    |
+-------------------------------------------------------------+


```

---

## 2. Tabela Exaustiva de Itens e Comportamentos

| # | Ícone & Label | Rota / View ID | Atalho | Badge Reativo | Ação ao Clicar (Comportamento Esperado) |
|---|---|---|---|---|---|
| **1** | `💬` **Inbox Omnichannel** | `/inbox/all` | `Alt+1` | Total de conversas não lidas em todos os canais (WhatsApp, Instagram, Telegram) | Abre o Inbox Tri-Painel com seletor de canais no topo. Restaura o estado da conversa e rascunho. |
| **2** | `📂` **Minhas Conversas** | `/inbox/mine` | `Alt+2` | Conversas atribuídas ao operador logado com pendência | Filtra conversas atribuídas diretamente ao atendente em atendimento ativo. |
| **3** | `🤖` **Fila IA & Transbordo** | `/inbox/ai-handoff` | `Alt+3` | Contatos pedindo atendimento humano com urgência | Lista leads/licenciadas onde o agente de IA Hermes finalizou a triagem e pediu transbordo humano imediato. |
| **4** | `📊` **Funil de Vendas & Franquias** | `/kanban/sales` | `Alt+4` | Leads em negociação ativa | Abre o Kanban Comercial com Drag & Drop e cálculo de valor total por etapa. |
| **5** | `🩺` **Suporte Clínico & Licenciadas** | `/kanban/clinic` | `Alt+5` | Dúvidas clínicas e pós-venda em aberto | Abre o Kanban Clínico para suporte de protocolos e acompanhamento de equipamentos. |
| **6** | `👥` **Base 360° (Contatos & Leads)** | `/contacts` | `Alt+6` | Total de contatos cadastrados | Tabela com busca instantânea (`Ctrl+K`), filtros por tags, cidade e categoria. |
| **7** | `📅` **Google Calendar & Consultas** | `/workspace/calendar` | `Alt+C` | Consultas agendadas hoje | Painel integrado do Google Agenda com visualização diária/semanal, criação de eventos com Google Meet e disparo de lembrete WhatsApp. |
| **8** | `📁` **Google Drive (Pastas Pacientes)** | `/workspace/drive` | `Alt+D` | - | Gerenciador de pastas do Google Drive com organização automática `[BH] Pacientes / {Nome_CPF}` para fotos antes/depois, exames e contratos PDF. |
| **9** | `📇` **Sincronizador Google Contacts** | `/workspace/contacts` | `Alt+G` | Contatos pendentes de sync | Disparador de sincronização em lote com o Google Contacts (Google People API), padronizando nomes no formato `[BH] Nome - Cidade/UF`. |
| **10**| `🚀` **Disparos em Massa (Anti-Ban)** | `/campaigns` | `Alt+7` | Status de campanha ativa | Orquestrador de campanhas com warm-up, delay randômico e rotatividade entre chips WhatsApp. |
| **11**| `⚡` **Automações & Hermes AI** | `/automations` | `Alt+8` | Gatilhos ativos | Configuração de plantão noturno, prompts da IA Hermes e integração com N8N / Webhooks. |
| **12**| `📱` **Conexões & Redes Sociais** | `/channels` | `Alt+9` | Status dos canais (WhatsApp, Insta, TG) | Painel unificado de conexões: QR Codes da Evolution API, autorização Meta/Instagram Direct e Telegram Bot Token. |
| **13**| `📈` **Analytics & Looker Studio** | `/analytics` | `Alt+0` | Meta de tempo de resposta | Dashboard de métricas executivas em tempo real e embed integrado com o Google Looker Studio. |
| **14**| `⚙️` **Configurações & Snippets** | `/settings` | `Alt+S` | - | Respostas Rápidas (`/atalhos`), tags coloridas e permissões de atendentes. |


---

## 3. Rodapé do Sidebar — Ações do Atendente

1. **Card de Perfil do Usuário:** Foto, Nome e Cargo (*ex: Mariana — Atendente Comercial*).
2. **Seletor de Status de Presença:**
   - 🟢 `Disponível` (Recebe novas conversas da roleta automática)
   - 🟡 `Em Pausa / Almoço` (Conversas são roteadas para outros atendentes)
   - 🔴 `Ocupado / Em Atendimento Crítico`
   - ⚫ `Offline`
3. **Botão de Notificações (`🔔`):** Drawer com central de alertas de menções e novos transbordos de IA.
4. **Botão de Alternância de Tema (`🌙` / `☀️`):** Toggle de modo visual Luxury Dark / Clean Light.
5. **Botão de Recolher Sidebar (`⮜` / `Ctrl+B`):** Transição suave para modo compacto de 64px (apenas ícones e tooltips flutuantes).
