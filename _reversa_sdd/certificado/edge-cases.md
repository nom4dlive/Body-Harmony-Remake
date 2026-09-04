# Edge Cases: Certificado

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

### EC-01: Quiz não aprovado
- Entrada: POST generate com module_id cujo quiz teve passed=0
- Comportamento esperado: Erro 400, certificado não emitido 🟢
- Código: `CertificateController.php:45`

### EC-02: Módulo sem quiz
- Entrada: POST generate para módulo sem quiz cadastrado
- Comportamento esperado: Erro 400 (sem quiz_attempt para verificar) 🟡

### EC-03: Licenciada não matriculada no módulo
- Entrada: POST generate para módulo sem aluna_course_access
- Comportamento esperado: Erro 400 🟡

### EC-04: Certificado já emitido anteriormente
- Entrada: POST generate para módulo que já gerou certificado
- Comportamento esperado: Pode re-gerar ou retornar existente (comportamento não confirmado) 🔴

### EC-05: APP_SECRET ausente
- Entrada: Geração sem APP_SECRET configurado
- Comportamento esperado: Hash usa string vazia ou falha 🟡

### EC-06: Falha na geração do PDF
- Entrada: Biblioteca mPDF indisponível ou erro de template
- Comportamento esperado: Rollback do registro, retorno de erro 500 🟡
