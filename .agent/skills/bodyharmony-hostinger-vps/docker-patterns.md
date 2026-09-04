# Padrões de Implantação Docker — Body Harmony VPS

Este documento descreve os padrões recomendados de orquestração Docker Compose para a VPS dedicada da Body Harmony.

## Arquitetura de Containers (Docker Compose)

O ambiente produtivo da Body Harmony é orquestrado em três serviços principais dentro do mesmo arquivo `docker-compose.yml`, isolando o banco de dados da rede externa.

```yaml
version: "3.8"

services:
  # 🌐 Servidor Web e Proxy Reverso (Traefik)
  traefik:
    image: traefik:v3.0
    container_name: bodyharmony-traefik
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=tecnologia@bodyharmony.com.br"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    networks:
      - bodyharmony-network

  # ⚙️ Servidor do App (PHP 8.4 Vanilla - Core Lógica)
  bodyharmony-app:
    image: bodyharmony-php8.4-app:latest
    container_name: bodyharmony-app
    restart: always
    volumes:
      - /var/www/bodyharmony/backend:/var/www/html
      - /var/www/bodyharmony/private_uploads:/var/www/private_uploads
    environment:
      - DB_HOST=bodyharmony-db
      - DB_USER=bodyharmony_user
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=bodyharmony_prod
      - ENV=production
    labels:
      - "traefik.http.routers.bodyharmony.rule=Host(`bodyharmony.com.br`) || Host(`www.bodyharmony.com.br`)"
      - "traefik.http.routers.bodyharmony.tls.certresolver=letsencrypt"
    depends_on:
      - bodyharmony-db
    networks:
      - bodyharmony-network

  # 🗄️ Banco de Dados (MySQL 8.0 - Nexus Data Layer)
  bodyharmony-db:
    image: mysql:8.0
    container_name: bodyharmony-db
    restart: always
    environment:
      MYSQL_DATABASE: bodyharmony_prod
      MYSQL_USER: bodyharmony_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    ports:
      - "127.0.0.1:3306:3306" # Blindagem local para loopback. Sem acesso externo WAN.
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - bodyharmony-network

volumes:
  mysql_data:
  letsencrypt:

networks:
  bodyharmony-network:
    driver: bridge
```

---

## Práticas Recomendadas

1. **Restrições de Bind da Porta do DB:** O bind de porta do MySQL deve ser explicitamente mapeado para `127.0.0.1:3306:3306`. Mapear simplesmente `"3306:3306"` abre a porta na interface pública (WAN) e constitui uma falha grave sob o Nexus Protocol.
2. **Volumes Persistentes:** Nunca apague os volumes persistentes do MySQL (`mysql_data`) ou do Traefik (`letsencrypt`). Fazer `docker compose down -v` destruirá todos os dados do banco e os certificados SSL armazenados na VPS.
3. **Variáveis de Ambiente:** Mantenha senhas e tokens sensíveis no arquivo `.env` fora do diretório exposto à rede pública.
