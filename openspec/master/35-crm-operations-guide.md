# 📖 Guia Operacional Mestre — CRM Body Harmony

**Protocolo:** Nexus Protocol V3.1  
**Classificação:** Documento Perene de Operações (Master Guide)  
**Data de Publicação:** 30 de Agosto de 2026  
**Responsáveis:** Dra. Joselene Aparecida da Silva (Diretoria), Cibele (Clínica), Giovanna (Comercial), Equipe de TI (@antigravity, @hermes)

---

## 🏛️ 1. Visão Geral da Arquitetura & Canais Oficiais

A Central de Atendimento CRM Body Harmony (`https://bodyharmony.com.br/portal-gestor/crm`) unifica todas as conversas do WhatsApp, Instagram Direct, Telegram e Google Workspace em uma interface integrada e de alta produtividade (Workspace-First).

```
                                  ┌───────────────────────────────┐
                                  │   CLIENTES, LEADS & ALUNAS    │
                                  └───────────────┬───────────────┘
                                                  │
                 ┌───────────────────────┼───────────────────────┼───────────────────────┐
                 │                       │                       │                       │
                 ▼                       ▼                       ▼                       ▼
    ⚖️ LINHA 1: JURÍDICO    👑 LINHA 2: LICENCIADAS 💆 LINHA 3: CLÍNICA     💼 LINHA 4: COMERCIAL
       (18) 99619-3745          (18) 99601-2050         (18) 99601-2050         (18) 99635-6825
       • Dra. Josi Silva        • Dra. Josi Silva       • Cibele (Clínica)      • Giovanna (Vendas)
       • Modo: 100% Humano      • Modo: 100% Humano     • Modo: Copiloto 3S     • Modo: Híbrido 24/7
                 │                       │                       │                       │
                 └───────────────────────┼───────────────────────┼───────────────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────┐
                        │   CHATWOOT OMNICHANNEL ENGINE   │
                        │   (crm.bodyharmony.com.br)      │
                        └────────────────┬────────────────┘
                                         │
               ┌─────────────────────────┴─────────────────────────┐
               ▼                                                   ▼
🤖 HERMES AGENT & SENTINEL                          ☁️ GOOGLE WORKSPACE SUITE
• Dosimetria Protocolo 3S (Hz/µs)                   • Google Calendar (Grade Matriz)
• Resposta Automática Noturna                       • Google Drive (Prontuários)
• Handoff Humano (lead-quente)                      • Google People API (Contatos)
```

---

## 📱 2. Matriz de Linhas & Roteamento Oficial

| Linha | Número Oficial | Atribuição Principal | Modo de Inteligência Artificial |
|---|---|---|---|
| **⚖️ Linha 1 — Jurídico & Contratos** | `(18) 99619-3745` | Emissão de contratos PJ, distratos e governança corporativa. | **100% Humano (MUTED)** — O bot é silenciado para garantir segurança jurídica total. |
| **👑 Linha 2 — Suporte às Licenciadas** | `(18) 99601-2050` | Atendimento prioritário e exclusivo a franqueadas, alunas e mentorias da Dra. Joselene Silva. | **100% Humano (MUTED / Copiloto)** — Linha preservada para relacionamento direto com parceiras. |
| **💆 Linha 3 — Clínica Matriz (Assis/SP)** | `(18) 99601-2050` | Atendimento e acolhimento de pacientes, anamneses e lembretes Anti No-Show de eletroestimulação (Cibele). | **Copiloto Clínico (COPILOT)** — Injeta Nota Privada com dosimetria do Protocolo 3S (Hz/µs). |
| **💼 Linha 4 — Comercial & Congresso** | `(18) 99635-6825` | Venda de ingressos do Congresso 2026, cursos, workshops e captação de leads (Giovanna). | **Híbrido 24/7 (HYBRID_24_7)** — Copiloto de dia; resposta direta no plantão noturno. |

---

## 💆 3. Procedimentos Operacionais: Clínica & Pacientes (Cibele)

### 📅 3.1. Agendamento de Sessões (Google Calendar)
1. No Portal do Gestor, acesse a aba **"💆 2. Clínica & Pacientes"**.
2. Clique no botão **"Abrir Agenda"** para visualizar a grade da clínica matriz de Assis/SP.
3. Para teleconsultas ou avaliações online, utilize o gerador de Google Meet no Cockpit Lateral (`CRMCockpitSidebar`).

### ⚡ 3.2. Motor Anti No-Show (Lembretes Automáticos)
- O sistema varre agendamentos e dispara automaticamente:
  - **Lembrete 24h Antes:** Notificação no WhatsApp solicitando confirmação (*"Responda 1 para Confirmar"*).
  - **Lembrete 2h Antes:** Alerta tático com endereço da clínica matriz (`Rua Sebastião da Silva Leite, nº 456, Assis/SP`).
- Caso a paciente responda confirmando, o status é atualizado para `confirmado_24h`.

### 📋 3.3. Fichas de Anamnese & Triagem Estética
- O link oficial do Google Forms de Anamnese é enviado à nova paciente.
- Ao ser respondido, o webhook injeta automaticamente uma **Nota Privada Dourada** na conversa do Chatwoot com o resumo de queixas, contraindicações e dados cadastrais.

### 📁 3.4. Prontuários & Fotos Antes/Depois no Google Drive
- Cada paciente possui uma pasta no Google Drive estruturada sob:
  `Body Harmony / Prontuarios / Prontuario — [Nome da Paciente] (CPF [CPF])`
- As fotos de evolução do tratamento devem ser salvas diretamente nessa pasta.

---

## 💼 4. Procedimentos Operacionais: Comercial & Vendas (Giovanna)

### 🎟️ 4.1. Ingressos do Congresso Body Harmony 2026
A marca comercializa 2 categorias oficiais de ingressos:

1. **Ingresso Experience (R$ 697,00 em até 12x):**
   - Link de Checkout: `https://bodyharmony.com.br/shop/checkout/congresso-experience`
   - Acesso completo aos 2 dias de palestras + Kit Welcome oficial.
2. **Ingresso VIP Exclusive (R$ 1.497,00 em até 12x):**
   - Link de Checkout: `https://bodyharmony.com.br/shop/checkout/congresso-vip`
   - Lugares nas primeiras fileiras + **Crédito Integral de R$ 1.497,00** para compra de cursos, mentorias ou equipamentos Body Harmony!

### ⚡ 4.2. Macros Rápidas no Chatwoot
No chat com o cliente, digite o atalho e tecle Enter:
- `/congresso_exp` ➔ Mensagem completa de apresentação e link do ingresso Experience.
- `/congresso_vip` ➔ Mensagem destacando o benefício de 100% de crédito do ingresso VIP.
- `/pix_matriz` ➔ Chave PIX oficial CNPJ `68.016.506/0001-22` (BODY HARMONY ELETROESTIMULAÇÃO LTDA).
- `/horarios_clinica` ➔ Tabela de horários de funcionamento da clínica matriz.
- `/anamnese` ➔ Link seguro do formulário de triagem estética.

### 🌙 4.3. Plantão Noturno Hermes Agent (Dra. Harmony AI)
- **Horário de Atuação:** Das 18:00 às 08:00 (Segunda a Sexta) e 24h nos Sábados, Domingos e Feriados.
- **Comportamento:**
  - Tira dúvidas sobre o Congresso e cursos.
  - Envia links diretos de checkout.
  - Em caso de intenção forte de compra ou pedido de atendente, executa o **Handoff Humano**: reabre a conversa, adiciona a tag `lead-quente` e direciona para a Giovanna responder na abertura do expediente.

---

## 🛡️ 5. Procedimentos de Contingência & Diagnóstico

### 🔄 5.1. Reconexão de Linhas WhatsApp via QR Code
Se alguma linha for desconectada (troca de aparelho ou desconexão do WhatsApp Web):
1. No Portal do Gestor (`/portal-gestor/crm`), clique no botão **"Conectar WhatsApp"** na TopBar.
2. Selecione a instância desejada (`juridico`, `licenciadas` ou `comercial`).
3. O modal exibirá o QR Code gerado em tempo real pela Evolution API.
4. Abra o WhatsApp no celular, vá em **Aparelhos Conectados ➔ Conectar Aparelho** e escaneie o código.
5. O status mudará imediatamente para `🟢 Conectado`.

### 🩺 5.2. Sonda Unificada de Saúde Operacional
- Clique no botão **"🛡️ Diagnóstico"** na TopBar do CRM Hub.
- O sistema executa os 5 probes em paralelo:
  - 🗄️ **MySQL:** Latência de consulta do banco.
  - 💬 **Chatwoot Bridge:** Comunicação com o servidor web.
  - 📱 **WhatsApp Evolution:** Status das 3 instâncias.
  - 🔑 **Google Service Account:** Integridade dos escopos de Calendar/Drive/Contacts.
  - ⚡ **Redis Queue:** Fila de lembretes e jobs em background.

### 🤖 5.3. Sentinela Watchdog na VPS Dedicada
- O script `scripts/sentinel_crm_watchdog.py` monitora a saúde a cada 15 minutos.
- Em caso de falha crítica de banco ou desconexão de linha, emite alertas no canal de supervisão de TI.

---

**© 2026 Body Harmony Eletroestimulação Ltda. Todos os direitos reservados.**
