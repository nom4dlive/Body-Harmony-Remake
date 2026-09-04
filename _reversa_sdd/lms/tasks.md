# Tasks: LMS (Learning Management System)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabelas: `lms_modules`, `lms_lessons`, `lms_quizzes`, `lms_questions`, `lms_question_options`, `lms_quiz_attempts`, `lms_progress`, `lms_certificates`, `lms_resources`, `lms_resource_access`
- [ ] ResponseCache operacional
- [ ] SimplePDF library disponível

## Tarefas

### T01: Listar módulos com progresso
- **Arquivo legado:** `Controllers/LmsController.php`
- **Descrição:** Implementar index() com cache via ResponseCache (key `api_lms_modules_{userId}`, 300s, privado). Single query JOIN modules + lessons + progress
- **Critério de pronto:** Módulos listados com lessons, progress_percent, is_completed; cache serve em 300s
- **Confidência:** 🟢 CONFIRMADO

### T02: Aulas do módulo com progression lock
- **Arquivo legado:** `Controllers/LmsController.php`
- **Descrição:** Implementar lessons(moduleId) com Strict Progression Lock: verifica se módulo anterior teve quiz aprovado. Se bloqueado → `locked: true` + reason. Falha no check logada e ignorada
- **Critério de pronto:** Módulo bloqueado retorna locked; desbloqueado retorna aulas
- **Confidência:** 🟢 CONFIRMADO

### T03: Salvar progresso (UPSERT + cache invalidation)
- **Arquivo legado:** `Controllers/LmsController.php`
- **Descrição:** Implementar saveProgress(input) com UPSERT em lms_progress. Atualizar last_active_lesson_id na licenciada. Logar PLAY (primeiro acesso) e LESSON_COMPLETE. Invalidar cache `api_lms_modules_{userId}`
- **Critério de pronto:** Progresso salvo sem duplicatas; cache invalidado após save
- **Confidência:** 🟢 CONFIRMADO

### T04: CRUD de módulos (admin)
- **Arquivo legado:** `Controllers/AdminLmsController.php`
- **Descrição:** Implementar index (listar), createModule, updateModule, deleteModule. Reorder via PATCH com array de IDs. Invalidar cache `admin_lms_modules_` em cada operação. Logar em audit_logs
- **Critério de pronto:** Módulos criados/alterados/reordenados corretamente; cache invalidado
- **Confidência:** 🟢 CONFIRMADO

### T05: CRUD de aulas (admin)
- **Arquivo legado:** `Controllers/AdminLmsController.php`
- **Descrição:** Implementar CRUD de aulas com upload de vídeo, thumbnails, HLS. Reorder via PATCH. Suporte a attachments por aula
- **Critério de pronto:** Aulas criadas com vídeo; reorder funcional
- **Confidência:** 🟢 CONFIRMADO

### T06: Sistema de quiz (admin)
- **Arquivo legado:** `Controllers/QuizController.php`
- **Descrição:** Implementar getAdminQuiz(moduleId) e saveQuiz(). saveQuiz com transação atômica: DELETE questions antigas, INSERT novas questions + options. min_score default 70
- **Critério de pronto:** Quiz salvo com questões e opções; transação atômica
- **Confidência:** 🟢 CONFIRMADO

### T07: Quiz start (embaralhar)
- **Arquivo legado:** `Controllers/QuizController.php`
- **Descrição:** Implementar start(module_id): cria tentativa, busca questões, embaralha questões e opções, retorna sem is_correct
- **Critério de pronto:** Questões e opções embaralhadas; gabarito oculto
- **Confidência:** 🟢 CONFIRMADO

### T08: Quiz submit (correção)
- **Arquivo legado:** `Controllers/QuizController.php`
- **Descrição:** Implementar submit(quiz_id, answers): corrige respostas, calcula score, marca passed se score >= min_score. Salva answers JSON em lms_quiz_attempts. Transação atômica
- **Critério de pronto:** Correção precisa; passed marcado corretamente
- **Confidência:** 🟢 CONFIRMADO

### T09: Biblioteca de recursos
- **Arquivo legado:** `Controllers/LmsController.php`, `libs/ResourceService.php`
- **Descrição:** Implementar resources() filtrando por lms_resource_access (licenciada_id). Gerar signed URLs HMAC SHA-256 (15min TTL para download, 1h para stream)
- **Critério de pronto:** Recursos filtrados por acesso; URLs assinadas funcionais
- **Confidência:** 🟢 CONFIRMADO

### T10: Geração de certificado
- **Arquivo legado:** `Controllers/LmsController.php`
- **Descrição:** Implementar certificate(module_id): valida quiz aprovado, gera hash SHA-256(user_id + module_id + time + secret), INSERT em lms_certificates, gera PDF via SimplePDF, force download
- **Critério de pronto:** Certificado emitido apenas se quiz aprovado; PDF válido
- **Confidência:** 🟢 CONFIRMADO

### T11: Dashboard admin LMS
- **Arquivo legado:** `Controllers/AdminLmsController.php`
- **Descrição:** Implementar dashboard() com métricas: total_students, active_students (30d), lessons_watched, completion_rate, teaching_hours, new_enrollments (24h), chart_data (7 dias)
- **Critério de pronto:** Dashboard retorna métricas agregadas corretas
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Módulos listados com progresso correto
- [ ] TT-02: Módulo bloqueado retorna locked=true quando quiz anterior não aprovado
- [ ] TT-03: Quiz submit calcula score e passed corretamente
- [ ] TT-04: Certificado rejeitado se quiz não aprovado
- [ ] TT-05: Signed URL expira após TTL

## Ordem Sugerida

1. T01, T02, T03 — endpoints de licenciada
2. T06, T07, T08 — quiz system
3. T04, T05, T11 — admin CRUD
4. T09, T10 — recursos e certificados

## Lacunas Pendentes (🔴)

- Progression Lock bypass silencioso: erro no check ignora bloqueio — risco de segurança a validar
- Certificate hash deterministico: considerar adicionar nonce se necessário
