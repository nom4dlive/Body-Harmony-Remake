---
name: bodyharmony-hostinger-reach
description: Gerenciamento da API Hostinger Reach (Email Marketing) para captação de leads e campanhas de estética/saúde do ecossistema Body Harmony (Nexus V3.1).
allowed-tools: Read, Write, Edit, Command
metadata:
  version: "3.1"
  priority: MEDIUM
---

# Body Harmony Reach — Marketing & Leads (Hostinger Reach API)

Esta skill regulamenta a integração e gerenciamento de contatos, captação de leads de estética/saúde e criação de segmentos de campanhas de e-mail usando a API Hostinger Reach no ecossistema Body Harmony.

---

## 🏛️ Identidade Visual Luxury (Regra 3)

> [!IMPORTANT]
> Todo elemento de interface do frontend React que colete leads (formulários de contato, newsletter) ou exiba o status de inscrição deve utilizar estritamente a paleta oficial da marca:
> - **Primary actions / CTAs:** Gold (`#ED7E13`)
> - **Fundo e elementos de realce:** Navy Blue (`#0A3E60`)
> - **Superfície:** Clean Surface (`#FFFFFF` ou `#F5F5F5`)
>
> Os formulários devem ser desenhados Mobile-First com alvos de toque maiores ou iguais a 44x44px.

---

## ⚙️ Core Concepts

- **Leads Estéticos:** Novos contatos registrados via formulários do site.
- **Double Opt-In:** Ativado por padrão para conformidade regulatória. O lead recém-cadastro inicia com status `pending` e recebe um e-mail de confirmação visualmente elegante.
- **Segmentos:** Agrupamento de clientes de estética com base em tratamento de interesse, comportamento de cliques e aberturas em campanhas.

---

## 🚀 Integração de Captação de Leads (PHP 8.4 Vanilla)

Abaixo está o padrão recomendado de Controller PHP 8.4 para receber dados de leads do frontend, higienizar e registrá-los na API Hostinger Reach.

```php
<?php

namespace App\Controllers;

class LeadController
{
    public function registerLead(): void
    {
        // 1. Receber e sanitizar inputs
        $input = json_decode(file_get_contents('php://input'), true);
        $email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $name = htmlspecialchars(trim($input['name'] ?? ''), ENT_QUOTES, 'UTF-8');
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || empty($name)) {
            http_response_code(422);
            echo json_encode(['error' => 'Dados de input inválidos ou incompletos.']);
            return;
        }

        // 2. Chamar a API Hostinger Reach
        $token = $_ENV['HOSTINGER_API_TOKEN'];
        $profileUuid = $_ENV['HOSTINGER_REACH_PROFILE_UUID'];
        
        $payload = [
            'email' => $email,
            'name' => $name,
            'surname' => htmlspecialchars(trim($input['surname'] ?? ''), ENT_QUOTES, 'UTF-8')
        ];

        $ch = curl_init("https://developers.hostinger.com/api/reach/v1/profiles/{$profileUuid}/contacts");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer $token",
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        
        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($statusCode === 201) {
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Lead registrado com sucesso (Pendente Opt-in).']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro interno ao registrar na Hostinger Reach.', 'details' => json_decode($response)]);
        }
    }
}
```

---

## 🛡️ Best Practices

1. **Higienização de Inputs (Higiene de Código):** Nunca envie dados brutos (raw data) do formulário diretamente para a API. Sempre higienize e-mails e strings no backend PHP antes do envio.
2. **Double Opt-In Obrigatório:** Garanta que a jornada do usuário no frontend explique claramente que ele precisará validar seu e-mail para receber as ofertas e dicas exclusivas.
3. **Validação de Token:** Use chaves de ambiente `$_ENV['HOSTINGER_API_TOKEN']` e nunca salve strings cruas de tokens no código.

---

## 📋 Resolução de Problemas (Troubleshooting)

### 1. Lead não recebe e-mail de confirmação
- **Causa:** O remetente associado ao `profileUuid` não está validado ou está com problemas de autenticação de domínio (SPF/DKIM/DMARC ausentes).
- **Correção:** Verifique e atualize a assinatura digital do remetente no hPanel Reach.

### 2. Retorno de Status 422 na API
- **Causa:** O e-mail já existe na base de dados ou possui formato inválido.
- **Correção:** Trate erros de duplicidade graciosamente na interface do usuário informando que o e-mail já está cadastrado ou reativado.

---

## 🔗 Referências
- [Configurações de Identidade do Painel Reach](https://hpanel.hostinger.com)
- [Documentação Oficial de APIs da Hostinger](https://developers.hostinger.com)
