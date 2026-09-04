# Edge Cases: Mídia (Media)

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

### EC-01: Upload de tipo MIME não permitido
- Entrada: Upload de arquivo .exe
- Comportamento esperado: Validação de whitelist rejeita, retorna 400 🟡

### EC-02: Upload de arquivo muito grande
- Entrada: Upload de arquivo > MAX_UPLOAD_SIZE
- Comportamento esperado: Validação de tamanho rejeita, retorna 400 🟡

### EC-03: Upload de arquivo duplicado
- Entrada: Upload do mesmo arquivo duas vezes
- Comportamento esperado: Hash duplicado detectado; pode retornar registro existente ou criar duplicata 🟡

### EC-04: Cleanup sem arquivos não utilizados
- Entrada: POST cleanup com todos os arquivos tendo access_count > 0
- Comportamento esperado: deleted_count = 0, sucesso 🟡

### EC-05: Cleanup por não-superadmin
- Entrada: POST cleanup por admin comum
- Comportamento esperado: 403 Forbidden 🟡

### EC-06: Listagem sem resultados
- Entrada: GET `/admin/media?category=inexistente`
- Comportamento esperado: Array vazio, total = 0 🟡

### EC-07: Upload sem arquivo
- Entrada: POST `/admin/media/upload` sem multipart file
- Comportamento esperado: 400 Bad Request 🟡
