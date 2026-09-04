# Tasks: Mídia (Media)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabela `media_files` criada no MySQL com schema completo (id, file_name, file_type, file_size, media_category, width, height, hash, access_count, created_at)
- [ ] Diretório de upload configurado com permissão de escrita
- [ ] Core Response.php disponível

## Tarefas

### T01: Upload de arquivo com validação
- **Arquivo legado:** `Controllers/MediaController.php`
- **Descrição:** Implementar `upload()`: recebe multipart file, valida MIME type (whitelist), valida tamanho (MAX_UPLOAD_SIZE), gera hash, salva no filesystem, insere registro em media_files, retorna `{id, path}`.
- **Critério de pronto:** Upload de imagem válida retorna id e path; upload de tipo proibido retorna 400
- **Confidência:** 🟡 INFERIDO

### T02: Listagem com filtros e paginação
- **Arquivo legado:** `Controllers/MediaController.php`
- **Descrição:** Implementar `listFiles()`: consulta media_files com filtros opcionais (category, type, search textual), paginação (page, limit), ordenação por created_at DESC. Retorna `{files[], total, pagination}`.
- **Critério de pronto:** GET com filtro retorna apenas arquivos correspondentes; paginação funciona
- **Confidência:** 🟢 CONFIRMADO

### T03: Reportar não utilizados
- **Arquivo legado:** `Controllers/MediaController.php`
- **Descrição:** Implementar `reportUnused()`: SELECT * FROM media_files WHERE access_count = 0 ORDER BY created_at DESC.
- **Critério de pronto:** GET retorna array de arquivos com access_count = 0
- **Confidência:** 🟢 CONFIRMADO

### T04: Cleanup de arquivos órfãos
- **Arquivo legado:** `Controllers/MediaController.php`
- **Descrição:** Implementar `cleanup()`: verificar se usuário é superadmin. Se sim: deletar do disco arquivos com access_count = 0, deletar registros correspondentes de media_files, retornar `{deleted_count}`. Se não: 403.
- **Critério de pronto:** Superadmin executa e arquivos são removidos; admin comum recebe 403
- **Confidência:** 🟡 INFERIDO

## Tarefas de Teste

- [ ] TT-01: Testar upload com vários tipos MIME
- [ ] TT-02: Testar filtros e paginação na listagem
- [ ] TT-03: Testar cleanup como superadmin e admin comum

## Ordem Sugerida

1. T01 (upload) — funcionalidade principal
2. T02 (listagem) — gerenciamento
3. T03 (report) — diagnóstico
4. T04 (cleanup) — manutenção

## Lacunas Pendentes (🔴)

- MIME types permitidos na whitelist não documentados
- MAX_UPLOAD_SIZE não confirmado
- Diretório de armazenamento de arquivos não identificado
- Mecanismo de incremento de access_count não detalhado
