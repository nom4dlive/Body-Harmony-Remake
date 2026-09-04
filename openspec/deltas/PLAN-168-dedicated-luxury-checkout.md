# 🎯 PLAN-168: Novo Checkout Dedicado Luxury (/congresso/checkout)

## [OBJETIVO]
Criar uma página de checkout dedicada (`/congresso/checkout`), moderna e mobile-first, eliminando de vez modais flutuantes, faturas confusas que geravam carnês recorrentes no Asaas e garantindo socorro VIP via WhatsApp na 2ª tentativa de recusa de cartão.

---

## 🚫 [ESPAÇO NEGATIVO]
- NÃO alterar as regras dos lotes e cupons.
- NÃO gerar faturas de contingência com parcelas futuras/carnês no Asaas.
- NÃO exibir modais flutuantes claustrofóbicos no celular.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Backend - Limpeza de Carnê)**: Em `CongressTicketService.php`, desativar a geração de faturas hospedadas parceladas em caso de recusa e retornar mensagem limpa de adquirente.
- [ ] **Passo 2 (Frontend - Página Dedicada de Checkout)**: Criar `CongressCheckoutPage.jsx` com layout de 2 colunas no desktop e 1 coluna fluida no mobile, suporte nativo a PIX, Cartão (com abas Meu Cartão / Cartão de Terceiros) e Botão de Atendimento VIP no WhatsApp na 2ª recusa.
- [ ] **Passo 3 (Roteamento & Integração)**: Em `App.jsx`, adicionar rota `/congresso/checkout` e em `CongressoPage.jsx` direcionar os cliques para a nova página.
- [ ] **Passo 4 (Nexus Gate & Build)**: Executar `nexus_gate.ps1` com Exit Code 0.
- [ ] **Passo 5 (Deploy & Live Smoke Test)**: Publicar na Hostinger via `deploy-pro.ps1` e auditar URL pública `/congresso/checkout`.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/frontend/src/pages/Congresso/CongressCheckoutPage.jsx` [NEW]
- `apps/web-app/src/frontend/src/App.jsx` [MODIFY]
- `apps/web-app/src/frontend/src/pages/Congresso/CongressoPage.jsx` [MODIFY]
- `apps/web-app/src/backend/api/v1/Services/CongressTicketService.php` [MODIFY]
- `openspec/tracker/task.md` [MODIFY]
