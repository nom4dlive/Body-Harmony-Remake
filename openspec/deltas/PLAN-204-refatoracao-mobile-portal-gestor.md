# 📜 Delta — PLAN-204: Refatoração Mobile de Elite do Portal Gestor (App Nativo 2x2 + Listas Compactas Expansíveis)

## 📌 Metadados
- **ID**: PLAN-204
- **Autor**: @antigravity
- **Objetivo**: Redesenhar a interface mobile do Portal Gestor (`/portal-gestor`) para padrão ultra-intuitivo TDAH-friendly estilo App Nativo (Nubank/iFood) com listas compactas de 1 linha expansíveis ao toque.
- **Governança**: Nexus Protocol V3.2 / Hard-Gate `nexus_gate.ps1`.

---

## 🎯 Especificação de Mudanças

### 1. Dashboard (`Dashboard.jsx`)
- Grade 2x2 no mobile com blocos de toque $\ge 54\text{px}$:
  1. 👥 Licenciadas (Ativas e em Onboarding)
  2. ⚡ Loja & Ingressos (Faturamento + Novos Leads)
  3. 📄 Contratos (Assinados / Pendentes)
  4. 🎓 LMS & Treinamento (Acesso rápido)
- Eliminar blocos de skeleton vazios com `...`.

### 2. Gestão de Licenciadas (`UsersPage.jsx` / `GestorUsersPage.jsx`)
- Formato Compacto: Linha com Foto (36px) + Nome + Cidade + Badge de Status + Ícone Chevron.
- Toque: Expande Accordion com botão WhatsApp verde de 1 clique, Dossiê 360° e ações contextuais.

### 3. Gestão da Loja (`ShopManager.jsx`)
- **Métricas do Topo**: 3 pílulas compactas horizontais no celular.
- **Seletor de Abas**: Carrossel deslizante com scroll suave sem truncamento.
- **Tabelas de Pedidos, Leads e Catálogo**: Substituídas no mobile por listas compactas de 1 linha com expansão para ações rápidas (WhatsApp, detalhes do pedido, upload de foto).

---

## 🛡️ Critérios de Aceite
- [x] Zero tabelas cortadas horizontalmente em resoluções $\le 430\text{px}$.
- [x] Alvos de toque $\ge 48\text{px}$.
- [x] `npm run build:release` compila com sucesso.
- [x] `nexus_gate.ps1` com Exit Code 0.
- [x] Deploy sincronizado em produção via Hostinger.