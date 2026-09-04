# Tasks: Leads

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabela `leads` criada no MySQL com schema: id, name, whatsapp, email, source, status, created_at
- [ ] Core Response.php disponível

## Tarefas

### T01: Captura de lead com sanitização
- **Arquivo legado:** `Controllers/LeadController.php`
- **Descrição:** Implementar `store()`: recebe POST `{name, email, message, whatsapp}`, sanitiza com FILTER_SANITIZE_EMAIL + strip_tags + preg_replace whatsapp, salva com status 'new', retorna id. Rota pública.
- **Critério de pronto:** POST com dados válidos retorna `{id}` e lead no banco com status 'new'; HTML injection é removida
- **Confidência:** 🟢 CONFIRMADO

### T02: Listar leads
- **Arquivo legado:** `Controllers/LeadController.php`
- **Descrição:** Implementar `index()`: consulta todos os leads ordenados por created_at DESC, retorna JSON array. Rota admin.
- **Critério de pronto:** GET retorna `{leads: [...]}` com dados completos
- **Confidência:** 🟢 CONFIRMADO

### T03: Atualizar lead
- **Arquivo legado:** `Controllers/LeadController.php`
- **Descrição:** Implementar `update(id, {status})`: atualiza status do lead. Rota admin.
- **Critério de pronto:** PUT com status retorna `{success}` e alteração persiste
- **Confidência:** 🟢 CONFIRMADO

### T04: Excluir lead
- **Arquivo legado:** `Controllers/LeadController.php`
- **Descrição:** Implementar `destroy(id)`: deleta lead do banco. Rota admin.
- **Critério de pronto:** DELETE retorna `{success}` e lead não existe mais
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Testar captura com dados válidos
- [ ] TT-02: Testar sanitização (XSS, email inválido)
- [ ] TT-03: Testar CRUD de leads

## Ordem Sugerida

1. T01 (store) — funcionalidade principal
2. T02 (index) — listagem
3. T03 (update) — gestão
4. T04 (destroy) — exclusão

## Lacunas Pendentes (🔴)

- Transições de status válidas não documentadas
- Rate limiting na rota pública de store não verificado
