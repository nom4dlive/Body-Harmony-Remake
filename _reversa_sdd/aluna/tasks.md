# Tasks: Portal da Aluna

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabelas `alunas`, `aluna_devices`, `aluna_course_access`, `aluna_progress`, `aluna_certificates` criadas
- [ ] AuthMiddleware operacional (extração de token por header)
- [ ] Tabela `auth_logs` para registro de tentativas
- [ ] APP_SECRET configurado para signed URLs

## Tarefas

### T01: Login aluna com token prefixado
- **Arquivo legado:** `Controllers/AlunaAuthController.php`
- **Descrição:** Implementar loginAluna(input) com validação CPF/email, bcrypt verify, throttling (5 falhas), device management FIFO, geração de token `al_` + bin2hex(random_bytes(30))
- **Critério de pronto:** Aluna autentica com credenciais válidas; token começa com `al_`; 5 falhas bloqueiam conta 15 min
- **Confidência:** 🟢 CONFIRMADO

### T02: guardAluna middleware
- **Arquivo legado:** `Controllers/AlunaLmsController.php`
- **Descrição:** Implementar guardAluna() que valida token do header `X-ALUNA-TOKEN` contra `aluna_devices JOIN alunas`, injeta `$loggedAluna` global
- **Critério de pronto:** Token aluna válido popula usuário; inválido retorna 401
- **Confidência:** 🟢 CONFIRMADO

### T03: Listar módulos com progresso
- **Arquivo legado:** `Controllers/AlunaLmsController.php`
- **Descrição:** Implementar modules() com JOIN: aluna_course_access → lms_modules → lms_lessons → aluna_progress. Filtrar is_active e expires_at. Calcular total_lessons, completed_lessons, progress_percent
- **Critério de pronto:** Retorna módulos acessíveis com métricas de progresso
- **Confidência:** 🟢 CONFIRMADO

### T04: Catalog de módulos
- **Arquivo legado:** `Controllers/AlunaLmsController.php`
- **Descrição:** Implementar catalog() listando todos módulos ativos com subquery para has_access (se aluna tem registro em aluna_course_access)
- **Critério de pronto:** Aluna vê todos módulos com flag has_access correta
- **Confidência:** 🟢 CONFIRMADO

### T05: Salvar progresso (UPSERT)
- **Arquivo legado:** `Controllers/AlunaLmsController.php`
- **Descrição:** Implementar saveProgress(input) com UPSERT em aluna_progress. Se completou aula, marcar completion_date e avançar last_active_lesson_id
- **Critério de pronto:** Progresso salvo sem duplicatas; aula completada reflete no módulo
- **Confidência:** 🟢 CONFIRMADO

### T06: Signed URL para vídeo
- **Arquivo legado:** `Controllers/AlunaLmsController.php`
- **Descrição:** Implementar signUrl(lesson_id) verificando acesso. HLS → URL pública; MP4 → HMAC-SHA256 com APP_SECRET, expiry 1h
- **Critério de pronto:** URL assinada expira após 1h; sem acesso retorna 403
- **Confidência:** 🟢 CONFIRMADO

### T07: Emissão de certificado
- **Arquivo legado:** `Controllers/AlunaLmsController.php`
- **Descrição:** Implementar certificate(module_id) verificando se todas aulas concluídas. Gerar hash SHA-256(user_id + module_id + time + secret), INSERT em aluna_certificates
- **Critério de pronto:** Certificado emitido apenas se modulo completo; hash_code único e verificável
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Login aluna com CPF válido retorna token `al_...`
- [ ] TT-02: Módulos listados refletem apenas acesso concedido
- [ ] TT-03: Progresso UPSERT não cria duplicatas
- [ ] TT-04: Signed URL expira após 1h
- [ ] TT-05: Certificado rejeitado se módulo incompleto

## Ordem Sugerida

1. T01 (login) + T02 (guard) — base de autenticação
2. T03 (modules) + T04 (catalog) — consultas
3. T05 (progress) + T06 (sign-url) — interação
4. T07 (certificate) — final

## Lacunas Pendentes (🔴)

- Nível de conclusão: 80% ou 100% para certificado? Código mostra ">=80%" mas regra diz "100%". Validar
