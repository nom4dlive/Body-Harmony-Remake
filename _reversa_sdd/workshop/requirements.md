# Requirements: Workshop

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Landing page promocional do Workshop de Eletroestimulação do Body Harmony. Página pública com informações sobre o curso, demonstração visual, benefícios e CTA para compra/inscrição. Não possui backend próprio — é uma página estática React com rota própria.

## Responsabilidades

- Exibir informações sobre o workshop (título, descrição, highlights)
- Mostrar demonstração visual do equipamento/resultados
- Listar benefícios e diferenciais do workshop
- CTA para compra/inscrição com link externo
- SEO head com meta tags apropriadas

## Regras de Negócio

- Página pública, sem autenticação necessária 🟢
- Conteúdo estático (sem gerenciamento via admin) 🟢
- Rota `/workshop` no React Router 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Exibir página do workshop | Must | Rota `/workshop` renderiza landing page completa |
| RF-02 | SEO Head | Must | Meta tags title e description para SEO |
| RF-03 | Seção de highlights | Must | Exibe diferenciais do workshop |
| RF-04 | CTA para inscrição | Must | Botão/link para página de compra/inscrição |
| RF-05 | Demonstração visual | Should | Imagem/vídeo demonstrativo do workshop |

## Critérios de Aceitação

```gherkin
Dado que um visitante acessa /workshop
Quando a página carrega
Então exibe título, highlights, demonstração e CTA

Dado que um visitante clica no CTA
Quando redirecionado
Então vai para página de inscrição/compra

Dado que a página é indexada por mecanismos de busca
Quando carrega
Então meta tags de SEO estão presentes (title, description)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Página do workshop | Must | Landing page essencial |
| SEO Head | Must | Indexação em buscadores |
| Highlights | Must | Conversão de visitantes |
| CTA | Must | Ação principal desejada |
| Demonstração visual | Should | Reforço visual do produto |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `pages/Workshop/Workshop.jsx` | `Workshop` (React component) | 🟢 |
| `App.jsx:139` | Route `/workshop` | 🟢 |
