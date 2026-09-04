# 🎯 Objetivo Fullstack (PLAN-059)
Aprimorar a experiência de leitura e navegação do **Portal de Assinatura Digital Avançada** ([`PublicSignPage.jsx`](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/pages/Admin/Contracts/PublicSignPage.jsx)) tanto para dispositivos móveis quanto desktops, aplicando os princípios do **UX Pro Max & Luxury Standard (Navy `#0A3E60` & Gold `#ED7E13`)**:

1. **📊 Painel de Guia Rápido & Destaques Executivos:** Card no topo com os principais pontos do contrato (Objeto, Valor/Taxa, Exclusividade Territorial, Prazo e Foro) para consulta imediata antes da leitura completa.
2. **📑 Índice Interativo de Cláusulas & Busca Interna:** Dropdown/Menu de navegação rápida com pílulas para saltar diretamente para Cláusula Primeira (Objeto), Quarta (Exclusividade), Sétima (Valores), Nona (Prazo) e Vigésima Quinta (Foro), além de campo de busca de termos em tempo real.
3. **🔍 Barra de Ferramentas de Leitura (Reading Toolbar):**
   - **Controle de Zoom/Fonte:** Botões `A-` / `A+` para ajustar a escala da tipografia (14px a 20px).
   - **Contraste/Tema de Leitura:** Alternador entre modo Padrão (Branco/Cinza), Média Luz (Sepia `#FDFBF7`) e Modo Focado (Dark Slate `#1E293B`).
   - **Modo Leitura em Tela Cheia (Expandir):** Botão de expansão do leitor para ocupar 100% da viewport móvel/desktop, eliminando distrações.
4. **📈 Barra de Progresso de Leitura:** Indicador dinâmico de rolagem (`0%` a `100%`) no topo/rodapé do leitor do documento.
5. **📥 Download Prévio da Minuta:** Botão para baixar a minuta em PDF antes de confirmar a assinatura.

---

# 📜 Contratos de API (REGRA 1)
- [x] Mantida simetria com [`openspec/contracts/admin/contracts.json`](file:///f:/Body-Harmony-Remake/openspec/contracts/admin/contracts.json).

---

# 🚫 Espaço Negativo (Fora de Escopo)
- [x] Nenhuma alteração nas tabelas de banco de dados MySQL ou no mecanismo de validação de token hash SHA-256.

---

# ⚛️ Camada de Interface (React V3.1)
- [ ] **[`PublicSignPage.jsx`](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/pages/Admin/Contracts/PublicSignPage.jsx):**
  - Implementar o estado de zoom da fonte (`fontSizeLevel`), tema de leitura (`readerTheme`), modo fullscreen (`isFullscreenReader`), termo de busca (`searchTerm`) e progresso de scroll (`scrollProgress`).
  - Adicionar o **Painel de Destaques Executivos** com ícones e métricas resumidas do contrato.
  - Criar o **Índice Interativo de Cláusulas** com auto-scroll suave (`scrollIntoView({ behavior: 'smooth' })`).
  - Adicionar a **Barra de Ferramentas de Leitura** com botões responsivos (alvos de toque >= 44x44px em telas sensíveis ao toque).
  - Adicionar o botão de **Baixar Minuta (PDF)** no topo do leitor.

---

# 🚀 Roteamento do Deploy Híbrido
- **Hostinger Premium (Frontend/API):** Execução de `Operations/deploy-pro.ps1` para sincronização completa.

---

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] Executar `npm run build` na pasta `apps/web-app` para validar ausência de erros de compilação JSX.
- [ ] Testar assinatura digital de ponta a ponta na rota publica `/assinar/:signToken`.

---

# ✅ Checklist de Execução Atômica
- [x] 1. Criar plano PLAN-059
- [ ] 2. Implementar Painel de Destaques Executivos e Barra de Ferramentas de Leitura em `PublicSignPage.jsx`
- [ ] 3. Implementar Índice Interativo de Cláusulas, Busca de Termos e Leitura em Tela Cheia
- [ ] 4. Implementar Indicador de Progresso de Rolagem e Download da Minuta
- [ ] 5. Espelhar build do frontend para `build/public_html`
- [ ] 6. Executar o deploy de produção `deploy-pro.ps1` e validar em produção
