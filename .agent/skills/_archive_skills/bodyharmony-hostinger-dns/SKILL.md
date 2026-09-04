---
name: bodyharmony-hostinger-dns
description: Gerenciamento de zonas de DNS, snapshots e registros para o domínio principal bodyharmony.com.br e domínios associados no ecossistema Body Harmony (Nexus V3.1).
allowed-tools: Read, Write, Edit, Command
metadata:
  version: "3.1"
  priority: HIGH
---

# Body Harmony DNS Manager (Hostinger DNS API)

Esta skill regula a gestão e configuração das zonas de DNS do domínio central **`bodyharmony.com.br`** e de domínios secundários e de pouso, garantindo a integridade de roteamento do tráfego do portal e das landing pages para a VPS.

---

## 🏛️ Diretrizes Críticas de Rede

- **Desafio HTTP (Traefik SSL):** O proxy reverso Traefik utiliza o desafio `HTTP-01` do Let's Encrypt para emitir e renovar certificados SSL. Por isso, os registros de DNS do tipo `A` para `bodyharmony.com.br` e `www.bodyharmony.com.br` devem sempre apontar diretamente para o IP da VPS Dedicada (`2.25.156.25`).
- **Pontos de Acesso Limpos:** Evite criar registros CNAME para o domínio raiz. Use registros do tipo `A` ou `ALIAS`.

---

## ⚙️ Core Concepts

- **Domínio Raiz (`@`):** `bodyharmony.com.br`
- **Subdomínios Ativos:**
  - `www` -> Site principal
  - `app` -> Portal Gestor / LMS
  - `api` -> Backend PHP 8.4
- **Segurança de E-mail:** A correta manutenção dos registros SPF, DKIM e DMARC na zona DNS da Hostinger previne que e-mails de notificação do portal caiam em SPAM.

---

## 🚀 Padrões Comuns de Configuração de DNS

### 1. Apontar o Domínio Principal para a VPS Dedicada (Porta A)
Adicione o registro `A` apontando para o IP `2.25.156.25`:

```bash
curl -X PUT "https://developers.hostinger.com/api/dns/v1/zones/bodyharmony.com.br" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "overwrite": true,
    "zone": [
      {
        "name": "@",
        "type": "A",
        "ttl": 14400,
        "records": [
          { "content": "2.25.156.25" }
        ]
      },
      {
        "name": "www",
        "type": "A",
        "ttl": 14400,
        "records": [
          { "content": "2.25.156.25" }
        ]
      }
    ]
  }'
```

### 2. Validar Estrutura de Registros Antes da Aplicação
Sempre use o endpoint `/validate` para evitar quebras de DNS de produção:

```bash
curl -X POST "https://developers.hostinger.com/api/dns/v1/zones/bodyharmony.com.br/validate" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "overwrite": false,
    "zone": [
      {
        "name": "api",
        "type": "A",
        "ttl": 300,
        "records": [
          { "content": "2.25.156.25" }
        ]
      }
    ]
  }'
```

### 3. Criar Snapshot de Segurança de DNS
Antes de qualquer alteração estrutural nas zonas de DNS da Hostinger, realize o backup ou valide os snapshots ativos:

```bash
# Listar snapshots existentes
curl -X GET "https://developers.hostinger.com/api/dns/v1/snapshots/bodyharmony.com.br" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```

---

## 🛡️ Configuração de E-mail (Exemplo Google Workspace)
Caso a Body Harmony utilize e-mails institucionais sob o Google Workspace, garanta estes registros:

| Tipo | Nome | TTL | Prioridade / Conteúdo |
|------|------|-----|----------------------|
| MX | `@` | 14400 | `1 aspmx.l.google.com.` |
| MX | `@` | 14400 | `5 alt1.aspmx.l.google.com.` |
| TXT | `@` | 14400 | `"v=spf1 include:_spf.google.com ~all"` |

---

## 📋 Resolução de Problemas (Troubleshooting)

### 1. Certificado SSL do Traefik falhando ao renovar
- **Causa:** O registro DNS `A` para `bodyharmony.com.br` ou `www` não aponta para o IP `2.25.156.25`, impedindo a validação de desafio `HTTP-01`.
- **Correção:** Ajuste as entradas DNS A para apontar para `2.25.156.25` e aguarde a propagação (TTL expirado).

### 2. Notificações do Portal caindo na caixa de SPAM do cliente
- **Causa:** Ausência ou configuração incorreta dos registros de segurança de envio SPF (`TXT`) e DKIM.
- **Correção:** Insira as chaves DKIM e a diretriz SPF fornecidas pelo provedor de envio SMTP da Hostinger no painel DNS.

---

## 🔗 Referências
- [Painel DNS Hostinger](https://hpanel.hostinger.com)
- [Documentação Oficial de APIs da Hostinger](https://developers.hostinger.com)
