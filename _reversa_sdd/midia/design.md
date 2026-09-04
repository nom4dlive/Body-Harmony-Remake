# Design: Mídia (Media)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| GET | `/admin/media` | `?category=&type=&search=&page=&limit=` | `{files[], total, pagination}` | 200 |
| POST | `/admin/media/upload` | Multipart file | `{id, path}` | 201, 400 |
| GET | `/admin/media/unused` | — | `{unused[]}` | 200 |
| POST | `/admin/media/cleanup` | — | `{deleted_count}` | 200, 403 |

## Entidade: media_files

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | Sim | PK auto-increment |
| file_name | varchar | Sim | Nome original do arquivo |
| file_type | varchar | Sim | MIME type |
| file_size | int | Sim | Tamanho em bytes |
| media_category | varchar | Não | Categoria (ex: fotos, documentos) |
| width | int | Não | Largura (se imagem) |
| height | int | Não | Altura (se imagem) |
| hash | varchar | Sim | Hash do arquivo (duplicate detection) |
| access_count | int | Sim | Contador de acessos |
| created_at | datetime | Sim | Data de upload |

## Fluxo Principal: Upload

1. Admin autenticado faz POST `/admin/media/upload` com multipart file 🟢
2. `MediaController::upload()` valida MIME type contra whitelist (mp3, mp4, pdf) 🟢
3. Valida file_size contra MAX_UPLOAD_SIZE (1000 MB) 🟢
4. Gera hash do arquivo para detecção de duplicatas 🟢
5. Salva arquivo no filesystem e registro em media_files 🟢
6. Retorna `{id, path}` 🟢

## Fluxo Principal: Listagem

1. GET `/admin/media` com parâmetros opcionais de filtro 🟢
2. `MediaController::listFiles()` aplica filtros (category, type, search) 🟢
3. Paginação com page e limit 🟢
4. Retorna `{files[], total, pagination}` 🟢

## Fluxo Principal: Cleanup

1. Superadmin autenticado faz POST `/admin/media/cleanup` 🟡
2. `MediaController::cleanup()` verifica permissão superadmin 🟡
3. Deleta arquivos com access_count = 0 do disco e banco 🟢
4. Retorna `{deleted_count}` 🟢

## Dependências

- Core: `Response.php`
- Filesystem: diretório de upload configurável na VPS (armazenamento local)

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Hash de arquivo para detecção de duplicatas | `media_files.hash` | 🟢 |
| Controle de acesso por access_count | `media_files.access_count` | 🟢 |
| Categorização por media_category | `media_files.media_category` | 🟢 |

## Riscos e Lacunas

- 🟡 Verificação de superadmin para cleanup não confirmada no código-fonte
- 🟡 Existe limpeza automática programada (cron)?
