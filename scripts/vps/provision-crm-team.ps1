<#
.SYNOPSIS
    Body Harmony Nexus V3.1 — Provisionamento de Acessos da Equipe CRM (PLAN-157)
.DESCRIPTION
    Cria e configura os 7 usuários da equipe no Chatwoot (Account 1) com atribuição
    a todas as caixas de entrada e no Portal do Gestor (MySQL admin_users).
#>

param(
    [switch]$SkipChatwootSeed,
    [switch]$SkipGestorSeed
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PROVISIONAMENTO DE ACESSOS DA EQUIPE CRM (PLAN-157)    " -ForegroundColor Yellow
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

# Preparar parâmetros SSH / SCP
$sshArgs = @("-p", $SSHPort, "-o", "StrictHostKeyChecking=no")
$scpArgs = @("-P", $SSHPort, "-o", "StrictHostKeyChecking=no")

if ($SSHKey -and (Test-Path $SSHKey)) {
    $sshArgs += @("-i", $SSHKey)
    $scpArgs += @("-i", $SSHKey)
}

# 2. Sincronizar script de seed na VPS
Write-Host "`n[1/3] Sincronizando script de seed da equipe na VPS..." -ForegroundColor Cyan
scp @scpArgs "$ProjectRoot\infrastructure\docker\crm\seed_team_users.rb" "${RemoteHostStr}:${RemotePath}/seed_team_users.rb"

# 3. Executar Seed no Container Chatwoot
if (-not $SkipChatwootSeed) {
    Write-Host "`n[2/3] Executando Seed de Usuários no Chatwoot..." -ForegroundColor Cyan
    $remoteCmd = "docker cp $RemotePath/seed_team_users.rb bodyharmony-chatwoot-web:/app/seed_team_users.rb && docker exec bodyharmony-chatwoot-web bundle exec rails runner /app/seed_team_users.rb"
    $chatwootOutput = ssh @sshArgs $RemoteHostStr $remoteCmd
    Write-Host $chatwootOutput
}

# 4. Sincronizar Usuários no Portal do Gestor (MySQL)
if (-not $SkipGestorSeed) {
    Write-Host "`n[3/3] Sincronizando Usuários no Portal do Gestor (MySQL)..." -ForegroundColor Cyan
    php "$ProjectRoot\scripts\db\seed_team_gestor_users.php"
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   PROVISIONAMENTO DA EQUIPE CONCLUIDO COM SUCESSO!       " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
