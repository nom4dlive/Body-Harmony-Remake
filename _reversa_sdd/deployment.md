# Deployment — Body Harmony

> Gerado pelo Architect em 2026-06-02
> Confiança: 🟢 CONFIRMADO

## Infraestrutura

```mermaid
graph TB
    subgraph "VPS Hostinger Dedicada"
        subgraph "Docker Compose"
            subgraph "Traefik (Gateway)"
                TR[traefik:latest<br/>Port 443<br/>Let's Encrypt SSL]
            end

            subgraph "bodyharmony-web"
                NX[nginx:alpine<br/>Port 80<br/>Static files + FastCGI]
            end

            subgraph "bodyharmony-app"
                APP[PHP-FPM 8.2+<br/>api/ + private_uploads/]
            end

            subgraph "bodyharmony-db"
                DB[MySQL 8.4<br/>Port 127.0.0.1:3306<br/>Loopback only]
            end
        end

        subgraph "Volumes"
            V1[(db_data<br/>/var/lib/mysql)]
            V2[(private_uploads)]
            V3[(cache<br/>ResponseCache JSON)]
        end

        APP --> DB
        APP --> V2
        APP --> V3
        DB --> V1
    end

    subgraph "Domínios"
        D1(bodyharmony.com.br)
        D2(www.bodyharmony.com.br)
    end

    subgraph "Serviços Externos"
        GM[Google Gemini API]
    end

    UI[Navegador Cliente] -->|HTTPS| TR
    TR --> D1 & D2
    TR --> NX
    NX -->|FastCGI| APP
    APP -->|REST| GM

    style TR fill:#ED7E13,color:#fff
    style NX fill:#0A3E60,color:#fff
    style APP fill:#0A3E60,color:#fff
    style DB fill:#666,color:#fff
    style V1 fill:#666,color:#fff
    style V2 fill:#666,color:#fff
    style GM fill:#666,color:#fff
```

## Configuração Docker

### docker-compose.yml
- **3 serviços**: db (MySQL 8.4), app (PHP-FPM), web (Nginx alpine)
- **Traefik labels**: routing por hostname, Let's Encrypt SSL
- **MySQL loopback**: porta 3306 exposta apenas em 127.0.0.1 (Espaço Negativo)
- **Volumes**: db_data (persistente), private_uploads, api code

### Variáveis de Ambiente
| Variável | Valor | Descrição |
|----------|-------|-----------|
| DB_STAGE | PROD | Ambiente de produção |
| DB_HOST | db | Host MySQL (container) |
| DB_NAME | u388974772_bodyharmony_db | Nome do banco |
| SITE_URL | https://bodyharmony.com.br | URL do site |
| APP_SECRET | BodyHarmonySecretKey2026 | HMAC secret para signed URLs |
| NEXUS_ALLOWED_IPS | variável | IPs permitidos no NexusGuard |
| MAINTENANCE_MODE | 0/1 | Feature flag de manutenção |

### Segurança (Regra 2 — Espaço Negativo)
- **MySQL** NÃO exposto para WAN — apenas loopback local (`127.0.0.1:3306`)
- **auth_nexus.php**: IP whitelist via `NEXUS_ALLOWED_IPS`
- **Traefik**: SSL automático via Let's Encrypt
- **Response Cache**: arquivos JSON em disco (sem exposição pública)

## CI/CD
- **GitHub**: repositório de código
- **Deploy manual**: via SSH + Docker Compose na VPS Hostinger (IP: 2.25.156.25)
