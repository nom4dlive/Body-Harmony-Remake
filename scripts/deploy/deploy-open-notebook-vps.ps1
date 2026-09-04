<#
.SYNOPSIS
    Body Harmony - Deploy Open Notebook + QwenProxy to Dedicated VPS (PLAN-108)
#>

param(
    [switch]$SkipTransfer,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
$OpenNotebookRoot = "F:\Organizado\01_IA_AGENTES\open-notebook"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DEPLOY OPEN NOTEBOOK + QWEN PROXY -> VPS DEDICADA      " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Load SSH Config
$EnvFile = "$ProjectRoot\.env.deploy"
if (-not (Test-Path $EnvFile)) {
    Write-Error "CRITICAL: .env.deploy not found!"
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
$RemotePath = "/opt/open-notebook"
$TargetDisplay = $SSHUser + "@" + $SSHHost + ":" + $SSHPort

Write-Host "Target: $TargetDisplay" -ForegroundColor Cyan
Write-Host "Remote Path: $RemotePath" -ForegroundColor Cyan

# Prepare SSH / SCP command arguments
$sshArgs = @("-p", $SSHPort, "-o", "StrictHostKeyChecking=no")
$scpArgs = @("-P", $SSHPort, "-o", "StrictHostKeyChecking=no")

if ($SSHKey -and (Test-Path $SSHKey)) {
    $sshArgs += @("-i", $SSHKey)
    $scpArgs += @("-i", $SSHKey)
}

$RemoteHostStr = $SSHUser + "@" + $SSHHost

# 2. Package & Transfer
if (-not $SkipTransfer) {
    Write-Host "`n[1/3] Packaging Open Notebook & QwenProxy..." -ForegroundColor Cyan
    $TempArchive = "$env:TEMP\open-notebook-deploy.tar.gz"
    if (Test-Path $TempArchive) { Remove-Item $TempArchive -Force }

    cmd.exe /c "tar -czf `"$TempArchive`" -C `"$OpenNotebookRoot`" --exclude=.git --exclude=node_modules --exclude=dist --exclude=.venv --exclude=surreal_data --exclude=notebook_data ."

    Write-Host "[2/3] Transferring archive to VPS via SCP..." -ForegroundColor Cyan
    # Ensure remote directory exists
    $mkdirCmd = "mkdir -p " + $RemotePath
    ssh @sshArgs $RemoteHostStr $mkdirCmd

    # Copy archive
    $remoteTarPath = $RemoteHostStr + ":" + $RemotePath + "/deploy.tar.gz"
    scp @scpArgs "$TempArchive" $remoteTarPath

    # Extract on remote
    Write-Host "Extracting archive on remote VPS..." -ForegroundColor Gray
    $extractCmd = "cd " + $RemotePath + " && tar -xzf deploy.tar.gz && rm deploy.tar.gz"
    ssh @sshArgs $RemoteHostStr $extractCmd

    Remove-Item $TempArchive -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Files transferred successfully!" -ForegroundColor Green
}

# 3. Docker Compose Up & Healthcheck
Write-Host "`n[3/3] Starting Docker Compose Stack on VPS..." -ForegroundColor Cyan
$buildFlag = if ($SkipBuild) { "" } else { "--build" }
$startCmd = "cd " + $RemotePath + " && docker compose up -d " + $buildFlag + " && docker cp " + $RemotePath + "/api open_notebook_app:/app/ && docker cp " + $RemotePath + "/open_notebook open_notebook_app:/app/ && docker restart open_notebook_app"
Write-Host "Executing on VPS: $startCmd" -ForegroundColor Gray
ssh @sshArgs $RemoteHostStr $startCmd

Write-Host "`nWaiting 10s for containers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Remote Healthcheck
Write-Host "`nChecking Container Status on VPS..." -ForegroundColor Cyan
$statusCmd = "docker ps --filter 'name=open_notebook' --format 'table {{.Names}}	{{.Status}}	{{.Ports}}'"
ssh @sshArgs $RemoteHostStr $statusCmd

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "      DEPLOY COMPLETO & SERVICOS ATIVOS NA VPS!           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
