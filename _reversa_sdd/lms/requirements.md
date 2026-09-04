# Requirements: LMS (Learning Management System)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Sistema completo de ensino à distância: módulos, aulas, quizzes, certificados, biblioteca de recursos e progressão bloqueada entre módulos. Atende licenciadas (alunas do curso) e admin (gestão de conteúdo). Os dados de progresso deste módulo alimentam dashboards e certificados.

## Responsabilidades

- Gerenciamento de módulos (CRUD + reorder)
- Gerenciamento de aulas (CRUD + vídeo upload + HLS + reorder + attachments)
- Sistema de quizzes com questões e opções (CRUD + tentativas + correção)
- Progressão bloqueada: módulo N+1 só desbloqueia se quiz do módulo N foi aprovado
- Biblioteca de recursos com controle de acesso por licenciada
- Geração de URLs assinadas para streaming/download
- Certificados ao completar módulo com quiz aprovado

## Regras de Negócio

- Módulo N+1 bloqueado se módulo N tem quiz não aprovado (Strict Progression Lock) 🟢
- Certificado só emitido se quiz foi passed (score >= min_score) 🟢
- Cache de módulos invalidado ao salvar progresso 🟢
- Quizzes embaralham questões e opções na tentativa 🟢
- min_score padrão: 70 🟢
- Transação atômica no CRUD de quiz (deleta questões antigas, reinsere novas) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar módulos com progresso do aluno | Must | Módulos com lessons, progress_percent, is_completed |
| RF-02 | Aulas de um módulo com progression check | Must | Módulo bloqueado retorna locked: true |
| RF-03 | Salvar progresso de aula (UPSERT) | Must | Progresso atualizado; cache invalidado |
| RF-04 | CRUD de módulos (admin) | Must | Criar, ler, atualizar, deletar, reordenar |
| RF-05 | CRUD de aulas (admin) | Must | Aulas com vídeo, thumbnail, HLS, attachments |
| RF-06 | Sistema de quiz com tentativas | Must | Questões embaralhadas, correção automática |
| RF-07 | Biblioteca de recursos | Should | Recursos com signed URLs e controle de acesso |
| RF-08 | Certificado com validação de quiz aprovado | Should | Só emite se passed=1 |
| RF-09 | Dashboard LMS (admin) | Should | Métricas agregadas (alunos ativos, horas, conclusão) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Módulos cacheados (300s, privado) | `LmsController.php:cache` | 🟢 |
| Performance | Signed URLs com HMAC SHA-256, TTL 15min-1h | `LmsController.php:signUrl` | 🟢 |
| Segurança | Strict Progression Lock com fallback silencioso | `LmsController.php:90` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma licenciada autenticada
Quando acessa GET /lms/modules
Então retorna módulos com progresso e locked status

Dado um quiz com min_score=70
Quando licenciada submete respostas com score=85
Então passed=1 e certificado pode ser emitido

Dado que módulo N tem quiz não aprovado
Quando licenciada tenta acessar módulo N+1
Então locked=true + locked_reason
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Módulos, aulas, progresso | Must | Core do LMS |
| Quizzes e correção | Must | Avaliação obrigatória |
| Progression Lock | Must | Regra de negócio central |
| Certificados | Should | Depende de quiz aprovado |
| Biblioteca de recursos | Should | Funcionalidade de apoio |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/LmsController.php` | `index`, `lessons`, `saveProgress`, `resources`, `signUrl` | 🟢 |
| `Controllers/AdminLmsController.php` | `dashboard`, `indexData`, CRUD módulos/aulas | 🟢 |
| `Controllers/QuizController.php` | `getAdminQuiz`, `saveQuiz`, quiz attempts/correction | 🟢 |
| `libs/ResourceService.php` | Signed URLs, resource access | 🟢 |
