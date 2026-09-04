# Tasks: Certificado

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Pré-requisitos

- [ ] Tabela `lms_certificates` criada no MySQL (id, licenciada_id, module_id, hash_code, created_at)
- [ ] Tabela `lms_quiz_attempts` com campo passed disponível para validação
- [ ] Biblioteca mPDF ou SimplePDF disponível
- [ ] APP_SECRET configurado em variável de ambiente

## Tarefas

### T01: Validar aprovação no quiz
- **Arquivo legado:** `Controllers/CertificateController.php`
- **Descrição:** Implementar verificação se licenciada foi aprovada no quiz do módulo (passed=1 em lms_quiz_attempts). Se não aprovada, retornar erro 400.
- **Critério de pronto:** Licenciada sem passed=1 recebe erro ao tentar gerar certificado
- **Confidência:** 🟢 CONFIRMADO

### T02: Gerar hash do certificado
- **Arquivo legado:** `Controllers/CertificateController.php`
- **Descrição:** Calcular SHA-256(licenciada_id + module_id + timestamp + APP_SECRET). Hash único por certificado.
- **Critério de pronto:** Hash é string hex de 64 caracteres, único para cada combinação
- **Confidência:** 🟢 CONFIRMADO

### T03: Gerar PDF do certificado
- **Arquivo legado:** `Controllers/CertificateController.php`, `libs/SimplePDF.php`
- **Descrição:** Implementar geração do PDF com layout do certificado (dados da licenciada, módulo, data, hash_code). Usar mPDF ou SimplePDF. Download via streaming HTTP.
- **Critério de pronto:** PDF é gerado com dados corretos e baixável
- **Confidência:** 🟡 INFERIDO

### T04: Registrar certificado emitido
- **Arquivo legado:** `Controllers/CertificateController.php`
- **Descrição:** INSERT em lms_certificates com licenciada_id, module_id, hash_code, created_at. Rollback se PDF falhar.
- **Critério de pronto:** Registro criado na tabela após PDF gerado com sucesso
- **Confidência:** 🟢 CONFIRMADO

## Tarefas de Teste

- [ ] TT-01: Testar emissão com quiz aprovado
- [ ] TT-02: Testar bloqueio com quiz não aprovado
- [ ] TT-03: Testar unicidade do hash

## Ordem Sugerida

1. T01 (validação) — pré-condição
2. T02 (hash) — dependência do registro
3. T04 (registro) — antes da geração física
4. T03 (PDF) — saída final

## Lacunas Pendentes (🔴)

- Template/layout do PDF não documentado
- Comportamento em caso de certificado já emitido para o mesmo módulo
- Validação pública de hash_code (verificação de autenticidade)
