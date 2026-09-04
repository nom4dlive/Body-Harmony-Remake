# Dependências — Body-Harmony-Remake

> Gerado pelo Scout em 2026-06-02
> Confiança: 🟢 CONFIRMADO

## Backend (PHP 8.2+)

**Fonte:** `apps/web-app/src/backend/composer.json`

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `php` | ^8.2 | Runtime |
| `tecnickcom/tcpdf` | ^6.7 | Geração de PDFs |
| `setasign/fpdi` | ^2.6 | Manipulação de PDFs (merge, import) |
| `mpdf/mpdf` | ^8.2 | Geração de PDFs HTML |

## Frontend (React + Vite)

**Fonte:** `apps/web-app/package.json`

### Produção

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `react` | ^18.3.1 | UI Framework |
| `react-dom` | ^18.3.1 | Renderização DOM |
| `react-router-dom` | ^7.1.1 | Roteamento SPA |
| `styled-components` | ^6.1.13 | CSS-in-JS |
| `framer-motion` | ^12.26.2 | Animações |
| `lucide-react` | ^0.562.0 | Ícones |
| `react-icons` | ^5.4.0 | Ícones alternativos |
| `recharts` | ^3.7.0 | Gráficos |
| `@dnd-kit/core` | ^6.3.1 | Drag & Drop |
| `@dnd-kit/modifiers` | ^9.0.0 | Modificadores DnD |
| `@dnd-kit/sortable` | ^10.0.0 | Sortable DnD |
| `@dnd-kit/utilities` | ^3.2.2 | Utilitários DnD |
| `date-fns` | ^4.1.0 | Manipulação de datas |
| `date-fns-tz` | ^3.2.0 | Timezone |
| `hls.js` | ^1.6.15 | Player HLS |
| `quill` | ^2.0.2 | Editor de texto |
| `react-quill-new` | ^3.7.0 | Wrapper React Quill |
| `react-player` | ^3.4.0 | Player de vídeo |
| `react-helmet-async` | ^2.0.5 | SEO (tags head) |
| `uuid` | ^13.0.0 | Geração de UUIDs |
| `@emotion/is-prop-valid` | ^1.4.0 | Validação de props |

### Desenvolvimento

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `vite` | ^6.0.5 | Bundler/Dev server |
| `@vitejs/plugin-react` | ^4.3.4 | Plugin React para Vite |
| `vitest` | ^4.0.18 | Test runner |
| `@vitest/ui` | ^4.0.18 | UI do Vitest |
| `@playwright/test` | ^1.58.2 | E2E testing |
| `@testing-library/react` | ^16.3.2 | Testes React |
| `@testing-library/jest-dom` | ^6.9.1 | Matchers DOM |
| `@testing-library/user-event` | ^14.6.1 | Eventos de usuário |
| `eslint` | ^9.17.0 | Linter |
| `eslint-plugin-react` | ^7.37.2 | Regras React |
| `eslint-plugin-react-hooks` | ^5.0.0 | Regras hooks |
| `eslint-plugin-react-refresh` | ^0.4.16 | Refresh |
| `globals` | ^15.14.0 | Globals ESLint |
| `jsdom` | ^28.1.0 | DOM simulado |
| `unimported` | ^1.31.0 | Detecção de imports não usados |

### Frontend Libs (avulsos)

**Fonte:** `apps/web-app/src/frontend/package.json`
| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `hls.js` | ^1.6.15 | Player HLS |

### Frontend AnimeJS (vendored)

**Fonte:** `apps/web-app/src/frontend/libs/animejs-v4/package.json`
| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `animejs` | ^4.0.0 | Animações JS (vendored localmente) |

## Telegram Bot

**Fonte:** `apps/telegram-bot/requirements.txt`

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `aiogram` | ==3.4.1 | Framework Telegram Bot (async) |
| `aiohttp` | ==3.9.3 | HTTP Client assíncrono |
| `python-dotenv` | ==1.0.1 | Carregamento de .env |

## Landing Pages (raiz)

**Fonte:** `Landing_Pages/Projetos/package.json`

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `basic-ftp` | — | Deploy FTP |

## Infraestrutura

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| PHP | 8.2+ | Runtime backend |
| MySQL | 8.4 | Banco de dados |
| Docker | Compose 3.8 | Containerização |
| Nginx | Alpine | Web server |
| Traefik | — | Reverse proxy / TLS |
| Composer | — | Gerenciador de pacotes PHP |
| npm | — | Gerenciador de pacotes JS |
| Python | 3.x | Runtime bot Telegram |
