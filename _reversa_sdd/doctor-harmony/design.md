# Design: Doctor Harmony (Mentoria IA)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| POST | `/doctor-harmony/analyze` | `file + notes` | `{opinion, confidence, needs_review}` | 200, 403 |
| GET | `/doctor-harmony/credits` | — | `{credits: {total, used}, history[]}` | 200 |
| GET | `/doctor-harmony/history` | — | `{messages[]}` | 200 |
| GET | `/doctor-harmony/context` | `lesson_id` | `{context}` | 200 |
| GET | `/doctor-harmony/pending` | — | `{cases[]}` | 200 |
| POST | `/doctor-harmony/review/{id}` | `{notes}` | `{success}` | 200 |
| GET | `/doctor-harmony/session` | — | `{session}` | 200 |
| POST | `/doctor-harmony/session` | `BODY raw JSON` | `{success}` | 200 |

### Admin

| Método | Caminho | Entrada | Saída |
|--------|---------|---------|-------|
| GET | `/admin/doctor-harmony/config` | — | `{config}` |
| POST | `/admin/doctor-harmony/config` | `{config}` | `{success}` |
| GET | `/admin/doctor-harmony/audit` | — | `{logs[]}` |
| GET | `/admin/doctor-harmony/health` | — | `{status}` |
| POST | `/admin/doctor-harmony/sandbox` | `file + notes` | `{result}` |

## Fluxo Principal: Analisar Caso Clínico

1. `analyze(input)` recebe `file (foto)` + `notes (anotações)`
2. Verifica LGPD consent da licenciada (`ai_usage` em `site_config`)
3. Se sem consentimento: retorna 403 com mensagem
4. Verifica créditos disponíveis: `SELECT total, used FROM ai_licenses WHERE license_id = :id`
5. Se sem créditos (admin bypass se role=superadmin): retorna 403
6. Se contexto de aula (`lesson_id`): busca dados da aula para enriquecer o prompt
7. Envia para Gemini Vision: foto (base64) + anotações + contexto
8. Recebe análise com `confidence_score`
9. **Crisis detection:** varre texto de anotações + resposta por palavras de desistência (ex: "desistir", "não consigo", "largar")
10. Se crise detectada → `status = PENDING`, `needs_review = 1`
11. Se `confidence_score < 0.80` → `needs_review = 1` (hybrid review)
12. INSERT em `ai_clinical_cases` com todos os dados
13. Decrementa crédito: `UPDATE ai_licenses SET used = used + 1`
14. Loga em `ai_mentorship_logs`
15. Retorna `{opinion, confidence, needs_review}`

## Fluxo Principal: Revisão Híbrida

1. Mentor chama `getPendingCases()` → lista casos com `needs_review = 1`
2. Mentor analisa caso (foto + análise IA + anotações)
3. `submitReview(id, notes)` → UPDATE `ai_clinical_cases`:
   - `mentor_feedback = notes`
   - `status = 'REVIEWED'`
   - `needs_review = 0`
4. Loga revisão em `ai_mentorship_logs`

## Fluxo Alternativo: Sessão de Mentoria

1. `getSession()` → busca `ai_mentorship_sessions` para a licenciada
2. Retorna `session_data` (JSON com estado da conversa)
3. `saveSession(body)` → UPSERT em `ai_mentorship_sessions`:
   - Se existe: UPDATE `session_data`, `last_interaction`
   - Se não: INSERT

## Dependências

| Componente | Uso |
|-----------|-----|
| DoctorHarmonyController.php | Análise, créditos, revisão |
| AdminDoctorHarmonyController.php | Config, audit, health |
| libs/GeminiService.php | Integração Gemini Vision API |
| Core/Response.php | Respostas JSON |

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Hybrid Review (Option C): IA + humana com threshold 0.80 | `DoctorHarmonyController.php:276` | 🟢 |
| Crisis detection por keyword matching | `DoctorHarmonyController.php:203` | 🟢 |
| LGPD consent gate antes de enviar dados | `DoctorHarmonyController.php:223` | 🟢 |
| Créditos por license com admin bypass | `DoctorHarmonyController.php:177` | 🟢 |
| Sandbox admin não consome créditos | `AdminDoctorHarmonyController.php` | 🟢 |

## Riscos e Lacunas

- 🟡 Crisis detection baseada em keywords — pode gerar falsos positivos
- 🟡 Threshold 0.80 fixo (não configurável via admin?)
- 🔴 Palavras de desistência específicas: não é possível confirmar a lista exata sem acesso ao código completo
