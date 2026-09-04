# PLAN-031 — Plano de Testes End-to-End da VPS Dedicada (Nexus Guard)

Este plano atua na validação e auditoria ativa das conexões e serviços da VPS Dedicada (`2.25.156.25`).

## ⚛️ Escopo
1. Criar utilitário de teste em [test_vps_e2e.ps1](file:///f:/Body-Harmony-Remake/tests/e2e/test_vps_e2e.ps1) para automação de port-scanning e testes de conectividade.
2. Validar o redirecionamento e integridade dos certificados Let's Encrypt dos domínios web da VPS (`api.bodyharmony.com.br`, `app.bodyharmony.com.br` e `stream.bodyharmony.com.br`).
3. Validar a autenticação de chave SSH privada `id_ed25519` e retornar a telemetria do sistema de produção da VPS de forma segura.

---

## 📋 Lista de Tarefas
* [x] 1. Desenvolver o script de automação E2E PowerShell.
* [x] 2. Escanear portas TCP WAN e certificar isolamento seguro (MySQL, PHP-FPM, Traefik Dashboard).
* [x] 3. Testar handshakes HTTP/HTTPS e expiração de SSL para todos os subdomínios.
* [x] 4. Efetuar handshake SSH via chave criptográfica local e capturar a telemetria de CPU/Docker.
* [x] 5. Sincronizar o walkthrough de resultados.

---

## 🛡️ Resultados de Validação (Consolidado)
* **Firewall WAN**: Portas `22`, `80` e `443` operando abertas para tráfego seguro. Portas `3306`, `9000` e `8080` bloqueadas e filtradas com sucesso.
* **HTTPS**: Conexão bem-sucedida (HTTP `200`) com cifragem TLS ativa em todas as rotas web mapeadas da VPS.
* **Autenticação SSH**: Autenticação com a chave privada `id_ed25519` validada.
* **Containers Docker**: Todos os containers essenciais (`bodyharmony-app`, `bodyharmony-web`, `traefik`, `bodyharmony-sentinel`) estão ativos (`Up`) e monitoramento do Sentinel saudável.
* **Recursos**: Espaço em disco saudável na VPS com apenas `17%` de uso (161GB livres).
