# 🏗️ Especificação de Arquitetura Body Harmony v7.0 (Nexus Era / Split Traffic Híbrido)

> **Status:** Ativo (v3.1/Nexus Era)
> **Tipo:** Arquitetura Híbrida Distribuída com Split Traffic (LMS na VPS + Site & Banco na Hostinger Premium)
> **Infraestrutura:** Hospedagem Premium Brasil (45.152.44.244) para Landing Pages e Banco MySQL Mestre + VPS Dedicada (2.25.156.25) para Portal LMS/API logada e NexusLogger
> **Pipeline:** RELEASE V3.2 (Deploy Híbrido: SPA e API do LMS na VPS via Docker; Landing Pages via SFTP na Premium)
> **Last Updated:** 2026-06-04

---

## 1. Visão Geral
O ecossistema Body Harmony opera em uma arquitetura híbrida de alto desempenho projetada para contornar limites de conexões e processos concorrentes:
1. **Site Institucional & Vendas (`bodyharmony.com.br`):** Processado e servido diretamente na Hospedagem Compartilhada (Hostinger Premium Brasil - IP `45.152.44.244`), garantindo carregamento imediato das landing pages de marketing para conversão de leads.
2. **Portal LMS & Área Logada (`app.bodyharmony.com.br` / `api.bodyharmony.com.br` / `stream.bodyharmony.com.br`):** Executado e servido a partir de containers Docker na **VPS Dedicada** (IP `2.25.156.25`), liberando a Hostinger Premium da carga de processamento dinâmico concorrente e eliminando o limite de **20 Entry Processes (EP)** do plano compartilhado.
3. **Banco de Dados MySQL (Negócio):** Hospedado de forma centralizada e segura no plano Hostinger Premium (`localhost` para a Premium). A VPS conecta-se remotamente a ele com segurança restrita por IP de firewall, mantendo uma base de dados única e unificada em tempo real.
4. **Banco de Dados MySQL (Logs — VPS Dedicada):** O contêiner MySQL local da VPS foi desativado para poupar recursos de RAM e CPU, centralizando a lógica de persistência. O `NexusLogger` escreve dados e auditoria em uma base dedicada de logs.

---

## 2. Pilares da Arquitetura

### 2.1 Frontend (React SPA)
- **Framework:** React 18 + Vite.
- **Servidor Web**: Apache / LiteSpeed (Hospedagem Compartilhada).
- **Localização (Source):** `apps/web-app/src`.
- **Build Target:** `build/public_html` (Unificado).
- **Roteamento:** Configurado via `.htaccess` para fallback de roteamento cliente-side (HTML5 History API) para `index.html`.

### 2.2 Backend (PHP Native v1) & Persistência
- **Localização (Source):** `apps/web-app/src/backend/`.
- **Servidor de Execução**: Hospedagem Compartilhada (PHP 8.4 Vanilla, LiteSpeed).
- **Banco de Dados (Negócio)**: MySQL local (`localhost`) na mesma Hospedagem Compartilhada. Credenciais: `u388974772_body_db` / banco `u388974772_bodyharmony_db`.
- **Banco de Dados (Logs)**: MySQL 8.4 na VPS Dedicada (`2.25.156.25:3306`), acessado exclusivamente pelo `NexusLogger` via conexão `$pdoVPSLogs` em `config.php`. Firewall VPS restringe porta 3306 ao IP da compartilhada.

### 2.3 Deploy & SSL
- **Deploy**: Via SFTP (SSH porta 65002) usando WinSCP para `/home/u388974772/domains/bodyharmony.com.br/public_html`.
- **SSL**: Let's Encrypt automático gerenciado pela Hostinger para `bodyharmony.com.br`, `app.bodyharmony.com.br`, `api.bodyharmony.com.br` e `stream.bodyharmony.com.br`.

### 2.4 Banco de Dados (MySQL)
- **Schema Control:** `infrastructure/database/DATABASE_MASTER_V36_1.sql`.
- **Migrations:** `infrastructure/database/migrations/` — Scripts SQL versionados e incrementais.


## 3. Fluxos de Trabalho (Workflows)

### 3.1 Spec-Driven Development (OpenSpec)
Todo código nasce de uma especificação em `openspec/`.
1. **!S (Spec):** Definir o "O Quê" em `openspec/specs/`.
2. **!P (Plan):** Definir o "Como" em `openspec/specs/PLAN-*.md`.
3. **!I (Impl):** Codificar e Testar.
4. **!V (Validate):** Verificar contra a Spec via `walkthrough.md`.

---

## 4. Estrutura de Diretórios (v6.2/V124 - Nexus Era)

Para o detalhamento do propósito, criticidade, riscos de alterações e plano de reorganização futura de cada diretório, consulte o tracker oficial: [V124_Directory_Structure_Map.md](file:///f:/Body-Harmony-Remake/openspec/tracker/V124_Directory_Structure_Map.md).

```
project-root/
│
├── .agent/                  # Regras e Workflows de IA (Nexus Guard)
├── apps/                    # Core de Aplicações e Serviços Produtivos
│   ├── telegram-bot/        # Bot conversacional em Python (aiogram)
│   ├── web-app/             # Monólito Híbrido (React + PHP 8.4 Vanilla)
│   └── whatsapp-bot/        # Automação conversacional complementar (TypeScript)
│
├── infrastructure/          # Persistência de Dados e Recursos de Infra
│   └── database/            # SQL Schema Consolidado (DATABASE_MASTER_V36_1.sql)
│
├── Landing_Pages/           # Ecossistema de Vendas e Páginas Promocionais
├── Operations/              # Scripts e utilitários Powershell de Deploy/OPS
├── openspec/                # Sistema de Governança e Fonte da Verdade
│   ├── archive/             # Arquivo histórico de deltas e planos
│   ├── deltas/              # Planos de implementação ativos (PLAN-*.md)
│   ├── master/              # Especificações master ativas (Master Specs)
│   └── tracker/             # Auditoria viva, changelogs e mapas
│
├── logs/                    # Logs consolidados de DevOps, deploy e Nexus
├── private_uploads/         # Uploads confidenciais isolados (Segurança)
├── scripts/                 # Automações de banco e empacotamento local
├── tests/                   # Suítes de testes de carga, stress e e2e
├── tmp_mpdf/                # Diretório temporário gravável para mPDF
├── zz_Referencias/          # Biblioteca estática offline de apoio do cliente
│
└── build/                   # Artefato de compilação legado (DEPRECATED)
```

## 5. Convenções
- **Idioma:** Código em Inglês, Docs em Português.
- **API:** Respostas sempre em JSON com headers de segurança.
- **Mobile First:** Prioridade total para smartphones.
