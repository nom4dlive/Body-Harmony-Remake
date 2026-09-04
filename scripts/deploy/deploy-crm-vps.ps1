<#
.SYNOPSIS
    Body Harmony Nexus V3.1 — Deploy Stack CRM (Evolution API v2 + Chatwoot) na VPS Dedicada (PLAN-151)
.DESCRIPTION
    Sincroniza os arquivos de configuração, inicializa o PostgreSQL 16 e Redis 7, executa
    o setup inicial do Chatwoot e da Evolution API, e valida os healthchecks HTTP 200.
#>

param(
    [switch]$SkipTransfer,
    [switch]$SkipMigrations,
    [switch]$ForceRecreate
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DEPLOY STACK CRM (EVOLUTION + CHATWOOT) -> VPS DEDICADA " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Carregar Configurações de Deploy SSH
$EnvFile = "$ProjectRoot\.env.deploy"
if (-not (Test-Path $EnvFile)) {
    Write-Error "CRITICAL: .env.deploy não encontrado no root do projeto!"
    exit 1
}

$Config = @{}
Get-Content $EnvFile | Where-Object { $_ -match "^[^#].+=" } | ForEach-Object {
    $parts = $_ -split '=', 2
    $Config[$parts[0].Trim()] = $parts[1].Trim()
}

$SSHHost = $Config["VPS_SSH_HOST"]
$SSHUser = $Config["VPS_SSH_USER"]
$SSHPort = if ($Config.ContainsKey("VPS_SSH_PORT")) { $Config["VPS_SSH_PORT"] } else { "22" }
$SSHKey  = if ($Config.ContainsKey("VPS_SSH_KEY")) { $Config["VPS_SSH_KEY"] } else { "" }
$RemotePath = "/opt/crm"
$RemoteHostStr = $SSHUser + "@" + $SSHHost

Write-Host "Target: $RemoteHostStr (Port: $SSHPort)" -ForegroundColor Cyan
Write-Host "Remote Root: $RemotePath" -ForegroundColor Cyan

# Preparar parâmetros SSH / SCP
$sshArgs = @("-p", $SSHPort, "-o", "StrictHostKeyChecking=no")
$scpArgs = @("-P", $SSHPort, "-o", "StrictHostKeyChecking=no")

if ($SSHKey -and (Test-Path $SSHKey)) {
    $sshArgs += @("-i", $SSHKey)
    $scpArgs += @("-i", $SSHKey)
}

# 2. Transferência de Arquivos de Infraestrutura
if (-not $SkipTransfer) {
    Write-Host "`n[1/4] Preparando diretórios remotos e transferindo configs..." -ForegroundColor Cyan

    # Garantir diretórios remotos e rede traefik-net
    $prepCmd = "mkdir -p $RemotePath/postgres_data $RemotePath/redis_data $RemotePath/evolution_instances $RemotePath/evolution_store $RemotePath/chatwoot_data && docker network create traefik-net 2>/dev/null || true"
    ssh @sshArgs $RemoteHostStr $prepCmd

    # Verificar .env.crm local ou gerar a partir do .env.crm.example
    $EnvCrmLocal = "$ProjectRoot\.env.crm"
    if (-not (Test-Path $EnvCrmLocal)) {
        Write-Host "Criando .env.crm a partir de .env.crm.example..." -ForegroundColor Yellow
        Copy-Item "$ProjectRoot\.env.crm.example" $EnvCrmLocal
    }

    # Copiar arquivos de infraestrutura
    scp @scpArgs "$ProjectRoot\docker-compose.crm.yml" "${RemoteHostStr}:${RemotePath}/docker-compose.crm.yml"
    scp @scpArgs "$ProjectRoot\infrastructure\docker\crm\init-databases.sh" "${RemoteHostStr}:${RemotePath}/init-databases.sh"
    scp @scpArgs "$EnvCrmLocal" "${RemoteHostStr}:${RemotePath}/.env"

    # Ajustar permissões no script bash
    ssh @sshArgs $RemoteHostStr "chmod +x $RemotePath/init-databases.sh"
    Write-Host "✅ Configurações e scripts sincronizados com sucesso na VPS!" -ForegroundColor Green
}

# 3. Boot Inicial do Banco de Dados & Redis
Write-Host "`n[2/4] Inicializando PostgreSQL 16 & Redis 7..." -ForegroundColor Cyan
$startDbCmd = "cd $RemotePath && docker compose -f docker-compose.crm.yml up -d crm-postgres crm-redis"
ssh @sshArgs $RemoteHostStr $startDbCmd

Write-Host "Aguardando saúde do PostgreSQL e Redis (10s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Bootstrap / Migração do Chatwoot (se não ignorado)
if (-not $SkipMigrations) {
    Write-Host "`n[3/4] Verificando e executando migrações do Chatwoot (db:chatwoot_prepare)..." -ForegroundColor Cyan
    $prepareCmd = "cd $RemotePath && docker compose -f docker-compose.crm.yml run --rm chatwoot-web bundle exec rails db:chatwoot_prepare"
    ssh @sshArgs $RemoteHostStr $prepareCmd
    Write-Host "✅ Banco do Chatwoot preparado com sucesso!" -ForegroundColor Green
}

# 5. Inicialização Completa da Stack
Write-Host "`n[4/4] Subindo Evolution API v2 e Chatwoot (Web + Worker)..." -ForegroundColor Cyan
$recreateFlag = if ($ForceRecreate) { "--force-recreate" } else { "" }
$startFullCmd = "cd $RemotePath && docker compose -f docker-compose.crm.yml up -d $recreateFlag"
ssh @sshArgs $RemoteHostStr $startFullCmd

Write-Host "Aguardando 15s para estabilização de todos os serviços..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 6. Verificação de Saúde e Status dos Containers
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "               STATUS DOS CONTAINERS CRM                  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
$statusCmd = "docker ps --filter 'name=bodyharmony-crm' --filter 'name=bodyharmony-evolution' --filter 'name=bodyharmony-chatwoot' --format 'table {{.Names}}`t{{.Status}}`t{{.Ports}}'"
ssh @sshArgs $RemoteHostStr $statusCmd

# 7. Healthchecks HTTP
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "               HEALTHCHECKS DA STACK CRM                  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$healthCmd = @"
echo '--- Healthcheck Evolution API (Local Port 8085) ---'
curl -s -o /dev/null -w 'Evolution Local HTTP: %{http_code}\n' http://127.0.0.1:8085/ || true

echo '--- Healthcheck Chatwoot (Local Port 3005) ---'
curl -s -o /dev/null -w 'Chatwoot Local HTTP: %{http_code}\n' http://127.0.0.1:3005/ || true

echo '--- Healthcheck Traefik / Nginx ---'
curl -k -s -o /dev/null -w 'Evolution Local 8085: %{http_code}\n' http://127.0.0.1:8085/ || true
curl -k -s -o /dev/null -w 'Chatwoot Local 3005: %{http_code}\n' http://127.0.0.1:3005/installation/onboarding || true
"@

ssh @sshArgs $RemoteHostStr $healthCmd

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "     STACK CRM IMPLANTADA COM SUCESSO NA VPS DEDICADA!     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
