# Requirements: Portal da Aluna

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Portal individual da aluna no Body Harmony: autenticação própria (token prefixado `al_`), visualização de módulos LMS com progresso, catalog de cursos disponíveis, salvamento de progresso por aula, e emissão de certificados.

## Responsabilidades

- Autenticação exclusiva de alunas via `AlunaAuthController` com token `al_`
- Listagem de módulos com progresso e acesso via `aluna_course_access`
- Catalog de todos os módulos disponíveis com flag `has_access`
- Salvamento de progresso (UPSERT) por aula
- Geração de URLs assinadas para vídeo (HMAC 1h)
- Emissão de certificados ao completar módulo

## Regras de Negócio

- Aluna só vê módulos que tem acesso via `aluna_course_access` (com expiração) 🟢
- Certificado só é emitido se 100% das aulas do módulo estão concluídas 🟢
- URL de vídeo é assinada HMAC com validade de 1 hora 🟢
- Token de aluna começa com prefixo `al_` 🟢
- Progresso usa UPSERT: se registro existe → UPDATE; se não → INSERT 🟢
- Acesso a módulo pode expirar (campo `expires_at` em `aluna_course_access`) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Login aluna com token `al_` | Must | Login retorna token iniciando com `al_` |
| RF-02 | Listar módulos com progresso | Must | Retorna módulos com total_lessons, completed_lessons, percent |
| RF-03 | Catalog de módulos disponíveis | Must | Todos módulos ativos com boolean has_access |
| RF-04 | Salvar progresso por aula | Must | UPSERT em aluna_progress |
| RF-05 | URL assinada para vídeo | Must | URL HMAC válida por 1h |
| RF-06 | Emissão de certificado | Should | Certificado gerado se 100% concluído |
| RF-07 | Middleware guardAluna | Must | Rota aluna requer token `al_` válido |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Token aluna prefixado para distinguir de outros perfis | `AlunaAuthController.php:162` | 🟢 |
| Performance | Módulos cacheados via ResponseCache | `AlunaLmsController.php:cache` | 🟡 |

## Critérios de Aceitação

```gherkin
Dado uma aluna autenticada com token `al_`
Quando acessa GET /aluna/modules
Então retorna lista de módulos com progresso percentual

Dado uma aluna sem acesso a um módulo
Quando tenta acessar aulas do módulo
Então recebe 403 Forbidden

Dado uma aluna com 100% das aulas concluídas
Quando solicita certificado
Então certificado é emitido com hash_code único
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Login aluna | Must | Pré-condição para todo o portal |
| Listar módulos | Must | Funcionalidade principal |
| Salvar progresso | Must | Core do LMS |
| Certificado | Should | Depende de progresso completo |
| Catalog | Could | Apenas descoberta de cursos |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/AlunaAuthController.php` | `loginAluna` | 🟢 |
| `Controllers/AlunaLmsController.php` | `guardAluna`, `modules`, `catalog`, `saveProgress`, `signUrl`, `certificate` | 🟢 |
| `Controllers/AdminAlunaController.php` | Gerenciamento admin de alunas | 🟢 |
