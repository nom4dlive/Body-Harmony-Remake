# Requirements: Mídia (Media)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Gerenciador de mídia do Body Harmony: upload, listagem avançada com filtros, categorização e limpeza de arquivos não utilizados. Opera como repositório central de imagens e arquivos do sistema.

## Responsabilidades

- Upload de arquivos com validação de tipo MIME e tamanho
- Listagem avançada de arquivos com filtros, paginação e busca
- Categorização de mídia por categoria
- Reportar arquivos não utilizados
- Limpeza (cleanup) de arquivos órfãos (superadmin apenas)

## Regras de Negócio

- Upload validado por MIME type whitelist (mp3, mp4, pdf) 🟢
- Upload validado por MAX_UPLOAD_SIZE (1000 MB) 🟢
- Apenas superadmin pode executar cleanup 🟡
- Arquivos têm hash para detecção de duplicatas 🟢
- Listagem suporta filtros avançados (categoria, tipo, data) 🟢
- track de access_count para identificar arquivos não utilizados 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Upload de arquivo (POST admin) | Must | Admin faz upload com validação de tipo e tamanho |
| RF-02 | Listar arquivos (GET admin) | Must | Listagem com filtros, paginação e busca |
| RF-03 | Reportar não utilizados (GET admin) | Should | Lista arquivos com access_count = 0 |
| RF-04 | Cleanup (POST superadmin) | Could | Remove arquivos não utilizados do disco e banco |
| RF-05 | Categorizar mídia | Should | Admin define categoria no upload |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | MIME type whitelist (mp3, mp4, pdf) no upload | `MediaController.php` | 🟢 |
| Segurança | Limite de tamanho (MAX_UPLOAD_SIZE=1000MB) | `MediaController.php` | 🟢 |
| Segurança | Cleanup restrito a superadmin | `media/cleanup` | 🟡 |

## Critérios de Aceitação

```gherkin
Dado que admin faz upload de uma imagem
Quando arquivo tem MIME type permitido e tamanho dentro do limite
Então arquivo é salvo e registro criado em media_files

Dado que admin lista arquivos de mídia
Quando aplica filtro por categoria
Então retorna apenas arquivos da categoria selecionada

Dado que superadmin executa cleanup
Quando existem arquivos não utilizados
Então arquivos são removidos do disco e do banco

Dado que admin tenta executar cleanup
Quando não é superadmin
Então operação é bloqueada
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Upload | Must | Funcionalidade principal |
| Listagem | Must | Gerenciamento de mídia |
| Reportar não utilizados | Should | Identificação de resíduos |
| Cleanup | Could | Operação manual de limpeza |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/MediaController.php` | `listFiles`, `upload`, `reportUnused`, `cleanup` | 🟢 |
