# Requirements: FAQ

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Gerenciamento de Perguntas Frequentes (FAQ) do sistema Body Harmony. Exibição pública com ordenação configurável e CRUD admin completo.

## Responsabilidades

- Listar FAQs públicas com ordenação definida por display_order
- CRUD de FAQs para admin (criar, editar, excluir)
- Ordenação configurável por display_order

## Regras de Negócio

- FAQs são ordenadas por display_order ASC, depois id ASC 🟢
- Rota de listagem é pública 🟢
- Rotas de administração exigem autenticação admin 🟢
- Question é campo obrigatório no cadastro 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar FAQs (GET público) | Must | Retorna array de FAQs ordenadas |
| RF-02 | Cadastrar FAQ (POST admin) | Must | Admin adiciona FAQ com pergunta e resposta |
| RF-03 | Atualizar FAQ (PUT admin) | Must | Admin altera pergunta, resposta ou ordem |
| RF-04 | Excluir FAQ (DELETE admin) | Should | Admin remove FAQ da listagem |
| RF-05 | Ordenação por display_order | Should | Admin define ordem de exibição |

## Critérios de Aceitação

```gherkin
Dado que um visitante acessa a página de FAQ
Quando a página carrega
Então exibe FAQs ordenadas por display_order

Dado que admin cadastra uma nova FAQ
Quando pergunta é fornecida
Então FAQ é salva e aparece na listagem pública

Dado que admin altera o display_order de uma FAQ
Quando salva a alteração
Então FAQ muda de posição na ordenação

Dado que admin exclui uma FAQ
Quando confirmada
Então FAQ não aparece mais na listagem
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Listar FAQs | Must | Exibição pública essencial |
| Cadastrar FAQ | Must | Admin precisa gerenciar |
| Atualizar FAQ | Must | Manutenção de conteúdo |
| Ordenação | Should | Controle de exibição |
| Excluir FAQ | Should | Limpeza de conteúdo |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/FaqController.php` | `getData`, `index`, `store`, `update`, `destroy` | 🟢 |
| `pages/Admin/FaqManager.jsx` | Frontend React | 🟢 |
