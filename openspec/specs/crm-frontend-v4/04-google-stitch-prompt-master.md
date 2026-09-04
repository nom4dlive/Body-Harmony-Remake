# 🎨 Google Stitch Prompt Master — Body Harmony CRM V4

Este arquivo contém o conjunto completo de prompts prontos para copiar e colar no **Google Stitch** (ou ferramenta equivalente de prototipagem por IA) para gerar as telas de alta fidelidade do CRM Body Harmony V4.

---

## 🌟 1. System Prompt Global para o Google Stitch

Copie e configure este bloco como contexto base / system instruction do projeto no Stitch:

```text
Você é um Designer Especialista em UI/UX para Aplicações Web de Alta Fidelidade (SaaS B2B Luxury & Healthcare).
Crie um protótipo de CRM Omnichannel completo para a marca de estética médica e eletroestimulação de elite "Body Harmony".

DIRETRIZES DE DESIGN SYSTEM:
1. Paleta de Cores Oficial & Regras Estritas de Contraste (WCAG AAA):
   - Primary: Deep Navy Blue (#0A3E60)
   - Secondary / Accent / CTAs: Metallic Luxury Gold (#ED7E13)
   - Dark Neutral / Sidebar Background: Deepest Navy (#072B44)
   - Surface / App Background: Clean Slate (#F8FAFC)
   - Card Surface: Pure White (#FFFFFF) com bordas ultrafinas (#E2E8F0)
   - Status Indicators: Emerald Green (#10B981) para Conectado/Sucesso, Amber Gold (#F59E0B) para Pendente/Atenção, Ruby Red (#EF4444) para Erro/Desconectado.
   
2. REGRA DE OURO DE CONTRASTE NO MENU LATERAL (ZERO TEXTO ESCURO EM FUNDO ESCURO):
   - No Sidebar escuro (#072B44): NUNCA use texto azul escuro ou cinza apagado.
   - Textos de itens inativos do menu DEVEM ser BRANCO NÍTIDO ou CINZA CLARO (#E2E8F0 / #CBD5E1), com ícones em cinza claro (#94A3B8).
   - O item ativo do menu DEVE ter fundo translúcido ouro (rgba(237, 126, 19, 0.2)), borda esquerda dourada (#ED7E13) e texto em Ouro Vibrante (#FFB366) ou Branco Puro (#FFFFFF) em negrito.
   - O botão principal "+ New Patient / + Novo Lead" DEVE ter fundo Dourado Intenso (#ED7E13) e texto BRANCO PURO (#FFFFFF) com alto contraste.

3. Tipografia: 'Outfit' para títulos e métricas de impacto; 'Montserrat' ou 'Inter' para o corpo de texto e balões de chat.
4. Ergonomia: Espaçamentos densos e ergonômicos, cantos arredondados de 10px a 14px, sombras suaves sutis (shadow-sm a shadow-md), alvos de clique mínimos de 44x44px.
5. Idioma da Interface: Português do Brasil (pt-BR).
```

---

## 🖥️ 2. Prompt Tela 1: Shell Principal & Inbox Tri-Painel (Conversação ao Vivo)

Copie e cole este prompt para gerar a tela principal de atendimento:

```text
Crie a tela principal do CRM Body Harmony com layout "Workspace Tri-Painel" ocupando 100% da viewport (1440x900px), com ALTO CONTRASTE E LEGIBILIDADE MÁXIMA:

1. MENU LATERAL ESQUERDO (Sidebar - 250px, Dark Navy #072B44):
   - Topo: Logotipo da Body Harmony com texto branco "Body Harmony" e subtítulo dourado "ELITE HEALTHCARE CRM", com status multicanal "● 3 WhatsApp | 📸 Instagram | ✈️ Telegram".
   - Botão CTA Destacado: "+ Novo Paciente / Lead" com fundo Dourado (#ED7E13), texto BRANCO PURO (#FFFFFF) em negrito e sombra dourada sutil.
   - Itens de Navegação (ATENÇÃO: Todos os textos inativos devem ser CINZA CLARO #E2E8F0 com alta legibilidade):
     * SEÇÃO ATENDIMENTO:
       - "💬 Inbox Omnichannel" (Ativo: fundo azul marinho com pill dourada translúcida, borda esquerda #ED7E13, texto #FFB366 e badge '8')
       - "📂 Minhas Conversas" (Texto #E2E8F0, ícone #94A3B8, badge '3')
       - "🤖 Fila IA / Transbordo" (Texto #E2E8F0, ícone #94A3B8, badge '1' pulsante dourado)
     * SEÇÃO VENDAS & CLÍNICO:
       - "📊 Funil de Vendas" (Texto #E2E8F0, ícone #94A3B8)
       - "🩺 Suporte Clínico" (Texto #E2E8F0, ícone #94A3B8)
       - "👥 Base de Contatos 360°" (Texto #E2E8F0, ícone #94A3B8)
     * SEÇÃO GOOGLE WORKSPACE:
       - "📅 Google Calendar & Meet" (Texto #E2E8F0, ícone #94A3B8)
       - "📁 Google Drive Pacientes" (Texto #E2E8F0, ícone #94A3B8)
       - "📇 Sync Google Contacts" (Texto #E2E8F0, ícone #94A3B8)
     * SEÇÃO GESTÃO & CANAIS:
       - "📱 Conexões (WhatsApp/Insta/TG)" (Texto #E2E8F0, ícone #94A3B8)
       - "🚀 Disparos em Massa" (Texto #E2E8F0, ícone #94A3B8)
       - "📈 Relatórios & Looker Studio" (Texto #E2E8F0, ícone #94A3B8)
   - Rodapé: Card do Atendente com avatar, nome "Mariana Silva" em texto branco #FFFFFF, seletor de presença (🟢 Disponível), botão de Notificações, Tema e Atalho para recolher (Ctrl+B).

2. COLUNA 1 - LISTA DE CONVERSAS OMNICHANNEL (340px, Background #FFFFFF, Borda direita #E2E8F0):
   - Topo: Barra de busca "Buscar por nome, telefone ou @instagram..." e seletor de canais em chips horizontais: [Todos (32)] [🟢 WhatsApp (24)] [📸 Instagram (5)] [✈️ Telegram (3)].
   - Lista de Cards de Conversa:
     * Card 1 (Selecionado): Avatar com anel dourado, Nome "Dra. Camila Vasconcelos", badge com logo do WhatsApp verde "Linha Comercial SP", última mensagem: "Gostaria de saber o valor da franquia...", horário "10:42", contador de 2 mensagens não lidas em dourado.
     * Card 2: Avatar, Nome "Dra. Renata Souza (@renata.estetica)", badge roxo do Instagram Direct, "Foto enviada", "09:15", tique duplo azul.
     * Card 3: Avatar, Nome "Dra. Patrícia Lima (@patricia_bh)", badge azul do Telegram, "Transbordo solicitado pela IA Hermes", "08:30", badge de urgência.

3. COLUNA 2 - CANVAS CENTRAL DE CHAT OMNICHANNEL (Flex 1, Background #F8FAFC):
   - Header do Chat: Avatar da Dra. Camila, status "Digitando...", indicador de canal "🟢 WhatsApp: Linha Principal SP", atendente "Mariana", botões de Ações Rápidas (📞 WhatsApp, 📅 Agendar Google Meet, 📁 Abrir Google Drive, ↗ Abrir Dossiê).
   - Área de Mensagens com rolagem:
     * Mensagem da cliente (Branco #FFFFFF, borda #E2E8F0): "Olá! Quero implantar a eletroestimulação na minha clínica em Campinas. Como funciona a qualificação de Licenciada?"
     * Resposta da IA Hermes (Azul com tag '🤖 Copiloto Hermes'): "Olá Dra. Camila! Excelente escolha. Nosso protocolo patenteado inclui equipamento certificado e treinamento presencial..."
     * Mensagem de Áudio: Player de áudio moderno com forma de onda sonora (waveform dourado), botão Play, tempo "0:38 / 1:12", velocidade [1.5x] e botão "[📝 Transcrever Áudio]".
     * Whisper Note Interna (Fundo amarelo claro com borda dourada pontilhada): "🔒 Nota Interna (Mariana): Lead qualificada, pasta no Drive criada."
   - Footer de Digitação: Campo de texto moderno com placeholder "Digite uma mensagem ou '/' para respostas rápidas...", botões de anexo (📎 Clipes, 🖼️ Foto, 📄 PDF Contrato), gravação de áudio (🎙️) e botão de Enviar em Gold (#ED7E13).

4. COLUNA 3 - DOSSIÊ 360° COM GOOGLE WORKSPACE HUB (380px, Background #FFFFFF, Borda esquerda #E2E8F0):
   - Topo: Foto grande, Nome "Dra. Camila Vasconcelos", Categoria [LEAD VIP - FRANQUIA], Botão "Editar Dados".
   - Abas de Informação: [Cadastro & Social] [Google Suite] [Contratos] [Compras]
   - Conteúdo da Aba Ativa (Google Suite & Ações Integradas):
     * Card Google Calendar: "Próxima Avaliação Clínica: 03/09 às 14:30" com botão "[🎥 Entrar Google Meet]" e "[📅 Reagendar]".
     * Card Google Drive: "Pasta do Paciente: [BH] Dra. Camila_Assis" com botão "[📁 Ver Exames & Fotos no Drive]".
     * Card Google Contacts: "Sincronizado na Agenda Google ✓" com botão "[📇 Atualizar Contato]".
     * Botões de Ação Imediata: "+ Emitir Contrato de Licenciamento" e "💳 Gerar Link de Pagamento Loja".

```

---

## 📊 3. Prompt Tela 2: Funil Kanban & Pipeline Comercial

Copie e cole este prompt para gerar a tela de gestão de funil visual:

```text
Crie a tela do "Funil Kanban de Vendas e Franquias" para o CRM Body Harmony:

1. TOPBAR DO KANBAN:
   - Título: "Pipeline Comercial — Expansão de Licenciadas 2026"
   - Seletor de Funis: [Dropdown: Funil Comercial Franquias ▼] [Alternar para Suporte Clínico]
   - Filtros: [Buscar Lead...] [Atendente: Todos ▼] [Linha WhatsApp: Todas ▼] [Origem do Lead ▼]
   - Ação: Botão Dourado "+ Novo Lead Manual".

2. COLUNAS DO KANBAN (Estilo Trello / Linear / ClickUp com visual Luxury):
   - Coluna 1: "Novos Leads (Inbound)" (6 cards • R$ 0,00) - Cor do topo: Cinza Azulado (#64748B)
   - Coluna 2: "Qualificados & Triagem" (4 cards • R$ 120.000,00) - Cor do topo: Azul Marinho (#0A3E60)
   - Coluna 3: "Apresentação / Proposta" (3 cards • R$ 90.000,00) - Cor do topo: Âmbar Dourado (#ED7E13)
   - Coluna 4: "Contrato Gerado / Em Assinatura" (2 cards • R$ 60.000,00) - Cor do topo: Roxo (#8B5CF6)
   - Coluna 5: "Fechado / Licenciada Ativa" (8 cards • R$ 240.000,00) - Cor do topo: Verde Esmeralda (#10B981)

3. CARDS INTERATIVOS DENTRO DAS COLUNAS:
   - Cada card possui:
     * Nome da Clínica / Doutora (ex: "Clínica Harmonize - Dra. Juliana").
     * Cidade e Estado (ex: "São Paulo/SP").
     * Valor estimado da oportunidade em destaque (ex: "R$ 30.000,00").
     * Tags coloridas (ex: "Franquia Premium", "Origem: Instagram").
     * Tempo na etapa atual (ex: "Há 2 dias").
     * Avatar do atendente responsável no canto inferior direito.
     * Botão rápido de atalho para abrir a conversa no WhatsApp diretamente (ícone 💬).
```

---

## 📱 4. Prompt Tela 3: Central de Instâncias WhatsApp & Conexões

Copie e cole este prompt para a tela de monitoramento de chips e QR Code:

```text
Crie a tela da "Central de Conexões & Instâncias WhatsApp" para o CRM Body Harmony:

1. HEADER DA PÁGINA:
   - Título: "Instâncias & Conexões WhatsApp (Evolution API v2)"
   - Subtítulo: "Gerencie os números oficiais de atendimento, status de pareamento e saúde das conexões."
   - Ações: Botão Secundário "🔄 Atualizar Status de Todas", Botão Dourado "+ Adicionar Nova Linha WhatsApp".

2. GRID DE CARDS DE INSTÂNCIAS (3 colunas responsivas):
   - Card 1: "Linha 01 — Atendimento Comercial / Vendas"
     * Status: 🟢 CONECTADO (Badge verde)
     * Número: +55 (18) 99695-9486
     * Dispositivo: Samsung Galaxy S23 (Bateria: 88% 🔋 • Sinal: Excelente 📶)
     * Mensagens hoje: 428 enviadas • 392 recebidas
     * Ações: [Testar Envio] [Reiniciar Sessão] [Configurações]
   - Card 2: "Linha 02 — Suporte Pós-Venda & Licenciadas"
     * Status: 🟢 CONECTADO (Badge verde)
     * Número: +55 (18) 99811-2233
     * Dispositivo: iPhone 14 Pro (Bateria: 95% 🔋)
     * Mensagens hoje: 184 enviadas • 170 recebidas
     * Ações: [Testar Envio] [Reiniciar Sessão] [Configurações]
   - Card 3: "Linha 03 — Plantão Noturno & IA Hermes"
     * Status: 🟡 AGUARDANDO LEITURA DO QR CODE (Badge âmbar piscante)
     * Número: +55 (18) 99755-4466
     * Painel Central do Card: Exibe um QR Code nítido e em tamanho legível com contador regressivo "Atualiza em 14s" e instruções: "Abra o WhatsApp > Aparelhos Conectados > Conectar um Aparelho".
     * Ações: [🔄 Gerar Novo QR Code] [Cancelar]
```
