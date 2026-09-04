#!/bin/bash
# ==========================================================================
# BODY HARMONY - VPS INITIAL SETUP SCRIPT
# Version: 3.1 (Nexus VPS Era)
# ==========================================================================
# This script prepares a clean Ubuntu 24.04/26.04 VPS for the Body Harmony Stack.
# It installs Docker, Docker Compose, sets up folders and configures firewall.
# Run on VPS: curl -s https://raw.githubusercontent.com/.../setup-vps.sh | bash

set -e

# Cores para feedback no console
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}==========================================================${NC}"
echo -e "${YELLOW}  🛡️  BODY HARMONY - VPS SETUP WIZARD V3.1${NC}"
echo -e "${CYAN}==========================================================${NC}"

# 1. Verificar se rodando como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Erro: Por favor, execute este script como root (sudo).${NC}"
  exit 1
fi

# 2. Atualizar pacotes do sistema
echo -e "\n${CYAN}[1/6] Atualizando pacotes do sistema (Apt)...${NC}"
apt-get update && apt-get upgrade -y
apt-get install -y curl git bash unzip zip software-properties-common ufw
echo -e "${GREEN}✓ Sistema atualizado.${NC}"

# 3. Instalar Docker e Docker Compose (se não estiverem instalados)
echo -e "\n${CYAN}[2/6] Verificando instalação do Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker não encontrado. Instalando Docker Engine...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker instalado com sucesso.${NC}"
else
    echo -e "${GREEN}✓ Docker já está instalado (${YELLOW}$(docker --version)${GREEN}).${NC}"
fi

if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Docker Compose não encontrado. Instalando plugin docker-compose-plugin...${NC}"
    apt-get install -y docker-compose-plugin
    echo -e "${GREEN}✓ Docker Compose instalado com sucesso.${NC}"
else
    echo -e "${GREEN}✓ Docker Compose já está instalado (${YELLOW}$(docker compose version)${GREEN}).${NC}"
fi

# 4. Criar estrutura de diretórios para a aplicação
echo -e "\n${CYAN}[3/6] Criando diretórios do ecossistema em /opt/bodyharmony...${NC}"
INSTALL_DIR="/opt/bodyharmony"
mkdir -p "$INSTALL_DIR/public"
mkdir -p "$INSTALL_DIR/api"
mkdir -p "$INSTALL_DIR/private_uploads"
mkdir -p "$INSTALL_DIR/infrastructure/nginx"
chmod -R 775 "$INSTALL_DIR"
echo -e "${GREEN}✓ Diretórios criados em $INSTALL_DIR.${NC}"

# 5. Configurar o Firewall (UFW)
echo -e "\n${CYAN}[4/6] Configurando Firewall de Segurança (UFW)...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
# MySQL 3306 bloqueada por padrão para a WAN (somente interna na rede docker bridge)

echo "y" | ufw enable
echo -e "${GREEN}✓ Firewall ativado com segurança (Portas 22, 80 e 443 abertas).${NC}"

# 6. Preparar SSL Let's Encrypt dummy para evitar erros de inicialização do Nginx
echo -e "\n${CYAN}[5/6] Preparando estrutura SSL Let's Encrypt...${NC}"
SSL_DIR="/var/lib/docker/volumes/infrastructure_certbot_etc/_data/live/bodyharmony.com.br"
mkdir -p "$SSL_DIR"

if [ ! -f "$SSL_DIR/fullchain.pem" ]; then
    echo -e "${YELLOW}Chaves SSL reais não encontradas. Criando certificado dummy auto-assinado temporário...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/privkey.pem" \
        -out "$SSL_DIR/fullchain.pem" \
        -subj "/CN=bodyharmony.com.br"
    echo -e "${GREEN}✓ Certificado dummy criado para evitar falha de inicialização do Nginx.${NC}"
else
    echo -e "${GREEN}✓ Certificado SSL já existente detectado.${NC}"
fi

# 7. Conclusão do setup básico
echo -e "\n${CYAN}[6/6] Finalizando Setup VPS...${NC}"
echo -e "${CYAN}==========================================================${NC}"
echo -e "${GREEN} 🎉 VPS PREPARADA E CONFIGURADA COM SUCESSO!${NC}"
echo -e " Próximos passos para o deploy no ambiente local:"
echo -e " 1. Configure seu ${YELLOW}.env.deploy${NC} local com o IP da VPS e chave SSH."
echo -e " 2. Configure as variáveis em ${YELLOW}$INSTALL_DIR/infrastructure/.env${NC} na VPS."
echo -e " 3. Execute o script de deploy local: ${CYAN}.\\Operations\\deploy-vps.ps1 -ForceRebuildDocker${NC}"
echo -e " 4. Na VPS, gere o certificado real: ${YELLOW}docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/html/certbot -d bodyharmony.com.br -d www.bodyharmony.com.br --email seu-email@exemplo.com --agree-tos --no-eff-email${NC}"
echo -e "${CYAN}==========================================================${NC}"
