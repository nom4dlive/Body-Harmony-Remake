# Edge Cases: Leads

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

### EC-01: Email inválido
- Entrada: POST com email "invalido"
- Comportamento esperado: FILTER_SANITIZE_EMAIL remove caracteres inválidos ou salva sanitizado 🟢
- Código: `LeadController.php:27`

### EC-02: WhatsApp com caracteres especiais
- Entrada: POST com whatsapp "(11) 99999-8888"
- Comportamento esperado: preg_replace remove não-dígitos, salva "11999998888" 🟢
- Código: `LeadController.php:27`

### EC-03: XSS injection no nome
- Entrada: POST com name `<script>alert('xss')</script>João`
- Comportamento esperado: strip_tags remove script, salva "João" 🟢
- Código: `LeadController.php:27`

### EC-04: Lead duplicado (mesmo email)
- Entrada: POST com email já existente
- Comportamento esperado: Insere novo lead (sem constraint UNIQUE em email) 🟡

### EC-05: Atualizar lead inexistente
- Entrada: PUT `/leads/99999` com novo status
- Comportamento esperado: 404 ou 200 sem alterações 🟡

### EC-06: Listagem vazia
- Entrada: GET `/leads` sem leads cadastrados
- Comportamento esperado: Array vazio, status 200 🟡
