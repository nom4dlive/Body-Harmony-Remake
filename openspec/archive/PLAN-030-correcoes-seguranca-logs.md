# PLAN-030 — Correções de Segurança e Incoerências Locais (Nexus Guard)

Este plano atua na correção de incoerências de segurança física em scripts locais e na limpeza do workspace.

## ⚛️ Escopo
1. Ajuste do caminho do `.env` no script [check_db_login.php](file:///f:/Body-Harmony-Remake/apps/web-app/src/backend/api/check_db_login.php).
2. Remoção de credenciais de teste em texto puro e migração para carregamento seguro do `.env` no script [test_connection.ps1](file:///f:/Body-Harmony-Remake/scripts/db/test_connection.ps1).
3. Limpeza do log acumulado [deploy.log](file:///f:/Body-Harmony-Remake/logs/deploy.log) (65MB).

---

## 📋 Lista de Tarefas
* [x] 1. Corrigir o caminho do `.env` em `check_db_login.php`.
* [x] 2. Ajustar `test_connection.ps1` para parsear e ler dados do `.env`.
* [x] 3. Esvaziar `deploy.log`.
* [x] 4. Testar localmente a execução de ambos os utilitários.

---

## 🛡️ Resultados de Validação
* `check_db_login.php` executado localmente com sucesso ao ler as configurações mascaradas corretas do `.env`.
* Script do PowerShell extraiu com êxito as propriedades de banco diretamente do `.env` no teste isolado de parse.
* Tamanho do `deploy.log` reduzido para 0 bytes.
