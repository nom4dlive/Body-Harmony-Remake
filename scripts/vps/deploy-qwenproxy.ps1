# ==============================================================================
# 🚀 Deploy & Sincronização do QwenProxy na VPS Hostinger Dedicada
# Ecossistema Body Harmony — Nexus Protocol V3.1
# ==============================================================================

param (
    [string]$VpsIp = "2.25.156.25",
    [string]$SshKey = "openspec/tracker/Hostinger_VPS/id_ed25519",
    [string]$SourcePath = "F:\Organizado\01_IA_AGENTES\AI_Proxy\qwenproxy",
    [string]$DestPath = "/opt/qwenproxy"
)

Write-Host "⚜️ [Body Harmony] Iniciando sincronização do QwenProxy para a VPS ($VpsIp)..." -ForegroundColor Cyan

if (-not (Test-Path $SshKey)) {
    Write-Error "❌ Chave SSH não encontrada em $SshKey"
    exit 1
}

# 1. Cria diretórios remotos na VPS
Write-Host "🔹 [1/5] Criando diretórios na VPS..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no root@$VpsIp "mkdir -p $DestPath/data $DestPath/qwen_profiles $DestPath/src"

# 2. Sincronização dos arquivos via SCP
Write-Host "🔹 [2/5] Enviando arquivos do QwenProxy (dist, src, package.json, Dockerfile)..." -ForegroundColor Yellow
scp -i $SshKey -r -o StrictHostKeyChecking=no "$SourcePath/dist" "$SourcePath/src" "$SourcePath/package*.json" "$SourcePath/Dockerfile" "$SourcePath/tsconfig*.json" "root@${VpsIp}:${DestPath}/"

# 3. Copiar docker-compose específico para VPS
Write-Host "🔹 [3/5] Enviando docker-compose com rede hermes-network..." -ForegroundColor Yellow
$composeContent = @"
version: '3.8'

services:
  qwenproxy:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: bodyharmony-qwenproxy
    restart: unless-stopped
    ports:
      - "8003:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
      - BROWSER=chromium
      - HEADLESS=true
      - API_KEY=bh_qwen_local_secret
      - QWEN_GUEST_MODE_ONLY=false
      - ACCOUNT_LANES=2
      - NAVIGATION_TIMEOUT=45000
      - PAGE_TIMEOUT=30000
      - CHAT_TIMEOUT=120000
    volumes:
      - ./data:/app/data
      - ./qwen_profiles:/app/qwen_profiles
    tmpfs:
      - /tmp:size=512M
    shm_size: 1g
    deploy:
      resources:
        limits:
          memory: 4096M
          cpus: '2.0'
        reservations:
          memory: 1024M
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - default
      - hermes-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  default:
  hermes-network:
    external: true
    name: hermes-agent-6bxv_default
"@

$tempCompose = "infrastructure/docker/docker-compose.qwenproxy.vps.yml"
Set-Content -Path $tempCompose -Value $composeContent -Encoding UTF8
scp -i $SshKey -o StrictHostKeyChecking=no $tempCompose "root@${VpsIp}:${DestPath}/docker-compose.yml"
Remove-Item -Force $tempCompose

# 4. Build e Start do Container
Write-Host "🔹 [4/5] Construindo e inicializando container Docker do QwenProxy..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no root@$VpsIp "cd $DestPath && docker compose up -d --build"

# 5. Healthcheck e Validação
Write-Host "🔹 [5/5] Validando integridade (Health Check)..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
$health = ssh -i $SshKey -o StrictHostKeyChecking=no root@$VpsIp "curl -s http://localhost:8003/health"
Write-Host "✅ Status QwenProxy: $health" -ForegroundColor Green
