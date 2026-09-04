# Spec: Bot de Suporte Telegram — Body Harmony

## Visão Geral
Este documento especifica o microserviço Python (aiogram 3.x) que servirá como bot de suporte no Telegram para as licenciadas e alunas do Body Harmony. O bot atua estritamente como um cliente da API PHP (Nexus Protocol V3.1) existente, não contendo lógica complexa de negócios dentro de si (zero reinvenção).

## Configuração e Integrações
- **Framework do Bot**: `aiogram` 3.x (Python).
- **Variáveis de Ambiente**:
  - `TELEGRAM_BOT_TOKEN`: Token provido pelo `@BotFather`.
  - `API_BASE_URL`: Endereço da API do Body Harmony (`https://api.bodyharmony.com.br/v1`).
  - `BOT_API_KEY`: Chave estática passada via header `X-Bot-API-Key` para autenticação bypass (limitada).

## Fluxos e Comandos

### 1. Comando `/start`
- **Foco**: Binding de Contas (Telegram ↔ Backend).
- **Sistemática**: O bot irá solicitar CPF ou e-mail. Através do backend, procurará a usuária.
- **Integração API (PHP)**: 
  - `GET /v1/licenciadas?cpf={cpf}` (para achar ID)
  - `PUT /v1/licenciadas/{id}` definindo `telegram_user_id` na conta.

### 2. Comando `/novasenha`
- **Foco**: Geração e entrega temporária de credenciais.
- **Sistemática**: Invoca admin trigger no backend, que já lida com random strings, logging e `force_password_change`.
- **Integração API (PHP)**: 
  - `POST /v1/admin/licenciadas/{id}/reset-password`
- **Resposta Bot**: Envia o password retornado, lembra a usuária que será preciso mudar ao logar.

### 3. Comando `/verificarcadastro`
- **Foco**: Status de Completude.
- **Integração API (PHP)**: 
  - `GET /v1/licenciadas/{id}`
- **Resposta Bot**: Lê chaves nulas (status civil, whatsapp, instagram, etc.) e formata um relatório de campos ausentes para a usuária.

### 4. Comando `/atualizar`
- **Foco**: Input FSM (Máquina de Estados Finita).
- **Sistemática**: O aiogram entra em estado particular questionando itens listados no `/verificarcadastro`.
- **Ações**: 
  - Captura valores via chat de forma estrita. Ex: Whatsapp regex `^\d{10,11}$`.
- **Integração API (PHP)**: Deste payload consolidado, dispara `PUT /v1/licenciadas/{id}`.

### 5. Comando `/testarlogin`
- **Foco**: Auditoria empática de acesso (reduzir overhead web).
- **Integração API (PHP)**: 
  - `POST /v1/auth/licenciada/login` enviando JSON normal (cpf e senha providos na FSM).
- **Sistemática**: Se o backend responder HTTP 401 com code `ACCOUNT_LOCKED`, o bot avisa o cliente. Se der OK, valida a saúde do acesso.

## Matriz de Segurança
- Identificação da usuária se dará primariamente baseada no seu `telegram_user_id` após o primeiro bind via `/start`. Isso previne falsificações por ID alheios.
- CPFs, senhas e informações de conta trafegam de forma segura em SSL/TLS.
- Logs e registros em `nexus_system.log` devem preservar os IDs do telegram que executou a ação.
