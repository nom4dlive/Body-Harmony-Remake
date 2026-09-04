# 📋 PLAN-215 — Correção do Fluxo de Download e Cópia de Link de Aulas no LMS do Gestor

## [OBJETIVO]
Corrigir o erro 404 (Not Found) na rota de geração de URL de download e o erro 401 de validação de assinatura HMAC no gateway de download para aulas do LMS do Gestor.

---

## 🚫 [ESPAÇO NEGATIVO]
- O QUE NÃO FOI TOCADO:
  - Não alterar a lógica de upload de chunks ou transcodificação HLS.
  - Não modificar os contratos de autenticação de alunas (`aluna_token`).
  - Não alterar a estrutura visual do `QuickActionsMenu.jsx` nem do `LMSContainer.jsx`.
  - Não expor vídeos que não sejam do tipo `hostinger` sem autorização.

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3-5 min)]
- [x] **Passo 1 (API Router)**: Registrar a rota `GET /admin/lms/lessons/{id}/download-url` com middleware `admin` em `apps/web-app/src/backend/api/v1/index.php`.
- [x] **Passo 2 (Gateway de Download)**: Adicionar `lesson_id` na extração de `resourceId` para validação correta do HMAC em `apps/web-app/src/backend/api/download.php`.
- [x] **Passo 3 (Validação e Hard-Gate)**: Executar teste de rota e rodar `scripts/nexus_gate.ps1` com Exit Code 0.

---

## 📦 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
1. `openspec/contracts/admin/lms-lesson-download-url.json` (Contrato API First)
2. `apps/web-app/src/backend/api/v1/index.php` (Registro de Rota)
3. `apps/web-app/src/backend/api/download.php` (Validação HMAC & Stream de Download)

---

## 📊 [SAVE STATE]
- **Status**: 🟢 CONCLUÍDO & VERIFICADO
- **Data**: 2026-09-03
- **Nexus Protocol**: V3.2
