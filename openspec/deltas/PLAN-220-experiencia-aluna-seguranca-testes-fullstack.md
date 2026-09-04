# 📋 PLAN-220 — Experiência da Aluna (Player Híbrido), Blindagem de Segurança & Testes Automatizados

## [OBJETIVO]
Implementar a experiência completa da aluna com a Dra. Harmony AI (assistente no player da aula com salto para minutagem do vídeo e SmartBook full-screen), blindagem de segurança com lock atômico de créditos diários (`SELECT ... FOR UPDATE`), rate limiting anti-abuso e suíte de testes automatizados PHP/Frontend.

---

## 🚫 [ESPAÇO NEGATIVO]
- O container `bodyharmony-qwenproxy` exclusivo do Hermes Agent não será tocado.
- Os módulos financeiros e de contratos existentes permanecem intactos.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [ ] **Passo 1 (Backend Security & Atomic Lock)**: Implementar lock atômico com transação PDO em `LmsNotebookService::chatWithNotebook`, dedução rigorosa de créditos, rate limiter em memória/banco e retorno de timestamps clicáveis.
- [ ] **Passo 2 (Player Híbrido da Aluna)**: Integrar gaveta retrátil da Dra. Harmony AI no `LessonPlayer.jsx` com callback `onSeek(seconds)` para pular o vídeo ao clicar nas citações temporais (ex: `[03:45]`).
- [ ] **Passo 3 (Card Luxury de Limite de Cota & WhatsApp)**: No `AiNotebookEmbed.jsx` e `SmartBookPage.jsx`, exibir modal/card de cota esgotada com botão direto de recarga no WhatsApp da Coordenação.
- [ ] **Passo 4 (Suíte de Testes Automatizados)**: Criar `tests/LmsNotebookSecurityTest.php` validando exaustão de cota, rate limiting e bloqueio de não-beta.
- [ ] **Passo 5 (Validação Hard-Gate & Deploy)**: Rodar `nexus_gate.ps1` com Exit Code 0 e publicar em produção via `/deploy`.

---

## 📦 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
1. `openspec/contracts/aluna/lms-notebook-chat-rag.json`
2. `apps/web-app/src/backend/api/v1/Services/LmsNotebookService.php`
3. `apps/web-app/src/backend/api/v1/Controllers/LmsNotebookController.php`
4. `apps/web-app/src/backend/api/v1/index.php`
5. `apps/web-app/src/frontend/src/components/AiNotebookEmbed.jsx`
6. `apps/web-app/src/frontend/src/pages/Aluna/LessonPlayer.jsx`
7. `apps/web-app/src/frontend/src/pages/Aluna/SmartBookPage.jsx`
8. `apps/web-app/src/backend/tests/LmsNotebookSecurityTest.php`

---

## 📊 [SAVE STATE]
- **Status**: EM PLANEJAMENTO
- **Data**: 2026-09-03
- **Nexus Protocol**: V3.2
