---
name: bodyharmony-hostinger-vps
description: Gerenciamento da infraestrutura de VPS dedicada do ecossistema Body Harmony (Nexus V3.1) na Hostinger. Controla deploys Docker, regras de firewall, monitoramento de métricas e chaves SSH seguras.
allowed-tools: Read, Write, Edit, Command
metadata:
  version: "3.1"
  priority: CRITICAL
---

# Body Harmony VPS & Docker Manager (Hostinger VPS API)

Esta skill define as operações de infraestrutura e segurança da **VPS Dedicada Body Harmony (IP: 2.25.156.25)** gerenciada sob containers Docker Compose e gateway de proxy reverso Traefik, respeitando estritamente a Constituição Nexus Era V3.1.

## 🏛️ Diretrizes Constitucionais Críticas (Regra 2)

> [!CAUTION]
> **1. Proteção de Chaves e Credenciais:**
> É expressamente proibido expor, ler ou comitar chaves SSH privadas locais (`openspec/tracker/Hostinger_VPS/id_ed25519`) ou arquivos de senhas no controle de versão. Mantenha o [.gitignore](file:///f:/Body-Harmony-Remake/.gitignore) sempre blindado.
>
> **2. Espaço Negativo do Banco de Dados:**
> O container `bodyharmony-db` deve manter a restrição de loopback local (`127.0.0.1:3306`). Nunca configure o firewall ou o Docker Compose para expor a porta MySQL `3306` para a WAN de forma desprotegida.

---

## ⚙️ Core Concepts da Infraestrutura

- **VPS Unificada:** IP `2.25.156.25`, rodando Ubuntu com Docker Engine e Docker Compose.
- **Proxy Reverso (Traefik):** Gerencia as portas `80` (HTTP) e `443` (HTTPS) do host, roteando tráfego para os containers correspondentes de forma criptografada e automática via Let's Encrypt.
- **Docker Compose:** Orquestração local dos containers `bodyharmony-web` (Frontend), `bodyharmony-app` (Backend PHP 8.4) e `bodyharmony-db` (MySQL 8.0).

---

## 🚀 Fluxo de Deploy Atômico (Operations/deploy-vps.ps1)

O deploy oficial do ecossistema Body Harmony é feito localmente usando PowerShell pelo script `Operations/deploy-vps.ps1`.

### Padrão de Execução do Deploy:
```powershell
# Execução na máquina local de desenvolvimento (Windows)
.\Operations\deploy-vps.ps1
```

O script executa:
1. Recompilação do Frontend React/Vite (`apps/web-app/build`).
2. Sincronização dos arquivos estáticos compilados e do backend PHP 8.4 via SSH/Rsync estruturado para a VPS.
3. Execução das migrações de banco pendentes.
4. Reinicialização leve (`up -d`) dos containers modificados na VPS.

---

## 🛡️ Firewall Hostinger VPS (Padrão de Segurança)

Para a VPS `2.25.156.25`, apenas as seguintes portas devem estar liberadas para a WAN:

| Porta | Protocolo | Origem | Ação | Finalidade |
|-------|-----------|--------|------|------------|
| `22` | TCP | `0.0.0.0/0` (ou IP restrito) | `accept` | Acesso SSH para Deploy e Manutenção |
| `80` | TCP | `0.0.0.0/0` | `accept` | Desvio e redirecionamento de tráfego HTTP para HTTPS |
| `443` | TCP | `0.0.0.0/0` | `accept` | Tráfego HTTPS seguro (Traefik) |

> [!WARNING]
> Qualquer regra de liberação da porta `3306` (MySQL) ou `5432` (Postgres) para `0.0.0.0/0` deve ser rejeitada imediatamente. Toda e qualquer alteração de regras de firewall via API Hostinger exige **sincronização manual** subsequente:
>
> `POST /api/vps/v1/firewall/{id}/sync/12345`

---

## 🛠️ Padrões de Docker Compose Local

O arquivo `docker-compose.yml` da VPS mantém a seguinte estrutura isolada para a camada de banco de dados:

```yaml
version: "3.8"
services:
  bodyharmony-db:
    image: mysql:8.0
    container_name: bodyharmony-db
    ports:
      - "127.0.0.1:3306:3306" # Restrito estritamente a conexões locais
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: bodyharmony_prod
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - bodyharmony-network

  bodyharmony-app:
    image: bodyharmony-backend:latest
    container_name: bodyharmony-app
    depends_on:
      - bodyharmony-db
    networks:
      - bodyharmony-network

networks:
  bodyharmony-network:
    driver: bridge
```

---

## 📋 Resolução de Problemas (Troubleshooting)

### 1. Banco de Dados inacessível a partir do app/backend
- **Causa:** O backend não consegue resolver o host `bodyharmony-db` na rede interna Docker, ou o arquivo `.env` do backend PHP está configurado incorretamente.
- **Correção:** Garanta que a conexão no `.env` do backend aponte para `127.0.0.1:3306` se rodando no mesmo host, ou use o alias do container `bodyharmony-db` se configurado dentro da mesma rede de bridge do Docker Compose.

### 2. Falhas no script de Deploy (`deploy-vps.ps1`)
- **Causa:** Chave SSH corrompida, problemas de permissão na VPS ou falta de sincronização das pastas.
- **Correção:** Execute o comando `/diagnose full` para checar a saúde dos containers e a acessibilidade da rede.

---

## 🤖 Invariantes de Sidecars de LLM Local (QwenProxy & Hermes Agent)

1. **Permissões de Volume Playwright:**
   - A imagem `mcr.microsoft.com/playwright` roda como `pwuser` (`uid 1000`).
   - Ao criar/montar pastas de host (`/opt/qwenproxy/data`, `/opt/qwenproxy/qwen_profiles`), aplique sempre `chmod -R 777 /opt/qwenproxy/data /opt/qwenproxy/qwen_profiles` no host da VPS para evitar falhas de leitura/escrita do SQLite WAL (`SQLITE_CANTOPEN`).

2. **Paridade de Sessões SQLite no QwenProxy:**
   - A tabela `accounts` em `/opt/qwenproxy/data/qwenproxy.db` deve conter todos os registros dos perfis `qwen_profiles/*_state.json` com senhas criptografadas para garantir a rotação contínua do pool e evitar o erro `No available account lanes`.

3. **Isolamento de Portas e Rede do Hermes:**
   - O container `bodyharmony-qwenproxy` conecta-se à rede externa `hermes-agent-6bxv_default` e expõe a porta `8003:3000` no host (evitando a porta `3000` padrão ocupada pelo `evo-crm`).
   - O Hermes Agent consome o proxy localmente via `http://qwenproxy:3000/v1` com modelo padrão `custom/qwen3.7-plus-no-thinking`, garantindo custo operacional \$0.00 contínuo e suporte nativo a Tool Calling.

---

## 💳 Invariantes de Gateway de Pagamentos Asaas (Produção)

1. **dueDateLimitDays Obrigatório em Links de Pagamento:**
   - No endpoint `POST /v3/paymentLinks` da API v3 do Asaas, o parâmetro `dueDateLimitDays` é obrigatório quando o link aceita PIX/Boleto ou é avulso (`DETACHED`).
   - Sempre defina `dueDateLimitDays` com fallback padrão `>= 5` dias úteis para evitar o erro `invalid_object ("É necessário informar a quantidade de dias úteis para vencimento da cobrança.")`.

2. **Whitelist de IP de Produção no Asaas:**
   - Em produção na Hostinger (`45.152.44.244`), a Chave de API de Produção do Asaas deve ter o IP de saída da Hostinger cadastrado na lista de IPs autorizados (ou ter a restrição por IP desmarcada) para evitar o erro `not_allowed_ip (034WDC8W9H)`.
   - Se testar chamadas CLI locais, adicione também o IP da máquina de desenvolvimento.

3. **Sincronização de .env da API no Deploy Hostinger:**
   - O script `deploy-pro.ps1` exclui arquivos `.env` por segurança anti-vazamento no sync WinSCP padrão (`$excludes`).
   - Ao adicionar ou alterar variáveis de produção (ex: `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`), sincronize explicitamente `public_html/api/.env` mantendo total simetria com `apps/web-app/src/backend/.env`.

---

## 🔗 Referências
- [Diretrizes de Governança do Nexus](file:///f:/Body-Harmony-Remake/AGENTS.md)
- [Arquitetura Master](file:///f:/Body-Harmony-Remake/openspec/master/01-architecture-v6.md)


