# Design: Licenciada

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/licenciadas` | — | `{licenciadas[]}` | 200 |
| POST | `/licenciadas` | `multipart (name, cpf, photo, ...)` | `{id}` | 201, 400 |
| PUT | `/licenciadas/{id}` | `multipart (fields parciais)` | `{success}` | 200 |
| DELETE | `/licenciadas/{id}` | — | `{success}` | 200 |
| GET | `/licenciada/dashboard-summary` | — | `{started, completed, seconds, next_lesson}` | 200 |
| GET | `/licenciada/progress` | — | `{percent, completed, total}` | 200 |
| GET | `/licenciada/lessons` | — | `{modules[], lessons[]}` | 200 |

## Fluxo Principal: Criar Licenciada

1. `LicenciadasController::store()` recebe POST multipart
2. Validação: name obrigatório
3. Sanitização: CPF remove non-digits, email fallback se vazio
4. Password: se enviado → bcrypt hash; senão → `password_hash('Mudar123!', PASSWORD_BCRYPT)` + `force_password_change = 1`
5. INSERT em licenciadas (16+ colunas: name, cpf, email, username, state, location, photo_url, whatsapp, instagram, ...)
6. Upload de foto: `handleUpload(file, id, name, cpf)` → renomeia para `{id}_{name_sanitized}_{cpf}.{ext}`
7. Tratamento de erro MySQL 1062 (duplicidade de CPF/Email/WhatsApp)
8. Loga em tb_system_logs

## Fluxo Principal: Dashboard

1. Token resolution multi-fallback: `X-Device-Token` → `Authorization Bearer` → `$loggedUser`
2. Stats: `SELECT COUNT(*) FROM lms_progress WHERE licenciada_id = :id AND is_completed = 1`
3. Total seconds: `SELECT COALESCE(SUM(duration_seconds), 0) FROM lms_lessons JOIN lms_progress ON lesson_id = id WHERE is_completed = 1`
4. Next lesson: busca `last_active_lesson_id` da licenciada, encontra primeira aula incompleta no fluxo
5. Signals: `SELECT COUNT(*) FROM system_broadcasts WHERE is_active = 1 AND ... LEFT JOIN system_broadcast_logs WHERE read_at IS NULL`
6. Resources: featured approved resources da biblioteca

## Fluxo Principal: Progresso Global

1. Token resolution (multi-fallback)
2. Total aulas ativas: `SELECT COUNT(*) FROM lms_lessons JOIN lms_modules ON module_id = lms_modules.id WHERE lms_modules.is_active = 1`
3. Aulas concluídas: `SELECT COUNT(*) FROM lms_progress WHERE licenciada_id = :id AND is_completed = 1`
4. Percentual: `ROUND(completed / total * 100)`
5. V97 Anomaly Detection: se zero progress, verifica schema de `lms_progress` para coluna `licenciada_id`

## Fluxo Alternativo: Update com Renomeação de Foto

1. `update(id, data)` — mapeamento dinâmico de campos (só os enviados)
2. Se name ou CPF mudou: extrai extensão atual, gera novo nome `{id}_{name_sanitized}_{cpf}.{ext}`, `rename()` no filesystem, atualiza `photo_url`
3. `SanitizeFilename`: remove acentos → ASCII

## Dependências

| Componente | Uso |
|-----------|-----|
| LicenciadasController.php | CRUD de licenciadas |
| dashboard_summary.php | Dashboard metrics |
| progress.php | Progresso global |
| lessons.php | Aulas por licenciada |
| Core/AuthMiddleware.php | Validação de token |
| Core/Response.php | Respostas JSON |

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Senha padrão Mudar123! com force_password_change | `LicenciadasController.php:145` | 🟢 |
| Renomeação de foto no update mantém consistência | `LicenciadasController.php:305` | 🟢 |
| Token resolution multi-fallback (3 níveis) | `dashboard_summary.php:20` | 🟢 |
| Anomaly detection V97 para progresso zero | `progress.php:101` | 🟢 |

## Riscos e Lacunas

- 🟡 V97 Anomaly Detection parece ser código de migração/debug — verificar se deve ser mantido
- 🔴 Limpeza de fotos órfãs quando licenciada é deletada: não encontrada evidência
