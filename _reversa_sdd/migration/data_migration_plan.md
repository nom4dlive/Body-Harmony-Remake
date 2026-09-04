---
schemaVersion: 1
generatedAt: 2026-06-02T21:20:00-03:00
reversa:
  version: "1.2.43"
kind: data_migration_plan
producedBy: designer
hash: "sha256:f4a5b6c7d8e9"
---

# Data Migration Plan

> Plano de migração dos dados do legado para o sistema novo: mapeamento, transformações, ETL, cutover de dados e validação.

## Resumo
- Volume estimado: < 1GB total (sistema de médio porte — licenciadas, alunas, progresso, conteúdo)
- Janela de migração: 30-60 min (ver `cutover_plan.md`)
- Estratégia: backfill único no cutover (dump → transform → load) + verificação pós-carga

## Mapeamento legado → novo

| Origem | Destino | Tipo | Notas |
|---|---|---|---|
| legado.admin_users | admin_users | renomeação | snake_case, manter password_hash |
| legado.admin_sessions | admin_sessions | renomeação | |
| legado.licenciadas | licenciadas | renomeação + remoção | Remover locked_until, failed_login_attempts |
| legado.licenciada_devices | licenciada_devices | renomeação | |
| legado.alunas | alunas | renomeação | |
| legado.aluna_devices | aluna_devices | renomeação | |
| legado.aluna_course_access | aluna_course_access | renomeação | |
| legado.aluna_progress | aluna_progress | renomeação | |
| legado.lms_modules | lms_modules | renomeação | |
| legado.lms_lessons | lms_lessons | renomeação | |
| legado.lms_quizzes | lms_quizzes | renomeação | |
| legado.lms_quiz_attempts | lms_quiz_attempts | renomeação | |
| legado.lms_certificates | lms_certificates | renomeação | |
| legado.ai_clinical_cases | ai_clinical_cases | renomeação | |
| legado.ai_clinical_reviews | ai_clinical_reviews | renomeação | |
| legado.system_broadcasts | system_broadcasts | renomeação | |
| legado.system_broadcast_logs | system_broadcast_logs | renomeação | |
| legado.nexus_security_rules | nexus_security_rules | renomeação + remoção | Remover is_active |
| legado.auth_logs | auth_logs | renomeação | |
| legado.audit_logs | audit_logs | renomeação | |
| legado.leads | leads | renomeação | |
| legado.media_files | media_files | renomeação | |
| legado.faq | faq_entries | renomeação | |
| legado.resultados | results | renomeação | |
| legado.mentores | mentors | renomeação | |
| legado.licenciadas.lgpd_status | licenciadas.lgpd_status | preservado | Campo crítico para LGPD compliance |

## Transformações

### Transformação T-01: Remover locked_until e failed_login_attempts
- **Aplica em**: licenciadas, alunas
- **Regra**: colunas locked_until e failed_login_attempts são removidas. O controle de bloqueio passa a ser via auth_logs com consulta ao RateLimiter do Laravel
- **Tratamento de inválidos**: N/A — drop de colunas
- **Origem da regra**: BR-MIGRAR-002 (Laravel Rate Limiter substitui controle manual)

### Transformação T-02: Remover is_active de nexus_security_rules
- **Aplica em**: nexus_security_rules
- **Regra**: coluna is_active removida. A regra estar ativa ou não passa a ser controlada por expires_at
- **Tratamento de inválidos**: regras com is_active=0 mas sem expires_at são descartadas
- **Origem da regra**: BR-MIGRAR-032 (design simplificado)

### Transformação T-03: Normalizar target_roles para JSON
- **Aplica em**: system_broadcasts
- **Regra**: target_roles armazenado como JSON válido (MySQL 8.4 native JSON)
- **Tratamento de inválidos**: se JSON inválido, converter para array vazio
- **Origem da regra**: BR-MIGRAR-038

### Transformação T-04: Foto renomeada no filesystem
- **Aplica em**: licenciadas.photo_url
- **Regra**: fotos de licenciadas são copiadas do diretório legado para o novo, mantendo naming {id}_{name}_{cpf}.{ext}
- **Tratamento de inválidos**: se foto não existe, photo_url = null
- **Origem da regra**: BR-MIGRAR-015

## Estratégia de ETL

- **Ferramenta**: scripts SQL + PHP/Laravel custom (Tinker ou command)
- **Fluxo**:
  1. Dump do banco legado (mysqldump) com lock de leitura
  2. Import do dump em banco temporário (bodyharmony_staging) no mesmo MySQL
  3. Executar script de transformação (SQL + PHP) para criar registros no banco novo (bodyharmony_novo)
  4. Copiar arquivos de mídia do filesystem legado para o novo
  5. Verificação de qualidade (contagens, unicidade, checksums)
- **Idempotência**: o script de transformação usa TRUNCATE + INSERT, seguro para reexecução. O dump é preservado para nova tentativa

## Cutover de dados

> Ver também `cutover_plan.md`. Aqui apenas a parte específica de dados.

- **Janela**: a definir (após validação parallel run)
- **Sequência de corte**:
  1. Ativar maintenance mode no legado (congelar escritas)
  2. Executar mysqldump do banco legado
  3. Executar transformação e carga no banco novo
  4. Copiar mídia (fotos, uploads) do filesystem legado
  5. Verificar consistência
  6. Trocar DNS/Traefik para o novo
  7. Desativar maintenance mode (agora no novo sistema)
- **Verificação pós-corte**:
  - **Contagens**: comparar total de registros por tabela entre legado e novo
  - **Unicidade**: verificar que campos UNIQUE não têm duplicatas

## Validação de qualidade

| Métrica | Alvo | Fonte de medição |
|---|---|---|
| Contagem por entidade | igual ± 0% | SELECT COUNT(*) no legado vs novo |
| CPF únicos em licenciadas | 0 duplicatas | SELECT cpf, COUNT(*) FROM licenciadas GROUP BY cpf HAVING COUNT(*) > 1 |
| Integridade referencial | 0 órfãos | LEFT JOIN com NULL check nas FKs |
| LGPD consent preservado | 100% | SELECT lgpd_status FROM licenciadas comparado |

## Riscos específicos de dados
- **RISK-003**: perda/inconsistência de dados — mitigado pela verificação de contagens pós-carga e dump preservado para rollback
- **RISK-006**: LGPD consent não migrado — verificação explícita no script de transformação
