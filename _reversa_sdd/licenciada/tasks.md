# Tasks: Licenciada

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabela `licenciadas` com todas as colunas (name, cpf, email, photo_url, etc.)
- [ ] Tabelas `licenciada_devices`, `lms_progress`, `system_broadcasts`, `system_broadcast_logs`
- [ ] AuthMiddleware operacional
- [ ] Diretório de upload configurado com permissão de escrita

## Tarefas

### T01: CRUD de licenciadas (store)
- **Arquivo legado:** `Controllers/LicenciadasController.php`
- **Descrição:** Implementar store() com validação de name, sanitização CPF/email, bcrypt hash (ou senha padrão Mudar123!), INSERT de 16+ colunas, tratamento MySQL 1062 para duplicidade
- **Critério de pronto:** Licenciada criada com dados validados; senão enviada usa padrão com force_password_change
- **Confidência:** 🟢 CONFIRMADO

### T02: Upload e renomeação de foto
- **Arquivo legado:** `Controllers/LicenciadasController.php`
- **Descrição:** Implementar handleUpload(file, id, nameContext, cpf) que valida MIME, renomeia para `{id}_{name}_{cpf}.{ext}`, salva no diretório de uploads, retorna URL pública
- **Critério de pronto:** Foto salva com nome padronizado; URL pública retornada
- **Confidência:** 🟢 CONFIRMADO

### T03: Update de licenciada com renomeação de foto
- **Arquivo legado:** `Controllers/LicenciadasController.php`
- **Descrição:** Implementar update(id, data) com mapeamento dinâmico de campos. Se name/CPF mudou, renomear foto no filesystem. SanitizeFilename remove acentos
- **Critério de pronto:** Apenas campos enviados alterados; foto renomeada se name/CPF mudar
- **Confidência:** 🟢 CONFIRMADO

### T04: Dashboard summary
- **Arquivo legado:** `licenciada/dashboard_summary.php`
- **Descrição:** Implementar dashboard-summary com token resolution multi-fallback (X-Device-Token → Authorization → $loggedUser). Calcular aulas iniciadas, concluídas, total_seconds, next lesson, unread broadcasts, featured resources
- **Critério de pronto:** Dashboard retorna métricas consolidadas da licenciada
- **Confidência:** 🟢 CONFIRMADO

### T05: Progresso global
- **Arquivo legado:** `licenciada/progress.php`
- **Descrição:** Implementar progress() calculando percentual global (total aulas ativas / concluídas * 100). Incluir V97 anomaly detection para zero progress
- **Critério de pronto:** Percentual calculado corretamente; anomalia detectada se progresso zerado
- **Confidência:** 🟢 CONFIRMADO

### T06: Gerenciamento de dispositivos (FIFO)
- **Arquivo legado:** `Controllers/LicenciadasController.php`
- **Descrição:** Implementar lógica FIFO: se active devices >= max_devices, desativar o mais antigo (is_active=0). Listar dispositivos por licenciada
- **Critério de pronto:** Dispositivo mais antigo desativado quando limite excedido; lista reflete dispositivos ativos
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Criar licenciada com todos os campos obrigatórios
- [ ] TT-02: Criar licenciada sem senha → hash padrão + force_password_change
- [ ] TT-03: Update com mudança de name → foto renomeada
- [ ] TT-04: Dashboard retorna métricas corretas
- [ ] TT-05: Progresso global calcula percentual corretamente

## Ordem Sugerida

1. T01 (store) + T02 (upload) — criação
2. T03 (update) — manutenção
3. T06 (devices) — controle
4. T04 (dashboard) + T05 (progress) — consultas

## Lacunas Pendentes (🔴)

- Limpeza de fotos órfãs ao deletar licenciada — não implementada no legado
- V97 anomaly detection: confirmar se é código de migração ou produção
