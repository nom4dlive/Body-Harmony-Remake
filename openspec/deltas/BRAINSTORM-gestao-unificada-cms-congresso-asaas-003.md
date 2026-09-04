# 🧠 BRAINSTORM-003: Gestão Unificada do CMS Congresso, Lotes e Fluxo de Pagamentos Asaas

## 📋 Contexto Técnico & Diagnóstico

1. **Correção de UI Imediata**: O erro do styled-components `#12 (dYlYPG)` foi identificado em `CongressCheckoutModal.jsx` (linhas 174 e 330) devido à interpolação de `${pulseGlow}` em template strings condicionais sem o helper `css`. Já foi corrigido com a importação e envelopamento com `css\`...\``.
2. **Desafio de Gestão no `/portal-gestor/shop`**: O gestor precisa de controle total e descomplicado para:
   - Virada de lotes e ajuste dinâmico de preços (sem precisar editar em múltiplos lugares).
   - Alternância fluida entre **Checkout Transparente (Nativo)** e **Link Direto Asaas**.
   - Acompanhamento em tempo real de faturamento, credenciamento e vagas VIP.
   - Automações que poupam tempo e evitam intervenção manual de madrugada.

---

## 🏗️ Análise Transversal em Seis Camadas

### 1. Dados (MySQL 8.0 & Auto-Ensure)
- Tabela `shop_settings` / `congresso_cms_settings`: Armazenar `congresso_checkout_mode` (`'native'` | `'asaas_direct'`), `congresso_lote_atual` (`1`, `2`, `3`), `congresso_lote_virada_datetime`, `congresso_vip_max_slots` (40), `congresso_experience_price_cents` (69700), `congresso_vip_price_cents` (149700).
- Tabela `congress_coupons`: CRUD direto no Gestor para criar/ativar/desativar cupons percentuais ou de 100% isenção.

### 2. Backend (PHP 8.4 — Nexus Protocol V3.1)
- `CongressController.php`: Sincronizar preços e lotes diretamente das configurações salvas no CMS em vez de valores hardcoded.
- Verificação de esgotamento de vagas VIP (contagem em `congress_registrations` onde `payment_status = 'CONFIRMED' AND tier_id = 1`).
- Disparo de notificação via bot do Telegram a cada pagamento aprovado via Webhook.

### 3. APIs & Contratos
- `GET /api/v1/congress/settings`: Retorna configurações ativas de lotes, preços, timer e modo de checkout.
- `POST /api/v1/admin/congress/settings`: Salva configurações unificadas de lotes e checkout com 1 clique.
- `POST /api/v1/admin/congress/coupons`: CRUD de cupons promocionais.

### 4. Rotas & Navegação
- `/congresso`: Consome as configurações dinâmicas de preços, lotes e modo de checkout (abre o modal nativo ou redireciona para link Asaas dependendo do toggle no Gestor).
- `/portal-gestor/shop`: Nova sub-aba dedicada **"🎯 Congresso & Lotes"** unificada com controles deslizantes e inputs diretos.

### 5. Interface (Frontend React V3.1 — Aura Grand Prix & Gestor)
- **Painel de Controle de Lotes no Gestor**:
  - Seletor de Lote Ativo: `[ Lote 1 ] [ Lote 2 ] [ Lote 3 ]`
  - Campos de Preço: Experience (R$) e VIP (R$)
  - Timer de Virada: Data e Hora para subida automática de preço
  - Seletor de Tipo de Checkout: `[ Modal Nativo Transparente ]` vs `[ Link Externo Asaas ]`
  - Contador de Vagas VIP: Barra de progresso visual `X / 40 Vagas Preenchidas`
  - Tabela de Cupons Rápidos: Criar cupom em 5 segundos (Código, Desconto %, Limite).

### 6. Marca & Identidade (Aura Grand Prix Tokens)
- No site do Congresso: Badges dinâmicos de urgência ("Últimas X Vagas VIP", "Virada de Lote em XX:XX:XX").
- No Gestor: Design de alta densidade visual (Navy `#0A3E60`, Gold `#ED7E13`, Emerald `#15803D`).

---

## 🧩 Três Opções de Arquitetura

### Opção A — Conservadora (Low Risk) ⚡
**Correção do Modal + Gestão de Lotes pelo CMS existente**
- ✅ Prós: Menor tempo de desenvolvimento (~1h). Corrige o erro do modal e usa os campos atuais do CMS.
- ❌ Contras: Preços de ingressos e textos continuam em abas separadas no Gestor. Sem virada automática de preço por data.
- 📊 Esforço: 1h | 🟢 Risco: Mínimo

### Opção B — Recomendada (Balanced & Anti-Fadiga) 🏆
**Cockpit Unificado do Congresso no Gestor + Virada Automática + Toggle de Modo de Checkout**
- ✅ Prós: Centraliza Lotes, Preços, Modo de Checkout (Nativo vs Link Asaas) e Cupons em uma única tela clara no Gestor. Virada de preço automática por cronômetro. Controle de vagas VIP (trava nos 40). Notificação no Telegram a cada venda.
- ❌ Contras: Requer deploy do novo painel do Gestor e endpoint de settings.
- 📊 Esforço: 2h | 🟡 Risco: Baixo

### Opção C — Next-Gen (High Performance) 🚀
**Tudo da Opção B + Funil de Recuperação Automática de PIX Abandonado via WhatsApp**
- ✅ Prós: Dispara mensagem de WhatsApp automática quando o cliente gera PIX e não paga em 30 minutos.
- ❌ Contras: Complexidade de agendamento de jobs (Evolution API / Cron).
- 📊 Esforço: 4-5h | 🔴 Risco: Médio

---

## 🏆 Veredito Técnico

**Opção B (Recomendada)**: Resolve a sobrecarga cognitiva do gestor, centralizando tudo sobre o Congresso (Lotes, Preços, Vagas e Checkout) em uma única tela no Portal do Gestor com virada automática de lotes.
