# 📜 Spec: Ecossistema de Fluxos Telegram V2
**Versão**: 3.1 (Nexus Era)
**Status**: Estável / Produção

## 1. Entrada: Chat Privado (Interface Principal)

### A. Fluxo de Ativação (/start)
1. **Trigger**: Usuário clica em 'Iniciar' ou envia `/start`.
2. **Resposta**: Mensagem polida (Humanizer V3) apresentando o ecossistema.
3. **Ação**: Exibição de botão fixo (Menu) e link para **Mini App**.

### B. Fluxo de Mini App (TWA)
1. **Trigger**: Usuário clica em "Portal Body Harmony".
2. **Interface**: Abre janela Web View (React) integrada ao Telegram.
3. **Escopo**: Cadastro, visualização de progresso e formulários complexos.

### C. Fluxo de Handoff Humano (Mecânica de Silêncio)
1. **Trigger**: Usuário via texto solicita "Falar com suporte" ou demonstra dúvida clínica.
2. **Lógica**:
   - Bot envia mensagem: "Entendido. Vou te conectar com nossa equipe clínica."
   - Bot entra em `States.silenced`.
   - Bot encaminha (Forward) a última mensagem para o `STAFF_GROUP_ID`.
3. **Resultado**: O bot para de responder automaticamente para não "atropelar" o atendimento humano.

---

## 2. Entrada: Grupos (Alunas / Licenciadas)

### A. Filtro de Segurança
- **Lógica**: O Bot ignora qualquer mensagem de texto que não comece com `/`.
- **Objetivo**: Evitar loops de mensagens e respostas robóticas em conversas coletivas.

### B. Comando de Diagnóstico (/id)
- **Ação**: Retorna o ID numérico do grupo e o ID do usuário solicitante.
- **Uso**: Configuração de variáveis de ambiente (.env) sem precisar de bots de terceiros.

---

## 3. Camada de Infraestrutura (Operations)

### A. Mecanismo de Execução
- **Modo**: Long Polling (via `aiogram 3.x`).
- **Resiliência**: Script `start-bot.sh` gerencia o reinício em caso de crash.
- **Proteção**: `ThrottlingMiddleware` bloqueia usuários que enviam mensagens muito rápidas (Flood).

### B. Conectividade
- **Backend API**: Todas as validações consultam `api.bodyharmony.com.br/v1` com Header de segurança `X-Bot-API-Key`.
- **Legacy Path**: Arquivos PHP antigos foram desativados para evitar conflitos de Webhook.

---

## 4. Próximos Passos Sugeridos
1. **Integração Webhook (Opcional)**: Migrar de Polling para Webhook se a demanda escalar > 100 req/s.
2. **Log de Auditoria**: Escrita de logs em `tracker/` cada vez que um Handoff for disparado.
