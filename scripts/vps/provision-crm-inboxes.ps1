<#
.SYNOPSIS
    Body Harmony Nexus V3.1 — Provisionamento de Inboxes Chatwoot & Instâncias Evolution API (PLAN-152)
.DESCRIPTION
    Executa o seed no Chatwoot para criar a conta master e as 4 inboxes oficiais, e
    em seguida provisiona as 3 instâncias permanentes e 2 burners na Evolution API v2.
#>

param(
    [switch]$SkipChatwootSeed,
    [switch]$SkipEvolutionProvisioning
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PROVISIONAMENTO DE INBOXES & INSTANCIAS (BLOCO 2)      " -ForegroundColor Yellow
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

# 2. Sincronizar scripts de seed e provisionamento na VPS
Write-Host "`n[1/3] Sincronizando scripts de seed e provisionador na VPS..." -ForegroundColor Cyan
scp @scpArgs "$ProjectRoot\infrastructure\docker\crm\seed_chatwoot_inboxes.rb" "${RemoteHostStr}:${RemotePath}/seed_chatwoot_inboxes.rb"
scp @scpArgs "$ProjectRoot\infrastructure\docker\crm\provision_evolution.py" "${RemoteHostStr}:${RemotePath}/provision_evolution.py"

# 3. Executar Seed no Container Chatwoot
$AccountId = 1
$ApiToken = "wxvcKsycZEXjrqM7dxD72oNm"

if (-not $SkipChatwootSeed) {
    Write-Host "`n[2/3] Executando Seed de Inboxes no Chatwoot..." -ForegroundColor Cyan
    $seedCmd = @"
docker cp $RemotePath/seed_chatwoot_inboxes.rb bodyharmony-chatwoot-web:/app/seed_chatwoot_inboxes.rb
docker exec bodyharmony-chatwoot-web bundle exec rails runner /app/seed_chatwoot_inboxes.rb
"@

    $seedOutput = ssh @sshArgs $RemoteHostStr $seedCmd
    Write-Host $seedOutput

    # Extrair JSON retornado pelo seed
    $jsonMatch = [regex]::Match($seedOutput, "(?s)--- JSON_OUTPUT_START ---\s*(\{.*?\})\s*--- JSON_OUTPUT_END ---")
    if ($jsonMatch.Success) {
        $SeedData = $jsonMatch.Groups[1].Value | ConvertFrom-Json
        $AccountId = $SeedData.account_id
        $ApiToken = $SeedData.api_token
        Write-Host "✅ Chatwoot Account ID: $AccountId | Token: $ApiToken" -ForegroundColor Green
    }
}

# 4. Provisionamento das Instâncias na Evolution API
if (-not $SkipEvolutionProvisioning) {
    Write-Host "`n[3/3] Provisionando Instâncias WhatsApp na Evolution API v2..." -ForegroundColor Cyan
    $evoCmd = "python3 $RemotePath/provision_evolution.py $AccountId $ApiToken"
    $evoOutput = ssh @sshArgs $RemoteHostStr $evoCmd
    Write-Host $evoOutput
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "     PROVISIONAMENTO DO BLOCO 2 CONCLUIDO COM SUCESSO!     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
