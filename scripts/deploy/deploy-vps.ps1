<#
.SYNOPSIS
    Body Harmony - Dedicated VPS Deployment Script (Secure, Fast & Native)
    Version: 3.1 (Nexus VPS Era)

.DESCRIPTION
    Automates building the React frontend, packaging PHP backend resources,
    and pushing updates to the dedicated Hostinger VPS using native SSH/SCP.
    Zero external dependencies required (No WinSCP needed).

.EXAMPLE
    .\deploy-vps.ps1
#>

param (
    [switch]$SkipBuild,
    [switch]$ForceRebuildDocker
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         BODY HARMONY - VPS DEPLOY PIPELINE V3.1          " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🛑 ATENÇÃO: Este script atualiza APENAS a infraestrutura  " -ForegroundColor Red
Write-Host " de streaming de vídeo LMS, logs remotos e failover na VPS  " -ForegroundColor Red
Write-Host " DEDICADA. O portal principal em bodyharmony.com.br NÃO é  " -ForegroundColor Red
Write-Host " afetado por este deploy (use deploy-pro.ps1 para o site). " -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Cyan

# --- 1. CONFIGURATION LOAD ---
Write-Host "[1/6] Loading VPS Deployment Configuration..." -ForegroundColor Cyan
$EnvFile = "$ProjectRoot\.env.deploy"

if (-not (Test-Path $EnvFile)) {
    Write-Error "CRITICAL: .env.deploy not found! Create it with VPS_SSH_* variables."
    exit 1
}

$Config = @{}
Get-Content $EnvFile | Where-Object { $_ -match "^[^#].+=" } | ForEach-Object {
    $parts = $_ -split '=', 2
    $Config[$parts[0].Trim()] = $parts[1].Trim()
}

# Required SSH variables for VPS deployment
$RequiredVars = @("VPS_SSH_HOST", "VPS_SSH_USER")
foreach ($var in $RequiredVars) {
    if (-not $Config.ContainsKey($var)) {
        Write-Error "Missing critical config variable in .env.deploy: $var"
        exit 1
    }
}

$SSHHost = $Config["VPS_SSH_HOST"]
$SSHUser = $Config["VPS_SSH_USER"]
$SSHPort = if ($Config.ContainsKey("VPS_SSH_PORT")) { $Config["VPS_SSH_PORT"] } else { "22" }
$RemoteRoot = if ($Config.ContainsKey("VPS_REMOTE_ROOT")) { $Config["VPS_REMOTE_ROOT"] } else { "/opt/bodyharmony" }

# Native SSH/SCP Arguments Array Setup (Quoting-Safe)
$SSHArgs = @("-p", $SSHPort, "-o", "StrictHostKeyChecking=no", "-o", "BatchMode=yes")
$SCPArgs = @("-P", $SSHPort, "-o", "StrictHostKeyChecking=no", "-B")

if ($Config.ContainsKey("VPS_SSH_KEY") -and $Config["VPS_SSH_KEY"] -ne "") {
    $KeyPath = $Config["VPS_SSH_KEY"]
    if (Test-Path $KeyPath) {
        $SSHArgs += @("-i", $KeyPath)
        $SCPArgs += @("-i", $KeyPath)
        Write-Host "KEY Authenticating using Private Key: $KeyPath" -ForegroundColor Yellow
    } else {
        Write-Warning "SSH Key specified but not found at: $KeyPath. Trying default SSH config/agent."
    }
}

$SSHTarget = "${SSHUser}@${SSHHost}"

# --- 2. BUILD PROCESS ---
if (-not $SkipBuild) {
    Write-Host "[2/6] Building Production SPA React & Packaging PHP Resources..." -ForegroundColor Cyan
    Push-Location "$ProjectRoot\apps\web-app"
    
    # Run the release build process
    & cmd.exe /c "npm run build:release"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build Failed! Aborting deployment."
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "SUCCESS: SPA built successfully in apps/web-app/build/public_html" -ForegroundColor Green
} else {
    Write-Host "⏩ Skipping Build (SkipBuild requested)..." -ForegroundColor Yellow
}

# --- 3. VERIFY ARTIFACTS ---
Write-Host "[3/6] Verifying Local Artifacts..." -ForegroundColor Cyan
$BuildDir = "$ProjectRoot\apps\web-app\build\public_html"
$CriticalFiles = @("index.html", "api\index.php", "assets", ".htaccess")

foreach ($file in $CriticalFiles) {
    $FullPath = Join-Path $BuildDir $file
    if (-not (Test-Path -Path $FullPath)) {
        Write-Error "Missing critical artifact: $file ($FullPath). Run build or remove --skip-build."
        exit 1
    }
}
Write-Host "SUCCESS: Verification Complete: All critical artifacts present." -ForegroundColor Green

# --- 3b. SECURITY ANTI-LEAK SCAN ---
Write-Host "   [SEC] Scanning build directory for sensitive credentials..." -ForegroundColor Cyan
$PerilousPatterns = @(
    "*.key", "*.pem", "*.ppk",
    "*id_ed25519*", "*id_rsa*",
    "*rootpass*", "*passwd*",
    "*credentials*"
)
$FoundLeaks = @()
foreach ($pattern in $PerilousPatterns) {
    $leaks = Get-ChildItem -Path $BuildDir -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
    if ($leaks) {
        $FoundLeaks += $leaks
    }
}
if ($FoundLeaks.Count -gt 0) {
    Write-Host "`n[FATAL ERROR] SECURITY SCAN FAILED! Sensitive credential file(s) found in build directory:" -ForegroundColor Red
    foreach ($leak in $FoundLeaks) {
        Write-Host "   -> $($leak.FullName)" -ForegroundColor Red
    }
    Write-Error "CRITICAL: Deploy aborted to prevent credential leakage. Remove these files from $BuildDir."
    exit 1
}
Write-Host "   ✅ Security Scan Clean. No credentials found." -ForegroundColor Green

# --- 4. PREPARE REMOTE VPS DIRECTORIES ---
Write-Host "[4/6] Connecting to VPS to prepare folders at $RemoteRoot..." -ForegroundColor Cyan
$null | & ssh.exe @SSHArgs $SSHTarget "mkdir -p `"$RemoteRoot/public`" `"$RemoteRoot/api`" `"$RemoteRoot/infrastructure/nginx`" `"$RemoteRoot/private_uploads`""
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to connect or create remote directories on VPS."
    exit 1
}
Write-Host "SUCCESS: Remote folders ready." -ForegroundColor Green

# --- 5. TRANSFER FILES VIA SCP ---
Write-Host "[5/6] Syncing files to VPS using Compressed Tarballs..." -ForegroundColor Cyan

# 5.1 Docker Infrastructure
Write-Host "   Packaging and uploading Docker Infrastructure..." -ForegroundColor Yellow
$DockerTar = "$ProjectRoot\docker_infra.tar.gz"
if (Test-Path $DockerTar) { Remove-Item $DockerTar }
& tar.exe -czf $DockerTar -C "$ProjectRoot\infrastructure\docker" .
$null | & scp.exe @SCPArgs $DockerTar "${SSHTarget}:${RemoteRoot}/"
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to copy Docker tarball."; exit 1 }

$null | & ssh.exe @SSHArgs $SSHTarget "tar -xzf `"${RemoteRoot}/docker_infra.tar.gz`" -C `"${RemoteRoot}/infrastructure/`" && rm -f `"${RemoteRoot}/docker_infra.tar.gz`""
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to extract Docker tarball on VPS."; exit 1 }
Remove-Item $DockerTar

# 5.2 Nginx default.conf explicitly to nginx subfolder (guarantee)
$NginxConf = "$ProjectRoot\infrastructure\docker\nginx\default.conf"
$null | & scp.exe @SCPArgs $NginxConf "${SSHTarget}:${RemoteRoot}/infrastructure/nginx/"
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to copy Nginx config."; exit 1 }

# 5.3 Frontend Assets
Write-Host "   Packaging and uploading Frontend Assets..." -ForegroundColor Yellow
$FrontendTar = "$ProjectRoot\frontend.tar.gz"
if (Test-Path $FrontendTar) { Remove-Item $FrontendTar }
& tar.exe -czf $FrontendTar -C "$ProjectRoot\apps\web-app\build\public_html" .
$null | & scp.exe @SCPArgs $FrontendTar "${SSHTarget}:${RemoteRoot}/"
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to copy Frontend tarball."; exit 1 }

$null | & ssh.exe @SSHArgs $SSHTarget "tar -xzf `"${RemoteRoot}/frontend.tar.gz`" -C `"${RemoteRoot}/public/`" && rm -f `"${RemoteRoot}/frontend.tar.gz`""
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to extract Frontend tarball on VPS."; exit 1 }
Remove-Item $FrontendTar

# 5.4 Backend API
Write-Host "   Packaging and uploading Backend API Code..." -ForegroundColor Yellow
$BackendTar = "$ProjectRoot\backend.tar.gz"
if (Test-Path $BackendTar) { Remove-Item $BackendTar }
& tar.exe -czf $BackendTar -C "$ProjectRoot\apps\web-app\src\backend\api" .
$null | & scp.exe @SCPArgs $BackendTar "${SSHTarget}:${RemoteRoot}/"
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to copy Backend tarball."; exit 1 }

$null | & ssh.exe @SSHArgs $SSHTarget "tar -xzf `"${RemoteRoot}/backend.tar.gz`" -C `"${RemoteRoot}/api/`" && rm -f `"${RemoteRoot}/backend.tar.gz`""
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to extract Backend tarball on VPS."; exit 1 }
Remove-Item $BackendTar

Write-Host "SUCCESS: All assets successfully transferred and extracted on VPS." -ForegroundColor Green

# --- 6. ORCHESTRATE CONTAINER REBUILD ---
Write-Host "[6/6] Orchestrating Docker containers on VPS..." -ForegroundColor Cyan

$DockerComposeCmd = "cd `"$RemoteRoot/infrastructure`" && docker compose down"
if ($ForceRebuildDocker) {
    $DockerComposeCmd += " && docker compose up -d --build"
} else {
    $DockerComposeCmd += " && docker compose up -d"
}

Write-Host "   Executing docker compose recreation..." -ForegroundColor Yellow
$null | & ssh.exe @SSHArgs $SSHTarget $DockerComposeCmd
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to orchestrate docker containers on remote VPS."
    exit 1
}

# --- 7. POST-DEPLOY SANITY HEALTH CHECK ---
Write-Host "[7/7] Executing post-deploy sanity check..." -ForegroundColor Cyan
Write-Host "   Waiting 15 seconds for containers to stabilize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

$SelfHealingScript = Join-Path $PSScriptRoot "Scripts\self-healing.ps1"
if (Test-Path $SelfHealingScript) {
    Write-Host "   Running self-healing checks in Check-Only mode..." -ForegroundColor Yellow
    & $SelfHealingScript -CheckOnly
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "⚠️ Post-deploy sanity checks failed! Check the telemetry output above."
    } else {
        Write-Host "✅ Post-deploy sanity check passed: All containers are healthy!" -ForegroundColor Green
    }
} else {
    Write-Warning "Self-healing script not found at: $SelfHealingScript. Skipping post-deploy check."
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "          VPS DEPLOYMENT COMPLETED SUCCESSFULLY!          " -ForegroundColor Yellow
Write-Host " Dominio: https://$SSHHost (ou seu dominio customizado)" -ForegroundColor Yellow
Write-Host " Active VPS Stack: Nginx + PHP 8.4-FPM + MySQL 8.4" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
