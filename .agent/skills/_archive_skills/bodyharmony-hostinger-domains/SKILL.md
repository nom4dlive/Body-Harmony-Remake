---
name: bodyharmony-hostinger-domains
description: Gerenciamento do portfólio de domínios, redirecionamentos (forwarding) e configurações de privacidade/segurança de domínios secundários da marca Body Harmony (Nexus V3.1).
allowed-tools: Read, Write, Edit, Command
metadata:
  version: "3.1"
  priority: MEDIUM
---

# Body Harmony Domains Manager (Hostinger Domains API)

Esta skill organiza a administração do ciclo de vida dos domínios da marca Body Harmony, incluindo compras de novos nomes de campanhas de saúde/estética, ativação de proteção de privacidade (WHOIS) e configurações de redirecionamentos (Domain Forwarding) para o site principal.

---

## 🏛️ Diretrizes de Redirecionamento e SEO (Regra 3)

> [!TIP]
> Para quaisquer domínios alternativos e promocionais da clínica/marca, utilize sempre redirecionamento **301 (Permanent Redirect)** via API da Hostinger. Isso preserva a autoridade de busca (SEO Link Equity) no domínio principal `bodyharmony.com.br`.

---

## ⚙️ Core Concepts

- **Domínio Principal:** `bodyharmony.com.br`
- **Domínio Alternativo:** Nomes promocionais ou específicos (ex: `doctorharmony.com.br`, `bodyharmonyestetica.com.br`).
- **Domain Lock:** Mantido sempre **ativado** por padrão em todos os domínios corporativos da marca para prevenir transferências não autorizadas (sequestro de domínio).
- **Privacy Protection:** Obrigatório em todos os registros que permitam ocultação dos dados de contato do proprietário nos bancos de dados WHOIS públicos.

---

## 🚀 Padrões Comuns de Configuração de Domínios

### 1. Criar Redirecionamento 301 para o Domínio Principal
Redirecionar um domínio de campanha para o domínio oficial seguro com SSL:

```bash
curl -X POST "https://developers.hostinger.com/api/domains/v1/forwarding" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "doctorharmony.com.br",
    "redirect_type": "301",
    "redirect_url": "https://bodyharmony.com.br"
  }'
```

### 2. Ativar Trava de Segurança e Proteção de Privacidade
Bloquear transferências e ocultar dados WHOIS do domínio `bodyharmony.com.br`:

```bash
# Ativar trava contra transferências
curl -X PUT "https://developers.hostinger.com/api/domains/v1/portfolio/bodyharmony.com.br/domain-lock" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"

# Ativar proteção de privacidade de contato
curl -X PUT "https://developers.hostinger.com/api/domains/v1/portfolio/bodyharmony.com.br/privacy-protection" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```

---

## 📋 Resolução de Problemas (Troubleshooting)

### 1. Domínio redirecionado exibe erro de certificado SSL
- **Causa:** O redirecionamento foi configurado antes de um certificado válido ser emitido na VPS ou o Hostinger Forwarding não possui suporte SSL nativo ativo para o domínio de origem.
- **Correção:** Certifique-se de que o DNS do domínio alternativo aponta para os servidores de forwarding corretos da Hostinger conforme instruído no painel de controle.

### 2. Falha ao atualizar Nameservers de produção
- **Causa:** O domínio está bloqueado contra alterações ou em período de retenção (grace period).
- **Correção:** Desative temporariamente o `domain-lock` via API antes de atualizar os nameservers, reativando-o imediatamente após a confirmação.

---

## 🔗 Referências
- [Configurações de SEO do Workspace](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/index.html)
- [Auditoria de Segurança de Credenciais](file:///f:/Body-Harmony-Remake/openspec/tracker/V23_Credentials_Audit_Log.md)
