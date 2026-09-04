# Requirements: Resultados

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Galeria de resultados (antes/depois) do Body Harmony. Licenciadas visualizam resultados de transformação corporal; admin faz CRUD completo com suporte a pinned e categorias.

## Responsabilidades

- Listar resultados para licenciadas (com cache)
- CRUD de resultados para admin (store, update, destroy)
- Suporte a pinned (resultados fixados no topo)
- Categorização de resultados

## Regras de Negócio

- Resultados pinned (pinned=1) aparecem primeiro na ordenação 🟢
- Ordenação padrão: pinned DESC, date DESC 🟢
- Rota de listagem é pública (licenciadas via ResponseCache) 🟢
- Rotas de administração exigem autenticação admin 🟢
- Upload de imagens de resultados (before/after) é feito localmente via MediaController 🟢
- Campo image_url é normalizado: renomeado para 'image' na response pública 🟢
- mapped = (bool) na saída pública 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar resultados (GET público) | Must | Retorna array de resultados com pinned no topo |
| RF-02 | Cadastrar resultado (POST admin) | Must | Admin adiciona resultado com imagem, descrição, categoria |
| RF-03 | Atualizar resultado (PUT admin) | Must | Admin altera campos do resultado |
| RF-04 | Excluir resultado (DELETE admin) | Should | Admin remove resultado da galeria |
| RF-05 | Fixar resultado (pinned) | Should | Admin marca resultado como destaque |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Listagem usa ResponseCache (stale-while-revalidate) | `ResultController.php` (chamado via cache) | 🟡 |

## Critérios de Aceitação

```gherkin
Dado que uma licenciada acessa a galeria de resultados
Quando a página carrega
Então exibe resultados ordenados por pinned primeiro, depois por data

Dado que admin cadastra um novo resultado
Quando envia imagem e dados válidos
Então resultado aparece na galeria

Dado que admin fixa um resultado (pinned=1)
Quando atualiza o registro
Então resultado aparece no topo da galeria

Dado que admin exclui um resultado
Quando confirma a exclusão
Então resultado não aparece mais na galeria

Dado que a listagem de resultados é chamada
Quando image_url está presente
Então response pública usa campo 'image' em vez de 'image_url'
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Listar resultados | Must | Funcionalidade principal |
| CRUD admin | Must | Gerenciamento de conteúdo |
| Pinned | Should | Destaque visual |
| Exclusão | Should | Manutenção |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/ResultController.php` | `getData`, `index`, `store`, `update`, `destroy` | 🟢 |
| `pages/Results/ResultsGallery.jsx` | Frontend React | 🟢 |
