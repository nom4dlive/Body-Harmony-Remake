# Arquitetura — Body Harmony

> Gerado pelo Architect em 2026-06-02
> Confiança: 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + Vite | 18 + 6 |
| Estilização | Styled-Components | — |
| Roteamento | React Router | 6 |
| Backend | PHP (custom MVC) | 8.2+ |
| Banco Principal | MySQL (Oracle/Hostinger) | 8.4 |
| Cache | ResponseCache (disco) + NexusCache (frontend memória) | — |
| Servidor Web | Nginx (Docker) | alpine |
| Containerização | Docker Compose | 3.8 |
| Proxy Reverse | Traefik (Let's Encrypt) | — |
| IA | Google Gemini API | 2.0 Flash |
| PDF | SimplePDF (custom) | — |
| GeoIP | GeoIPService | — |

## Topologia
Monolito modular com separação backend/frontend via API REST.

```
Internet
    │
    ▼
Traefik (Proxy Reverse + SSL)
    │
    ▼
Nginx (Servidor Web)
    │
    ├──→ PHP-FPM (API REST)
    │       ├──→ MySQL 8.4 (docker: bodyharmony-db)
    │       └──→ SQLite (admin local)
    │
    └──→ Assets Estáticos (React SPA build)
```

## Padrões Arquiteturais

### Backend (PHP)
- **Entry Point único**: `index.php` como roteador central (~1400 linhas)
- **MVC customizado**: Controllers recebem `$pdo` e `$loggedUser` via global injection
- **Auth middleware**: `AuthMiddleware` valida token antes de cada rota
- **Cache**: ResponseCache (stale-while-revalidate, disco)
- **Logger**: NexusLogger com redação de dados sensíveis
- **Error Handler**: `NexusErrorHandler` com graceful degradation

### Frontend (React)
- **Lazy Loading**: todas as páginas com `React.lazy()`
- **Context API**: AuthContext, DataContext, SignalContext, AudioContext
- **API Client central**: `services/api.js` com retry automático (Stability Shield)
- **Route Guards**: ProtectedRoute, RoleGuard, LicenciadaGuard, AlunaGuard

### Comunicação
- **Formato**: JSON (REST-like)
- **Autenticação**: Bearer Token (admin) / Device Token (licenciada) / Aluna Token (aluna)
- **Upload**: Multipart form-data para Doctor Harmony e Media

## Dívidas Técnicas Identificadas

### 🔴 CRÍTICAS
1. **Global injection** (`global $pdo, $loggedUser`): presente em todos os controllers — impede testes unitários e viola DI
2. **Single-file router**: `index.php` com ~1400 linhas — difícil manutenção
3. **Senhas em docker-compose.yml**: hardcoded no arquivo versionado

### 🟡 MÉDIAS
4. **Auth dual**: `is_admin` (bool) e `role` (string) coexistem — inconsistência de design
5. **Cache TTLs arbitrários**: 300s para LMS, 60s para Nexus Cache — sem padrão definido
6. **SimplePDF**: biblioteca custom sem testes, sem suporte a Unicode avançado
7. **Fallback query param token**: `?token=` em AuthMiddleware — risco de vazamento em logs/referrer

### 🟢 LEVES
8. **Código duplicado**: lógica de broadcast existe em 2 lugares (BroadcastController + signal_tower/broadcasts.php)
9. **N+1 queries**: AdminLmsController::indexData() faz query separada por módulo para lessons
10. **Stabilization bypass**: progression check com try-catch vazio — comportamento silencioso
