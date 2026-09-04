---
name: bodyharmony-hostinger-hosting
description: Gerenciamento de hospedagem Hostinger para o ecossistema Body Harmony (Nexus V3.1). Controla a criação de websites, subdomínios (app, api), verificação de domínio e seleção de datacenters de baixa latência.
allowed-tools: Read, Write, Edit, Command
metadata:
  version: "3.1"
  priority: HIGH
---

# Body Harmony Hosting Manager (Hostinger Hosting API)

Esta skill regulamenta o gerenciamento de contas de hospedagem de sites e subdomínios do ecossistema Body Harmony, cobrindo o provisionamento, a verificação de propriedades de domínios e a seleção geográfica de infraestrutura.

---

## 🏛️ Diretrizes de Estrutura do Workspace (Nexus Path)

De acordo com as regras de caminhos físicos do repositório:
- **Backend (PHP 8.4 Vanilla):** Alocado na pasta privada `/var/www/bodyharmony/backend/` correspondente a `apps/web-app/src/backend/api/v1/`.
- **Frontend (React/Vite):** Alocado em `/var/www/bodyharmony/public_html/` correspondente a `apps/web-app/src/frontend/src/`.
- **Armazenamento Privado:** A pasta `private_uploads/` fica bloqueada via regras de `.htaccess`, fora de `public_html` para evitar vazamentos de PDFs e contratos de clientes.

---

## ⚙️ Core Concepts

- **Datacenter de Baixa Latência:** Ao provisionar novos planos ou addons, selecione sempre servidores localizados no Brasil (América do Sul) para latência mínima no acesso dos clientes e doutores ao portal.
- **Subdomínios de Aplicação:** Os subdomínios `app.bodyharmony.com.br` e `api.bodyharmony.com.br` operam integrados à hospedagem Hostinger.
- **Verificação de Domínios:** Todo domínio secundário novo cadastrado deve ter a propriedade verificada via inserção de registros DNS TXT providos pelo painel Hostinger.

---

## 🚀 Padrões Comuns de Configuração de Hospedagem

### 1. Criar Subdomínio de Testes (Subdomain Gratuito)
Útil para criar ambientes de staging isolados:
```bash
curl -X POST "https://developers.hostinger.com/api/hosting/v1/domains/free-subdomains" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```

### 2. Verificar Domínio Adicional
Antes de criar o addon na hospedagem, envie a requisição de verificação de propriedade:
```bash
curl -X POST "https://developers.hostinger.com/api/hosting/v1/domains/verify-ownership" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "domain": "bodyharmony-estetica.com.br" }'
```

### 3. Provisionar o Novo Site no Plano
```bash
curl -X POST "https://developers.hostinger.com/api/hosting/v1/websites" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "bodyharmony-estetica.com.br",
    "order_id": 12345,
    "datacenter_code": "br-south-1"
  }'
```

---

## 🛡️ Regras de Higiene e Segurança de Arquivos

- **Arquivos Estáticos (.htaccess):** A pasta `private_uploads/` deve conter um `.htaccess` com a regra `Deny from all` para bloquear acesso direto por requisições HTTP do browser.
- **Acesso Programático:** O backend PHP 8.4 consome esses arquivos de upload usando streams seguros autenticados, com injeção de metadados invisíveis para auditoria forense.

---

## 📋 Resolução de Problemas (Troubleshooting)

### 1. Erro de Criação de Website (Domain Not Verified)
- **Causa:** O domínio não passou pela verificação de propriedade via TXT.
- **Correção:** Obtenha o registro TXT via API ou hPanel, insira na zona de DNS correspondente e tente novamente após 10 minutos (tempo de propagação).

### 2. Latência Alta de Resposta no Portal
- **Causa:** O plano de hospedagem ou a VPS foi provisionado em um datacenter fora do Brasil (ex: Europa ou EUA).
- **Correção:** Ao provisionar novos addons ou migrar recursos, garanta a escolha do datacenter brasileiro (`br-south-1`).

---

## 🔗 Referências
- [Configuração de Rotas de API](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/services/api.js)
- [Diretório Private Uploads](file:///f:/Body-Harmony-Remake/private_uploads)
