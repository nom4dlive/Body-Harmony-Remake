# Requirements: Leads

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Captura e gerenciamento de leads do site público do Body Harmony. Visitantes preenchem formulário de contato e os leads são armazenados para acompanhamento comercial.

## Responsabilidades

- Capturar leads do formulário público de contato
- Listar leads para administração
- Atualizar status do lead (ex: new, contacted, converted)
- Excluir leads do sistema
- Sanitização de dados de entrada (email, whatsapp, HTML)

## Regras de Negócio

- Sanitização obrigatória: FILTER_SANITIZE_EMAIL, strip_tags em todos os campos de texto, preg_replace no whatsapp 🟢
- Status inicial do lead é 'new' 🟢
- Transições de status válidas: new → contacted → converted → closed 🟢
- Rota de store (captura) é pública (sem autenticação) 🟢
- Rotas de listagem, atualização e exclusão exigem autenticação admin 🟢
- Novo lead dispara notificação automática para contato@bodyharmony.com.br 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Capturar lead (POST público) | Must | Visitante preenche formulário e lead é salvo com status 'new' |
| RF-02 | Listar leads (GET admin) | Must | Admin visualiza todos os leads cadastrados |
| RF-03 | Atualizar lead (PUT admin) | Should | Admin altera status do lead |
| RF-04 | Excluir lead (DELETE admin) | Could | Admin remove lead do sistema |
| RF-05 | Sanitização de entrada | Must | Dados são limpos contra XSS e injeção |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Sanitização de email com FILTER_SANITIZE_EMAIL | `LeadController.php:27` | 🟢 |
| Segurança | strip_tags em campos de texto | `LeadController.php:27` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que um visitante preenche o formulário de contato
Quando envia com email, nome e whatsapp válidos
Então lead é salvo com status 'new'

Dado que admin acessa a listagem de leads
Quando a página carrega
Então exibe todos os leads com nome, email, whatsapp, source e status

Dado que admin atualiza o status de um lead
Quando altera de 'new' para 'contacted'
Então o status reflete na listagem

Dado que um visitante envia HTML malicioso no campo nome
Quando o formulário é processado
Então tags HTML são removidas (strip_tags)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Captura de lead | Must | Função principal do módulo |
| Sanitização | Must | Segurança contra injeção |
| Listagem de leads | Must | Admin precisa visualizar |
| Atualização de status | Should | Acompanhamento comercial |
| Exclusão de lead | Could | LGPD e limpeza |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/LeadController.php` | `index`, `store`, `update`, `destroy` | 🟢 |
