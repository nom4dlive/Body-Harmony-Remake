# Requirements: Conteúdo (Content)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

CRUD de mentores para o site público do Body Harmony. Gerencia o grid de mentores exibido na página inicial, com foto, biografia, cargo e link para Instagram.

## Responsabilidades

- Listar mentores cadastrados para exibição pública
- Cadastrar novo mentor com foto e dados de perfil
- Atualizar dados e foto de mentor existente
- Excluir mentor do catálogo público
- Upload e gerenciamento de foto do mentor

## Regras de Negócio

- Mentores são exibidos publicamente sem autenticação (rota GET pública) 🟢
- Upload de foto é parte obrigatória do cadastro (multipart form) 🟢
- CRUD completo gerenciado via admin autenticado 🟢
- Fotos e mídias armazenadas no banco de dados da VPS (MySQL) 🟢
- Upload de fotos validado por MIME type (jpeg, png) e limite de 2MB 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar mentores (GET público) | Must | Qualquer visitante pode ver a lista de mentores |
| RF-02 | Cadastrar mentor (POST autenticado) | Must | Admin cadastra mentor com nome, nickname, cargo, bio, foto, instagram |
| RF-03 | Atualizar mentor (PUT autenticado) | Must | Admin pode alterar qualquer campo do mentor |
| RF-04 | Excluir mentor (DELETE autenticado) | Should | Admin pode remover mentor do catálogo |
| RF-05 | Upload de foto no cadastro | Must | Foto é enviada como parte do formulário multipart |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Rotas de escrita exigem autenticação admin | `ContentController.php` | 🟡 |
| Performance | Rota GET pública sem cache identificado | `ContentController.php` | 🟡 |

## Critérios de Aceitação

```gherkin
Dado que um visitante acessa a página inicial
Quando a seção de mentores carrega
Então exibe a lista de mentores cadastrados com foto, nome e cargo

Dado que admin acessa o painel de conteúdo
Quando cadastra um novo mentor com foto
Então mentor aparece na listagem pública

Dado que admin atualiza os dados de um mentor
Quando altera nome e foto
Então as alterações refletem na página pública

Dado que admin exclui um mentor
Quando confirma a exclusão
Então mentor não aparece mais na listagem pública
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Listar mentores (GET) | Must | Exibição pública essencial |
| Cadastrar mentor | Must | Admin precisa adicionar mentores |
| Atualizar mentor | Must | Manutenção de dados |
| Excluir mentor | Should | Operação menos frequente |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/ContentController.php` | `getMentors`, `storeMentor`, `updateMentor`, `deleteMentor` | 🟢 |
