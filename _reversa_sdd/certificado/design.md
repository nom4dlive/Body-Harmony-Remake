# Design: Certificado

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Interface

| Método | Caminho | Entrada | Saída | Status |
|--------|---------|---------|-------|--------|
| POST | `/api/v1/certificate/generate` | `{module_id}` | PDF download | 200, 400 |

## Entidade: lms_certificates

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | int | Sim | PK auto-increment |
| licenciada_id | int | Sim | FK para licenciada |
| module_id | int | Sim | FK para módulo LMS |
| hash_code | varchar | Sim | SHA-256(user_id + module_id + time + secret) |
| created_at | datetime | Sim | Data de emissão |

## Fluxo Principal: Gerar Certificado

1. Licenciada autenticada faz POST `/api/v1/certificate/generate` com `{module_id}` 🟢
2. `CertificateController::generate()` verifica se quiz do módulo foi aprovado (passed=1) 🟢
3. Se aprovado: calcula hash SHA-256(user_id + module_id + time + APP_SECRET) 🟢
4. Gera PDF via mPDF/SimplePDF com dados da licenciada e módulo 🟢
5. Insere registro em lms_certificates com hash_code 🟢
6. Download do PDF (streaming, Content-Type: application/pdf) 🟢

## Fluxos Alternativos

- **Quiz não aprovado:** Retorna erro 400, certificado não é emitido 🟢
- **Licenciada não matriculada no módulo:** Retorna erro 400 🟢
- **Certificado já emitido para o módulo:** Retorna erro, re-emissão não permitida 🟢

## Dependências

- Core: `Response.php`
- Biblioteca: `libs/SimplePDF.php` (mPDF wrapper)
- Tabelas: `lms_quiz_attempts`, `lms_certificates`

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Hash SHA-256 com secret do sistema | `CertificateController.php` | 🟢 |
| PDF gerado sob demanda (não pré-gerado) | `CertificateController.php` | 🟢 |
| Validação de aprovação antes da emissão | `CertificateController.php:45` | 🟢 |

## Riscos e Lacunas

- 🟡 Layout do PDF (template) não documentado — requer inspeção do template físico
- 🔴 Existe verificação de hash_code para validar certificados (consulta pública)? — requer inspeção de rotas
