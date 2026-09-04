# 🏛️ Body Harmony — Nexus Protocol V3.2

[![Nexus Protocol](https://img.shields.io/badge/Nexus-V3.2-0A3E60.svg)](AGENTS.md)
[![PHP](https://img.shields.io/badge/PHP-8.4-777BB4.svg)](apps/web-app/src/backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](apps/web-app/src/frontend/)
[![Spec-Driven](https://img.shields.io/badge/SDD-OpenSpec-ED7E13.svg)](openspec/)

Plataforma unificada fullstack do ecossistema **Body Harmony** (LMS, CRM Omnichannel, Gestão de Licenciadas, E-commerce e Congresso).

---

## 🗺️ Mapa de Arquitetura do Workspace

``
Body-Harmony-Remake/
├── AGENTS.md                  # 🏛️ Constituição de IA, Regras de Governança & TDAH-Friendly
├── CHANGELOG.md               # 📜 Histórico canônico de releases e auditorias
├── DESIGN.md                  # 🎨 Design System Luxury (Navy Blue #0A3E60, Gold #ED7E13)
├── README.md                  # 🚀 Guia de entrada e onboarding
├── .gitignore                 # 🛡️ Blindagem de credenciais, chaves e temporários
│
├── apps/                      # 📦 Aplicações e Microserviços
│   ├── web-app/               # App Fullstack Principal (React 18 / Vite + PHP 8.4 API)
│   ├── notebook-bridge/       # Serviço FastAPI / Google NotebookLM Bridge
│   └── telegram-bot/          # Bot Concierge do Telegram
│
├── infrastructure/            # ⚙️ Infraestrutura como Código & Banco de Dados
│   ├── database/              # Migrações SQL numeradas (V001 a V192)
│   └── docker/                # Stacks Docker Compose (CRM, OpenNotebook, Redis, MySQL)
│
├── openspec/                  # 📐 Fonte da Verdade Arquitetural (Nexus SDD)
│   ├── contracts/             # Schemas JSON formais para todos os endpoints da API
│   ├── master/                # Guias operacionais e manuais do sistema
│   ├── deltas/                # Planos de evolução técnica ativos (PLAN-XXX)
│   └── archive/               # Arquivo histórico de planos e auditorias executadas
│
├── scripts/                   # ⚡ Automação, CI/CD e DevOps
│   ├── ci/                    # nexus_gate.ps1 e verificações pré-commit/deploy
│   ├── devops/                # Scripts de build de release e deploy
│   └── vps/                   # Provisionamento da VPS Hostinger
│
└── tests/                     # 🧪 Baterias de Testes Automatizados
    ├── smoke/                 # Smoke tests PHP (CLI MockPDO)
    ├── e2e/                   # Testes de ponta a ponta
    └── stress/                # Benchmarks e testes de carga
``

---

## 🚀 Como Iniciar no Projeto

### 1. Pré-requisitos
* **PHP >= 8.4** com extensões pdo_mysql, mbstring, openssl, curl
* **Node.js >= 18** e npm
* **Docker & Docker Compose** (para serviços de CRM e Redis locais)

### 2. Instalação & Setup Automatizado (1-Clique)
```bash
# 1. Configurar automaticamente 100% das variáveis de ambiente (.env e .env.crm)
# Modo Auditoria / Testes (ideal para Qwen, CI/CD e testes rápidos):
npm run setup:mock
# Ou para Desenvolvimento Local interativo:
npm run setup:env -- --mode local

# 2. Instalar dependências do frontend
cd apps/web-app
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

### 3. Validação de Integridade (Quality Gate)
Antes de enviar qualquer código ou deploy, execute o gate de integridade Nexus:
`powershell
powershell -ExecutionPolicy Bypass -File scripts/nexus_gate.ps1
`

---

## 🛡️ Pilares Inegociáveis (Constituição Nexus V3.2)
1. **Contratos de API Primeiro**: Todo endpoint deve ter schema JSON correspondente em openspec/contracts/.
2. **Zero Hardcode & Blindagem**: Proibido comitar .env, senhas, credenciais de FTP ou chaves privadas.
3. **Identidade Estética Luxury**: Navy Blue (#0A3E60), Gold (#ED7E13), alvos de toque $\ge 44 \times 44\text{px}$, Mobile-First.
4. **Rastreabilidade Multi-Agent**: Toda alteração é logada no Obsidian Vault com status PASS.