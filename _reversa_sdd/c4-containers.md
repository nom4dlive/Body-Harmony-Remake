# C4 — Diagrama de Containers (Nível 2)

> Gerado pelo Architect em 2026-06-02

```mermaid
graph TB
    subgraph "Navegador"
        UI[React SPA<br/>Vite 6<br/>Styled-Components]
    end

    subgraph "Servidor (Docker)"
        subgraph "Traefik Gateway"
            TR([Traefik<br/>Proxy Reverse + SSL])
        end

        subgraph "Web Server"
            NX([Nginx alpine])
        end

        subgraph "Application Server"
            PHP([PHP-FPM 8.2+])
        end

        subgraph "Banco de Dados"
            MYSQL[("MySQL 8.4<br/>bodyharmony-db<br/>Oracle/Hostinger")]
            SQLITE[("SQLite<br/>Nexus local")]
        end

        subgraph "Armazenamento"
            DISK[("Disco<br/>Private Uploads")]
            CACHE[("Cache Disco<br/>ResponseCache JSON")]
        end
    end

    subgraph "Sistemas Externos"
        GM([Google Gemini API])
    end

    UI -->|"HTTPS"| TR
    TR -->|"Port 443"| NX
    NX -->|"FastCGI"| PHP

    PHP -->|"PDO"| MYSQL
    PHP -->|"PDO SQLite"| SQLITE

    PHP -->|"REST"| GM
    PHP -->|"I/O"| DISK
    PHP -->|"I/O"| CACHE

    style UI fill:#0A3E60,color:#fff
    style TR fill:#ED7E13,color:#fff
    style NX fill:#ED7E13,color:#fff
    style PHP fill:#ED7E13,color:#fff
    style MYSQL fill:#666,color:#fff
    style SQLITE fill:#666,color:#fff
    style DISK fill:#666,color:#fff
    style CACHE fill:#666,color:#fff
    style GM fill:#666,color:#fff
```

### Containers

| Container | Tecnologia | Função |
|-----------|-----------|--------|
| React SPA | React 18 + Vite 6 | Interface de usuário com lazy loading |
| Traefik | Traefik (Let's Encrypt) | Reverse proxy, SSL termination, routing |
| Nginx | Nginx alpine | Servidor web, static assets, FastCGI |
| PHP-FPM | PHP 8.2+ | API REST, lógica de negócio, cache |
| MySQL | MySQL 8.4 | Banco de dados principal |
| SQLite | SQLite3 (PHP) | Cache admin, firewall rules, audit |
| Private Uploads | Disco (bind mount) | Uploads de mentoria IA, thumbnails, mídia |
| Response Cache | Disco (JSON) | Cache stale-while-revalidate |
