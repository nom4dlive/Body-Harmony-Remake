---
name: bodyharmony-hostinger-billing
description: Monitoramento e gerenciamento de assinaturas e faturamento da infraestrutura Hostinger associada ao ecossistema Body Harmony (Nexus V3.1).
allowed-tools: Read, Write, Edit, Command
metadata:
  version: "3.1"
  priority: LOW
---

# Body Harmony Billing & Subscriptions (Hostinger Billing API)

Esta skill regulamenta a consulta de faturamento, métodos de pagamento e monitoramento de assinaturas ativas de serviços na Hostinger, garantindo a continuidade operacional de servidores e domínios essenciais do ecossistema Body Harmony.

---

## 🏛️ Invariante de Continuidade Operacional

> [!CAUTION]
> As assinaturas da **VPS Dedicada (2.25.156.25)**, do domínio principal **`bodyharmony.com.br`** e das caixas de e-mail corporativo dos doutores/clínica devem permanecer estritamente com a opção **Auto-Renewal Habilitada**. Desabilitar a renovação automática desses ativos constitui um risco crítico de interrupção operacional (Downtime).

---

## ⚙️ Core Concepts

- **Faturamento em Centavos:** Os valores de catálogo e custos na API Hostinger são expressos como inteiros em centavos (ex: `1799` centavos equivalem a `R$ 17,99` ou `USD 17.99`).
- **Assinaturas:** Representam os pacotes ativos vinculados à conta Hostinger (Planos VPS, Domínios, E-mails).
- **Métodos de Pagamento:** Cartões de crédito cadastrados para a renovação automática. Devem ser gerenciados via hPanel.

---

## 🚀 Padrões Comuns de Configuração de Faturamento

### 1. Listar Assinaturas Ativas
Permite auditar a expiração das assinaturas essenciais do portal:

```bash
curl -X GET "https://developers.hostinger.com/api/billing/v1/subscriptions" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```

### 2. Habilitar Renovação Automática da VPS ou Domínio
Se uma assinatura essencial estiver desativada:

```bash
curl -X PATCH "https://developers.hostinger.com/api/billing/v1/subscriptions/{SUBSCRIPTION_ID}/auto-renewal/enable" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```

### 3. Obter Preços Vigentes de Planos de VPS
Para simular upgrades de memória ou processamento da VPS Dedicada:

```bash
curl -X GET "https://developers.hostinger.com/api/billing/v1/catalog?category=vps" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```

---

## 🛡️ Best Practices

1. **Prevenir Expiração:** Configure e-mails secundários de backup no painel da Hostinger para alertas de falhas de faturamento.
2. **Método de Pagamento Default:** Mantenha um cartão corporativo secundário configurado como backup no hPanel para evitar interrupções no ciclo de cobrança.

---

## 📋 Resolução de Problemas (Troubleshooting)

### 1. Assinatura não renovada automaticamente
- **Causa:** Cartão padrão expirado, sem saldo ou bloqueado pelo banco.
- **Correção:** Verifique e atualize a forma de pagamento padrão no painel de controle (hPanel).

### 2. Acesso à API retornando 401 Unauthorized
- **Causa:** Token de API inválido ou com permissões restritas.
- **Correção:** Gere um novo token de acesso no perfil do painel Hostinger e atualize a variável `$HOSTINGER_API_TOKEN` com segurança.

---

## 🔗 Referências
- [Painel de Faturamento Hostinger](https://hpanel.hostinger.com/billing)
- [Diretrizes de Governança do Nexus](file:///f:/Body-Harmony-Remake/AGENTS.md)
