# Requirements: Licenciada

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

CRUD completo de licenciadas, dashboard com métricas de progresso educacional, gerenciamento de dispositivos e sessões, e visualização de aulas. Perfil central do ecossistema Body Harmony — liga admin, LMS e alunas.

## Responsabilidades

- CRUD de licenciadas com upload de foto, validação de unicidade (CPF, Email, WhatsApp)
- Dashboard com métricas: aulas iniciadas, concluídas, tempo total, próxima aula
- Progresso global (percentual de aulas ativas concluídas)
- Gerenciamento de dispositivos (FIFO, max_devices)
- Visualização de aulas com progresso individual

## Regras de Negócio

- Ao criar licenciada sem senha, usa hash padrão de `Mudar123!` e força troca no primeiro login 🟢
- CPF, Email e WhatsApp são únicos (tratamento de erro MySQL 1062) 🟢
- Foto é renomeada automaticamente para `{id}_{name}_{cpf}.{ext}` 🟢
- Se name ou CPF mudar no update, foto é renomeada no filesystem 🟢
- Progresso é global (total de aulas ativas no sistema) 🟢
- Máximo de dispositivos simultâneos controlado por max_devices (FIFO) 🟢
- Token resolvido por fallback: X-Device-Token → Authorization Bearer → $loggedUser 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Criar licenciada com foto | Must | Licenciada criada com dados + upload de foto renomeada |
| RF-02 | Atualizar licenciada (parcial) | Must | Apenas campos enviados são alterados; foto renomeada se name/CPF mudar |
| RF-03 | Listar licenciadas | Must | Retorna lista paginada com foto, status, última acesso |
| RF-04 | Dashboard com métricas | Must | Aulas iniciadas, concluídas, tempo total, next lesson |
| RF-05 | Progresso global percentual | Must | % de conclusão sobre total de aulas ativas |
| RF-06 | Gerenciar dispositivos (listar, remover) | Must | Dispositivos listados por licenciada; FIFO se exceder max_devices |
| RF-07 | Visualizar aulas da licenciada | Must | Aulas com progresso do módulo atual |
| RF-08 | Upload de foto com sanitização | Should | MIME type validado, nome sanitizado |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Dashboard usa cache do ResponseCache | `dashboard_summary.php` | 🟡 |
| Segurança | Token resolution com fallback multi-header | `dashboard_summary.php:20` | 🟢 |
| Disponibilidade | Tratamento de duplicidade com MySQL error 1062 | `LicenciadasController.php:199` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um admin criando licenciada sem senha
Quando formulário é submetido
Então senha padrão Mudar123! é hashada e force_password_change=1

Dado uma licenciada com foto existente
Quando name ou CPF são alterados no update
Então arquivo de foto é renomeado no filesystem

Dado uma licenciada autenticada
Quando acessa dashboard
Então vê métricas de progresso e próxima aula
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CRUD licenciada | Must | Cadastro é base do sistema |
| Dashboard | Must | Principal interface da licenciada |
| Progresso | Must | Métrica central de acompanhamento |
| Upload de foto | Should | Importante mas não bloqueia CRUD |
| Gerenciamento de dispositivos | Should | Controle de segurança |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/LicenciadasController.php` | `store`, `update`, `processRows`, `handleUpload` | 🟢 |
| `licenciada/dashboard_summary.php` | Dashboard metrics | 🟢 |
| `licenciada/progress.php` | Progresso global | 🟢 |
| `licenciada/lessons.php` | Aulas da licenciada | 🟢 |
