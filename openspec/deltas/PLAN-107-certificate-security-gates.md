# 🎯 PLAN-107: Hard Gate Estrito de Certificados, Mapeamento de Quizzes & Auto-Heal SQL

## 📌 [OBJETIVO]
Corrigir definitivamente o erro de coluna `module_id` em `lms_certificates`, tratar `is_exclusive IS NULL` como base (`0`), e implementar a trava de segurança estrita (*Hard Gate*) onde o certificado da formação master só pode ser emitido quando:
1. 100% das aulas base estiverem concluídas (`completed_lessons == total_lessons > 0`).
2. 100% dos módulos base possuírem quizzes cadastrados E a licenciada tiver obtido nota $\ge$ nota de corte configurada pelo gestor.

---

## 🛡️ [ESPAÇO NEGATIVO]
- Proibido emitir certificado se qualquer módulo base estiver sem quiz ou reprovado.
- Proibido gerar erro 500 caso a tabela `lms_certificates` ou `lms_quizzes` tenha colunas legadas.
- Proibido quebrar a interface caso a licenciada ainda não tenha assistido nenhuma aula (deve mostrar 0% e status bloqueado em vermelho/amarelo, nunca verde).

---

## ⚡ [MICRO-STEPS DE DOPAMINA (3 a 5 min)]

- [ ] **Passo 1: Auto-Heal Completo de Schema (`CertificateController.php`)**
  - Executar `ALTER TABLE lms_certificates ADD COLUMN IF NOT EXISTS module_id ...` para todas as colunas (`module_id`, `type`, `score`, `hash`, `licenciada_id`, `aluna_id`).
  - Executar `UPDATE lms_modules SET is_exclusive = 0 WHERE is_exclusive IS NULL`.

- [ ] **Passo 2: Hard Gate Estrito no Backend (`licenciadaStatus` e `downloadMaster`)**
  - Corrigir queries com `(m.is_exclusive = 0 OR m.is_exclusive IS NULL)`.
  - Validar que cada módulo base tem quiz (`totalQuizzesRequired == totalBaseModules`) e que a aluna passou em todos (`passedQuizzesCount == totalBaseModules`).
  - Validar que `totalBaseLessons > 0` e `completedBaseLessons >= totalBaseLessons`.

- [ ] **Passo 3: Correção do Bug de Coerção Booleana no Frontend (`CertificatesPage.jsx`)**
  - Corrigir `isMasterEligible` para `Boolean(master?.is_eligible) || Boolean(master?.certificate)`.
  - Tratar visualmente o estado de bloqueio quando faltarem aulas ou quizzes.

- [ ] **Passo 4: Verificação Deterministica & Validação Real**
  - Executar `php -l`, rodar `scripts/nexus_gate.ps1` com Exit Code 0 e validar com o perfil da Josi.

---

## 📁 [CONTRATOS & ARQUIVOS ENVOLVIDOS]
- `apps/web-app/src/backend/api/v1/Controllers/CertificateController.php`
- `apps/web-app/src/frontend/src/pages/Portal/Certificates/CertificatesPage.jsx`
- `openspec/deltas/PLAN-107-certificate-security-gates.md`
