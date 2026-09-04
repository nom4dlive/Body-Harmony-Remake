# Requirements: Certificado

> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Visão Geral

Geração de certificados PDF personalizados para licenciadas que concluem módulos do LMS com aprovação no quiz. Utiliza a biblioteca mPDF para renderização e SHA-256 para hash de autenticidade.

## Responsabilidades

- Gerar certificado PDF após aprovação em quiz
- Validar se licenciada foi aprovada (passed=1) antes de emitir
- Gerar hash único do certificado (SHA-256)
- Armazenar registro do certificado emitido em lms_certificates

## Regras de Negócio

- Só gera certificado se quiz foi aprovado (passed=1) 🟢
- Hash do certificado é SHA-256(user_id + module_id + time + secret) 🟢
- Certificado é baixado como PDF (não armazenado como arquivo) 🟢
- Cada módulo gera certificado apenas uma vez por licenciada (re-emissão bloqueada) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Gerar certificado PDF (POST licenciada) | Must | Licenciada aprovada baixa PDF do certificado |
| RF-02 | Validar aprovação no quiz | Must | Se quiz não aprovado, certificado não é emitido |
| RF-03 | Hash único por certificado | Must | Cada certificado tem hash SHA-256 único |
| RF-04 | Registrar certificado emitido | Must | Registro em lms_certificates com hash e data |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Hash SHA-256 com secret do sistema | `CertificateController.php` | 🟢 |
| Performance | PDF gerado sob demanda (streaming) | `CertificateController.php` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que uma licenciada concluiu um módulo com quiz aprovado
Quando solicita o certificado
Então PDF é gerado e baixado com hash único

Dado que uma licenciada não aprovou o quiz
Quando solicita o certificado
Então retorna erro informando que quiz não foi aprovado

Dado que uma licenciada gera o certificado
Quando o PDF é emitido
Então registro é criado em lms_certificates com hash_code
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Gerar certificado PDF | Must | Funcionalidade principal |
| Validar aprovação | Must | Integridade acadêmica |
| Hash único | Must | Autenticidade do certificado |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `Controllers/CertificateController.php` | `generate` | 🟢 |
| `libs/SimplePDF.php` | Biblioteca de geração PDF | 🟢 |
