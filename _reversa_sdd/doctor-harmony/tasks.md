# Tasks: Doctor Harmony (Mentoria IA)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabelas: `ai_clinical_cases`, `ai_mentorship_logs`, `ai_mentorship_sessions`, `ai_config`, `ai_licenses`
- [ ] Google Gemini API key configurada
- [ ] APP_SECRET configurado

## Tarefas

### T01: Análise de caso com Gemini Vision
- **Arquivo legado:** `Controllers/DoctorHarmonyController.php`, `libs/GeminiService.php`
- **Descrição:** Implementar analyze(file, notes): verificar LGPD consent, verificar créditos, enviar foto + anotações + contexto para Gemini Vision, receber análise com confidence_score
- **Critério de pronto:** Caso analisado pela IA; retorno contém opinion e confidence
- **Confidência:** 🟢 CONFIRMADO

### T02: Controle de créditos
- **Arquivo legado:** `Controllers/DoctorHarmonyController.php`
- **Descrição:** Implementar getCredits() retornando total/usados/history. Decrementar crédito após análise. Admin bypass se role=superadmin
- **Critério de pronto:** Créditos consultados e decrementados corretamente; admin bypass funcional
- **Confidência:** 🟢 CONFIRMADO

### T03: Crisis detection
- **Arquivo legado:** `Controllers/DoctorHarmonyController.php`
- **Descrição:** Implementar varredura de texto por palavras de desistência. Se detectado → status=PENDING, needs_review=1. Logar em ai_mentorship_logs
- **Critério de pronto:** Palavras de desistência detectadas marcam caso para revisão prioritária
- **Confidência:** 🟢 CONFIRMADO

### T04: Hybrid review (casos pendentes)
- **Arquivo legado:** `Controllers/DoctorHarmonyController.php`
- **Descrição:** Implementar getPendingCases() listando casos com needs_review=1. submitReview(id, notes) atualiza mentor_feedback, status=REVIEWED, needs_review=0
- **Critério de pronto:** Casos com confidence < 0.80 vão para revisão; mentor pode revisar e finalizar
- **Confidência:** 🟢 CONFIRMADO

### T05: Sessão de mentoria
- **Arquivo legado:** `Controllers/DoctorHarmonyController.php`
- **Descrição:** Implementar getSession() e saveSession(body) com UPSERT em ai_mentorship_sessions. session_data armazena JSON com estado da conversa
- **Critério de pronto:** Sessão salva e recuperada entre interações
- **Confidência:** 🟢 CONFIRMADO

### T06: Admin config e health
- **Arquivo legado:** `Controllers/AdminDoctorHarmonyController.php`
- **Descrição:** Implementar CRUD de config (ai_config key-value), audit logs, health check (Gemini API), sandbox (analisar sem consumir créditos)
- **Critério de pronto:** Configurações alteradas sem deploy; health check funcional; sandbox não consome créditos
- **Confidência:** 🟢 CONFIRMADO

### T07: Histórico e contexto
- **Arquivo legado:** `Controllers/DoctorHarmonyController.php`
- **Descrição:** Implementar getHistory() retornando mensagens anteriores da mentoria. getContext(lesson_id) enriquecendo prompt com dados da aula
- **Critério de pronto:** Histórico carregado; contexto de aula enriquece análise
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Análise com créditos disponíveis → retorna análise
- [ ] TT-02: Análise sem créditos → 403
- [ ] TT-03: Crisis detection → caso vai para PENDING
- [ ] TT-04: Hybrid review → confidence < 0.80 → needs_review
- [ ] TT-05: Admin sandbox → análise sem consumir créditos

## Ordem Sugerida

1. T06 (admin config + health) — infraestrutura
2. T07 (histórico + contexto) — preparação
3. T01 + T02 (análise + créditos) — core
4. T03 + T04 (crisis + revisão) — segurança
5. T05 (sessão) — continuidade

## Lacunas Pendentes (🔴)

- Lista exata de palavras de desistência — código legado precisa ser consultado
- Threshold 0.80 é fixo ou configurável via admin? Não confirmado
