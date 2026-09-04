# Design: Leads

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/api/v1/leads` | — | `{leads[]}` | 200 |
| POST | `/api/v1/leads` | `{name, email, message, whatsapp}` | `{id}` | 201, 400 |
| PUT | `/api/v1/leads/:id` | `{status}` | `{success}` | 200, 400 |
| DELETE | `/api/v1/leads/:id` | — | `{success}` | 200, 404 |

## Entidade: leads

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | Sim | PK auto-increment |
| name | varchar | Sim | Nome do lead |
| whatsapp | varchar | Não | WhatsApp |
| email | varchar | Sim | Email |
| source | varchar | Não | Origem do lead |
| status | varchar | Sim | 'new', 'contacted', 'converted', 'closed' |
| created_at | datetime | Sim | Data de criação |

## Fluxo Principal: Captura de Lead

1. Visitante preenche formulário com `{name, email, message, whatsapp}` 🟢
2. POST `/api/v1/leads` (público, sem autenticação) 🟢
3. Sanitização: FILTER_SANITIZE_EMAIL no email, strip_tags em name/message, preg_replace no whatsapp 🟢
4. Salva na tabela `leads` com status = 'new' 🟢
5. Notificação automática enviada para contato@bodyharmony.com.br ao capturar novo lead 🟢
6. Retorna `{id}` do lead criado 🟢

## Fluxo Principal: Listagem de Leads

1. Admin autenticado faz GET `/api/v1/leads` 🟢
2. `LeadController::index()` consulta tabela `leads` ordenada por created_at DESC 🟢
3. Retorna `{leads: [...]}` 🟢

## Dependências

- Core: `Response.php`

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Sanitização com filtros nativos PHP | `LeadController.php:27` | 🟢 |
| Status inicial 'new' | `LeadController.php:37` | 🟢 |

## Riscos e Lacunas

- 🟡 Existe rate limiting na rota pública de store?
