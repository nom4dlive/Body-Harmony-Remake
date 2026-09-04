# Requirements: Login de Aluna

> Identificador: `001-autenticacao-login-aluna`
> Confidência: 🟢 CONFIRMADO

## 1. Resumo executivo

Autenticação de alunas no portal de cursos avulsos, com token prefixado 'al_', controle de dispositivos e força de troca de senha no primeiro login.

## 2. Regras de negócio

1. **RN-01:** Aluna autentica com email + password_hash (bcrypt) 🟢
2. **RN-02:** Token de aluna deve começar com prefixo 'al_' 🟢
3. **RN-03:** `force_password_change` DEFAULT 1 — aluna nova precisa trocar senha 🟢
4. **RN-04:** Aprovação via Telegram (is_approved) — aluna não aprovada não loga 🟡

## 3. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite |
|----|-----------|------------|--------------------|
| RF-01 | Login com email + senha | Must | Aluna recebe token com prefixo 'al_' |
| RF-02 | Força de troca de senha | Must | force_password_change=true redireciona para troca |
| RF-03 | Controle de dispositivos | Should | FIFO por max_devices |

## 4. Critérios de Aceitação

```gherkin
Cenário: Login de aluna com sucesso
  Dado uma aluna com email "maria@email.com" e senha válida
  Quando enviar POST /v1/aluna/auth/login com {login, password}
  Então recebe {token, user} com status 200
  E o token começa com "al_"

Cenário: Primeiro login com troca de senha obrigatória
  Dado uma aluna recém-criada com force_password_change=true
  Quando enviar login com credenciais válidas
  Então recebe {token, user, force_password_change: true}
```
