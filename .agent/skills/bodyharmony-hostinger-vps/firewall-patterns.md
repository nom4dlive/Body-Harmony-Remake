# Padrões de Configuração de Firewall — Body Harmony VPS

Como o banco de dados e os containers internos do Body Harmony rodam sob regras rígidas de segurança na VPS Dedicada, este documento descreve como gerenciar e configurar as regras do Firewall da VPS usando a API Hostinger.

## Regras Recomendadas de Firewall

Por padrão, a política padrão do Firewall Hostinger é **DROP ALL** (bloquear todo tráfego de entrada). Devemos liberar apenas os serviços essenciais.

| Protocolo | Porta | Origem | Ação | Descrição |
|-----------|-------|--------|------|-----------|
| `tcp` | `22` | `0.0.0.0/0` (ou IP da agência/desenvolvedor) | `accept` | Acesso SSH seguro |
| `tcp` | `80` | `0.0.0.0/0` | `accept` | Servidor Web HTTP (Traefik) |
| `tcp` | `443` | `0.0.0.0/0` | `accept` | Servidor Web HTTPS SSL (Traefik) |

---

## Criando e Atualizando o Firewall via API

### 1. Criar Firewall do Ecossistema
```bash
curl -X POST "https://developers.hostinger.com/api/vps/v1/firewall" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "bodyharmony-firewall" }'
```

### 2. Adicionar Regra de Porta HTTPS (443)
```bash
curl -X POST "https://developers.hostinger.com/api/vps/v1/firewall/{FIREWALL_ID}/rules" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "tcp",
    "port": "443",
    "source": "0.0.0.0/0",
    "action": "accept"
  }'
```

### 3. Sincronizar Regras com a VPS
Sempre que uma regra for inserida, alterada ou excluída na API da Hostinger, ela **não é aplicada imediatamente**. Você deve executar o comando de sincronização:

```bash
curl -X POST "https://developers.hostinger.com/api/vps/v1/firewall/{FIREWALL_ID}/sync/12345" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```

---

## Exemplo de Configuração Segura em PHP 8.4 (Backend Script)

Se o backend precisar validar ou reconstruir o firewall em tarefas agendadas locais:

```php
<?php

$token = $_ENV['HOSTINGER_API_TOKEN'];
$vpsId = $_ENV['HOSTINGER_VPS_ID'];

// 1. Criar regras essenciais
$rules = [
    ['protocol' => 'tcp', 'port' => '22', 'source' => '0.0.0.0/0', 'action' => 'accept'],
    ['protocol' => 'tcp', 'port' => '80', 'source' => '0.0.0.0/0', 'action' => 'accept'],
    ['protocol' => 'tcp', 'port' => '443', 'source' => '0.0.0.0/0', 'action' => 'accept']
];

// Loop para criar as regras via cURL na API Hostinger
foreach ($rules as $rule) {
    $ch = curl_init("https://developers.hostinger.com/api/vps/v1/firewall/{$firewallId}/rules");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($rule));
    curl_exec($ch);
    curl_close($ch);
}

// 2. Sincronizar regras com a VPS
$ch = curl_init("https://developers.hostinger.com/api/vps/v1/firewall/{$firewallId}/sync/{$vpsId}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
curl_exec($ch);
curl_close($ch);

echo "Firewall sincronizado com a VPS de produção!\n";
```
