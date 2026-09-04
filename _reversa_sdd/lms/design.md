# Design: LMS (Learning Management System)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

### Endpoints Públicos (Licenciada)

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/lms/modules` | — | `{modules: [{id, title, lessons[], progress}]}` | 200 |
| GET | `/lms/modules/{id}/lessons` | — | `{module, lessons[], quiz_status, certificate_available}` | 200, 403 |
| POST | `/lms/progress` | `{lesson_id, progress_percent, is_completed, current_time}` | `{success}` | 200 |
| GET | `/lms/resources` | — | `{resources: [{id, title, url, type}]}` | 200 |
| POST | `/lms/sign-url` | `{lesson_id}` | `{url}` | 200 |
| POST | `/lms/quiz/start` | `{module_id}` | `{questions: [{text, options[]}]}` | 200 |
| POST | `/lms/quiz/submit` | `{quiz_id, answers: [{question_id, option_id}]}` | `{score, passed, total}` | 200 |
| POST | `/lms/certificate/generate` | `{module_id}` | PDF download | 200, 403 |

### Endpoints Admin

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/admin/lms/dashboard` | — | `{metrics, chart_data}` | 200 |
| GET | `/admin/lms/modules` | — | `{modules[]}` | 200 |
| POST | `/admin/lms/modules` | Module data | `{id}` | 201 |
| PATCH | `/admin/lms/modules/reorder` | `{ids: []}` | `{success}` | 200 |
| GET | `/admin/quiz?module_id=X` | — | `{quiz, questions[]}` | 200 |
| POST | `/admin/quiz` | Quiz data | `{success}` | 200 |

## Fluxo Principal: Listar Módulos

1. GET `/lms/modules` → verifica cache `api_lms_modules_{userId}` (300s, privado)
2. Cache miss: single query com LEFT JOIN: `lms_modules` → `lms_lessons` → `lms_progress`
3. Para cada módulo: monta `lessons[]` com `progress_percent` e `is_completed`
4. Cache hit: retorna JSON do arquivo de cache
5. Resposta: `{modules: [{id, title, description, cover_image, display_order, lessons: [{...}]}]}`

## Fluxo Principal: Strict Progression Lock

1. GET `/lms/modules/{id}/lessons` → valida módulo existe
2. Busca módulo anterior (display_order - 1)
3. Se módulo anterior tem quiz associado:
   ```sql
   SELECT COUNT(*) FROM lms_quiz_attempts
   WHERE licenciada_id = :id AND quiz_id = :prev_quiz_id AND passed = 1
   ```
4. Se count = 0 → `locked: true`, `locked_reason: "Módulo anterior não concluído"`
5. Falha no check é logada e ignorada (stabilization bypass)
6. Se desbloqueado: retorna lessons com attachments, quiz_status, certificate_available

## Fluxo Principal: Quiz

### Start
1. POST `/lms/quiz/start` → cria tentativa em `lms_quiz_attempts`
2. Busca questões do quiz, embaralha ordem
3. Para cada questão: embaralha opções, remove `is_correct`
4. Retorna perguntas sem gabarito

### Submit
1. POST `/lms/quiz/submit` → recebe respostas
2. Corrige: compara cada `option_id` contra `lms_question_options.is_correct`
3. Calcula score: `(acertos / total) * 100`
4. Se `score >= min_score` (padrão 70): `passed = 1`
5. Salva `answers` como JSON em `lms_quiz_attempts`
6. Transação atômica

## Fluxo Principal: Certificado

1. POST `/lms/certificate/generate` → valida module_id
2. Busca quiz do módulo, verifica última tentativa com passed=1
3. Se sem certificado existente: hash = `SHA-256(user_id + module_id + time + APP_SECRET)`
4. INSERT em `lms_certificates`
5. Gera PDF via `SimplePDF::Certify(name, quiz_title, date, hash)`
6. Loga evento `DOWNLOAD`
7. Output D (force download)

## Dependências

| Componente | Uso |
|-----------|-----|
| LmsController.php | Módulos, aulas, progresso |
| AdminLmsController.php | CRUD admin de conteúdo |
| QuizController.php | Sistema de quiz |
| ResourceService.php | Signed URLs e controle de acesso |
| Core/ResponseCache.php | Cache de módulos |
| Core/Response.php | Respostas JSON |
| libs/SimplePDF.php | Geração de PDF de certificado |

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Strict Progression Lock com bypass silencioso em falha | `LmsController.php:90` | 🟢 |
| Signed URL HMAC SHA-256 com APP_SECRET | `LmsController.php:signUrl` | 🟢 |
| Quiz transação atômica (DELETE + INSERT) | `QuizController.php:saveQuiz` | 🟢 |
| min_score padrão 70 para aprovação | `QuizController.php` | 🟢 |

## Riscos e Lacunas

- 🟡 Progression Lock bypass silencioso: erro no check é logado e ignorado — pode liberar acesso indevido
- 🟡 Certificate hash deterministico: mesma entrada gera mesmo hash (sem nonce)
