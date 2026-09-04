# Inventário do Projeto — Body-Harmony-Remake

> Gerado pelo Scout em 2026-06-02
> Confiança: 🟢 CONFIRMADO (extraído diretamente do código)

## Estrutura de Diretórios (Top-Level)

```
F:\Body-Harmony-Remake/
├── apps/
│   ├── web-app/          # Aplicação principal (Monolito Fullstack)
│   │   ├── src/
│   │   │   ├── backend/  # PHP 8.2+ API (custom MVC)
│   │   │   ├── frontend/ # React 18 + Vite 6 SPA
│   │   │   └── infrastructure/
│   │   └── build/        # Artefatos de build
│   └── telegram-bot/     # Bot Telegram (Python 3.x / aiogram)
├── infrastructure/        # Infraestrutura Docker/DevOps
│   ├── docker/           # Docker Compose (PHP, MySQL, Nginx, Traefik)
│   ├── config/           # Configs de ambiente
│   ├── scripts/          # Scripts DevOps
│   ├── backups/          # Backups de infra
│   └── bot-oracle/       # Bot Oracle Cloud
├── Landing_Pages/        # Ecossistema de Landing Pages
│   ├── Projetos/         # Projetos Vite/React/TS
│   │   ├── protocolo-3s/       # High Ticket (R$997)
│   │   ├── Workshop-low-Ticket/  # Low Ticket (R$197)
│   │   └── Workshop-medium-Ticket/ # Medium Ticket (R$497)
│   ├── design/           # Assets de design
│   └── SPECs/            # Especificações de LP (15 arquivos)
├── openspec/              # OpenSpec (contratos, deltas, specs)
├── scripts/               # Scripts diversos (devops, db)
├── tests/                 # Testes (PHP, JS, K6)
├── scratch/               # Scripts temporários/utilitários
├── backups/               # Backups do projeto
├── releases/              # Releases versionadas
├── logs/                  # Logs
├── tmp/                   # Arquivos temporários
├── private_uploads/       # Uploads privados
├── build/                 # Build output
└── zz_Referencias/        # Material de referência/design
```

## Linguagens

| Linguagem | Extensões | Qtd (estimada) | Uso |
|-----------|-----------|----------------|-----|
| PHP | .php | ~122 | Backend API, scripts |
| JavaScript (JSX) | .jsx, .js | ~189 | Frontend React |
| TypeScript | .ts, .tsx | ~30 | Landing Pages |
| Python | .py | ~2 | Telegram Bot |
| SQL | .sql | ~1 | Scripts DB |
| Shell/Batch | .ps1, .bat | ~5 | DevOps/Deploy |

## Frameworks e Bibliotecas

### Backend (PHP 8.2+)
- **Custom MVC** sem framework — Router próprio, autoloader próprio
- **Dependências:**
  - `mpdf/mpdf: ^8.2` — Geração de PDFs
  - `tecnickcom/tcpdf: ^6.7` — Geração de PDFs alternativo
  - `setasign/fpdi: ^2.6` — Manipulação de PDFs
  - Autoload: PSR-4 (`BodyHarmony\` → `api/v1/`)

### Frontend (React 18 + Vite 6)
- **Core:** React 18.3, React DOM 18.3, React Router 7.1
- **Estados/UI:** styled-components 6.13, framer-motion 12.26
- **Ícones:** lucide-react 0.562, react-icons 5.4
- **Gráficos:** recharts 3.7
- **Drag & Drop:** @dnd-kit (core, modifiers, sortable, utilities)
- **Datas:** date-fns 4.1, date-fns-tz 3.2
- **Editor:** quill 2.0, react-quill-new 3.7
- **Player:** react-player 3.4, hls.js 1.6
- **SEO:** react-helmet-async 2.0
- **UUID:** uuid 13.0

### Landing Pages (Vite + TypeScript + Tailwind)
- React + TypeScript + Tailwind CSS
- Build via Vite

### Telegram Bot (Python)
- aiogram 3.4.1
- aiohttp 3.9.3
- python-dotenv 1.0.1

## Entry Points

| Tipo | Caminho |
|------|---------|
| Frontend Entry | `apps/web-app/src/frontend/src/main.jsx` |
| Backend Router | `apps/web-app/src/backend/api/v1/index.php` |
| Backend Config | `apps/web-app/src/backend/api/config.php` |
| Backend Index | `apps/web-app/src/backend/index.php` |
| Vite Config | `apps/web-app/vite.config.js` |
| Bot Entry | `apps/telegram-bot/main.py` |
| LP Build | `Landing_Pages/Projetos/deploy-all.mjs` |

## Configurações

| Arquivo | Propósito |
|---------|-----------|
| `.env` (múltiplos) | Configurações de ambiente (DB, API keys) |
| `.env.deploy` | Config de deploy |
| `apps/web-app/.env` | Env do web-app |
| `apps/web-app/src/backend/.env` | Env do backend |
| `apps/web-app/src/backend/.env.example` | Template de env |
| `infrastructure/docker/.env.production.template` | Template produção |
| `apps/web-app/vite.config.js` | Config do Vite |
| `apps/web-app/vitest.config.js` | Config do Vitest |
| `apps/web-app/src/backend/api/v1/Core/Router.php` | Roteador centralizado |

## CI/CD

Não foram encontrados workflows de CI/CD no repositório (`.github/` ausente). O deploy é manual via PowerShell (`Operations/deploy-pro.ps1`) ou scripts DevOps.

## Docker

| Arquivo | Conteúdo |
|---------|----------|
| `infrastructure/docker/Dockerfile.php` | Dockerfile PHP 8.2+ (Apache) |
| `infrastructure/docker/php/Dockerfile` | Dockerfile PHP alternativo |
| `infrastructure/docker/docker-compose.yml` | Docker Compose: MySQL 8.4 + PHP + Nginx + Traefik |
| `infrastructure/docker/nginx/` | Config Nginx |
| `infrastructure/docker/.env.production.template` | Template env produção |

## Banco de Dados

- **SGBD:** MySQL 8.4 (Docker)
- **Topologia:** Dual-node (Hostinger PROD + Oracle STAGE)
- **Failover:** Automático com circuit breaker (DbFailover)
- **Esquemas referenciados:** `alunas`, `licenciadas`, `leads`, `lessons`, `modules`, `sessions`, `devices`, `quiz`, `analytics`, `certificates`, `broadcasts`
- **Migrations:** Diretório `migrations/` vazio (migrações via scripts avulsos)

## Testes

| Framework | Arquivos | Tipo |
|-----------|----------|------|
| Playwright | `tests/visual/home.spec.js` | E2E Visual |
| Vitest | Config presente, sem specs visíveis | Unit (configurado) |
| K6 | `tests/stress/licenciadas-load.js` | Stress test |
| PHP Smoke | `tests/smoke_doctor_harmony.php` | Smoke test |

## Módulos Identificados

1. **Auth** — Autenticação (admin, aluna, licenciada) + JWT + MagicToken
2. **Admin** — Painel administrativo completo
3. **Aluna (Student)** — Portal da aluna individual
4. **Licenciada (Licensee)** — Gestão de licenciadas
5. **LMS** — Learning Management System (módulos, aulas, progresso, quiz)
6. **Nexus** — Plataforma de operações/DevOps interna
7. **Doctor Harmony** — IA clínica para análise de fotos
8. **Content/Library** — Gerenciamento de conteúdo
9. **Leads** — Captura e gestão de leads
10. **Results** — Resultados (antes/depois)
11. **FAQ** — FAQ do site
12. **Media** — Upload e gerenciamento de mídia
13. **Analytics** — Métricas e analytics
14. **Certificate** — Emissão de certificados
15. **Broadcast** — Sistema de notificações/broadcasts
16. **Workshops** — Landing pages de workshop

## Total de Arquivos (aproximado)

- **PHP (backend):** ~122
- **JSX/JS (frontend):** ~189
- **Landing Pages (TS/TSX):** ~30
- **Arquivos de infra/config:** ~20
- **Total estimado (excluindo vendor/node_modules):** ~400+
