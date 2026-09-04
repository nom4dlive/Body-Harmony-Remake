# Requirements: Login de Licenciada

> Identificador: `001-autenticacao-login-licenciada`
> Confidência: 🟢 CONFIRMADO

## 1. Resumo executivo

Autenticação de profissionais licenciadas no portal LMS, com suporte a CPF/email/username como login, device token para sessão persistente e bloqueio por excesso de tentativas.

## 2. Regras de negócio

1. **RN-01:** Login pode ser por CPF, email ou username 🟢
2. **RN-02:** Account lockout após 3 tentativas falhas por 15 min 🟢
3. **RN-03:** Máximo de dispositivos simultâneos controlado por licenciada.max_devices 🟢
4. **RN-04:** Device token opcional — se enviado, tenta reutilizar sessão existente 🟢
5. **RN-05:** Senha padrão 'Mudar123!' força troca no primeiro login 🟢

## 3. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite |
|----|-----------|------------|--------------------|
| RF-01 | Login com CPF/email/username + senha | Must | Licenciada autenticada recebe token |
| RF-02 | Device token reuse | Should | Mesmo fingerprint reusa mesmo token |
| RF-03 | Controle de dispositivos | Should | FIFO kick se exceder max_devices |

## 4. Critérios de Aceitação

```gherkin
Cenário: Login com CPF válido
  Dado uma licenciada com CPF "12345678901" e senha correta
  Quando enviar POST /v1/auth/login com {login: "12345678901", password: "senha"}
  Então recebe {token, user} com status 200

Cenário: Login com conta bloqueada
  Dado uma licenciada com 3 tentativas falhas nos últimos 15 min
  Quando tentar login novamente
  Então recebe {error, code: "account_locked"} com status 423

Cenário: Reuso de device token
  Dado uma licenciada com device existente e fingerprint compatível
  Quando enviar login com device_token existente
  Então o mesmo device_token é retornado
```
