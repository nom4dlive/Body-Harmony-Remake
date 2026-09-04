# Design: Portal da Aluna

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| POST | `/auth/aluna/login` | `{login, password, device_token?}` | `{token, user}` | 200, 401 |
| GET | `/aluna/modules` | — | `{modules[]}` | 200 |
| GET | `/aluna/catalog` | — | `{modules[], has_access}` | 200 |
| POST | `/aluna/progress` | `{lesson_id, progress_percent, is_completed}` | `{success}` | 200 |
| POST | `/aluna/sign-url` | `{lesson_id}` | `{url}` | 200 |
| GET | `/aluna/certificate/{module_id}` | — | `{certificate}` | 200, 403 |

## Fluxo Principal: Login Aluna

1. `AlunaAuthController::loginAluna(input)` recebe `{login, password, device_token?}`
2. `checkThrottling()` — account-based (5 falhas → lock 15min) + IP-based (50 falhas)
3. Busca aluna por CPF (11 dígitos) → email em `alunas`
4. `password_verify()` com bcrypt — falha retorna 401
5. Device management FIFO:
   - Se device_token fornecido → reusa (atualiza last_used_at)
   - Se novo → verifica `max_devices`, expulsa mais antigo se necessário
6. Gera token: `al_` + `bin2hex(random_bytes(30))` → salva em `aluna_devices`
7. Atualiza `last_login_at` em `alunas`
8. Loga evento em `auth_logs`
9. Retorna `{token, user: {id, name, email}}`

## Fluxo Principal: Listar Módulos

1. `AlunaLmsController::guardAluna()` valida `X-ALUNA-TOKEN` com prefixo `al_`
2. Busca em `aluna_course_access` → INNER JOIN `lms_modules` → LEFT JOIN `lms_lessons` → LEFT JOIN `aluna_progress`
3. Filtra: `is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())`
4. Para cada módulo: calcula `total_lessons`, `completed_lessons`, `progress_percent`
5. Retorna `{modules: [{id, title, description, cover_image, progress_percent, ...}]}`

## Fluxo Principal: Salvar Progresso

1. `saveProgress(input)` recebe `{lesson_id, progress_percent, is_completed}`
2. UPSERT em `aluna_progress`:
   - Se `aluna_id + lesson_id` existe → UPDATE `progress_percent`, `is_completed`, `completion_date`
   - Se não → INSERT novo registro
3. Se `is_completed = 1`: atualiza `last_active_lesson_id` para próxima aula
4. Invalida cache de módulos da aluna
5. Retorna `{success: true}`

## Fluxo Alternativo: URL Assinada

- `signUrl(lesson_id)` verifica acesso via `aluna_course_access`
- Se vídeo HLS → retorna URL pública direta
- Se vídeo MP4 → gera URL assinada: `HMAC-SHA256(caminho + expiry + APP_SECRET)` com validade 1h

## Dependências

| Componente | Uso |
|-----------|-----|
| AlunaAuthController.php | Login |
| AlunaLmsController.php | Módulos, progresso, certificados |
| Core/AuthMiddleware.php | Validação de token |
| Core/Response.php | Respostas JSON |
| libs/ResourceService.php | Signed URLs |

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Token prefixado `al_` para distinguir perfil aluna | `AlunaAuthController.php:162` | 🟢 |
| UPSERT de progresso evita duplicatas | `AlunaLmsController.php:221` | 🟢 |
| Certificate hash = SHA-256(user_id + module_id + time + secret) | `AlunaLmsController.php:353` | 🟢 |
| Acesso expirável via expires_at | `aluna_course_access` schema | 🟢 |

## Riscos e Lacunas

- 🟡 Nível de conclusão para certificado: verifica ">=80%" ou "100%"? Há inconsistência entre code-analysis (>=80%) e regra de negócio (100%). Requer validação
