<#
.SYNOPSIS
    Body Harmony - Production Auto-Deploy Script
.DESCRIPTION
    Automates Build -> Clean -> Sync to Hostinger via WinSCP.
#>

param (
    [string]$Target = "Production",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\..\.."
$WinSCP = "C:\Program Files (x86)\WinSCP\WinSCP.com"

if (-not (Test-Path $WinSCP)) {
    $WinSCP = "WinSCP.com"
}

# --- HOSTINGER API INTEGRATION (NEXUS V3.1) ---
$HelperPath = "$PSScriptRoot\Scripts\Hostinger-API.ps1"
if (Test-Path $HelperPath) {
    try {
        . $HelperPath
        Write-Host "Hostinger API Automation Helper loaded successfully." -ForegroundColor Cyan
    }
    catch {
        Write-Warning "Failed to load Hostinger API Automation Helper: $_"
    }
}

Write-Host "================================"
Write-Host "   DEPLOY PIPELINE: BODY HARMONY"
Write-Host "================================"

# --- 1. FRONTEND BUILD ---
if (-not $SkipBuild) {
    Write-Host "[1/3] Compiling Frontend (React/Vite)..."
    Push-Location "$ProjectRoot\apps\web-app"
    try {
        Write-Host "Running 'npm run build:release'..."
        cmd /c "npm run build:release"
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE."
        }
    }
    catch {
        Write-Error "Critical Build Failure. Deploy aborted. Details: $_"
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "Build success."
}
else {
    Write-Host "[1/3] Skipping build as requested."
}

# --- 2. CLEANUP ---
Write-Host "[2/3] Cleaning dist directory (maps and logs)..."
$BuildDir = "$ProjectRoot\apps\web-app\build\public_html"

if (Test-Path $BuildDir) {
    Get-ChildItem -Path $BuildDir -Filter "*.map" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force
    Get-ChildItem -Path $BuildDir -Filter "*.log" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force
    Write-Host "Sensitive files removed."
}
else {
    Write-Error "Build directory not found at: $BuildDir"
    exit 1
}

# --- 3. FTP SYNC ---
Write-Host "[3/3] Syncing with Hostinger..."

$EnvFile = "$ProjectRoot\.env.deploy"

if (-not (Test-Path $EnvFile)) {
    Write-Error "CRITICAL: .env.deploy not found. Cannot auth FTP."
    exit 1
}

$Config = @{}
Get-Content $EnvFile | Where-Object { $_ -match "^[^#].+=" } | ForEach-Object {
    $parts = $_ -split '=', 2
    $Config[$parts[0].Trim()] = $parts[1].Trim()
}

# Pre-Deploy Snapshot Hook (Hostinger API)
if ($Config.ContainsKey("HOSTINGER_VPS_ID") -and $Config["HOSTINGER_VPS_ID"]) {
    $VpsId = $Config["HOSTINGER_VPS_ID"]
    Write-Host "VPS ID detected: $VpsId. Triggering pre-deploy safety snapshot..." -ForegroundColor Cyan
    try {
        $SnapshotResult = Create-HostingerVPSSnapshot -VirtualMachineId $VpsId
        if ($SnapshotResult) {
            Write-Host "Pre-deploy safety snapshot initiated successfully!" -ForegroundColor Green
        }
    }
    catch {
        Write-Warning "Could not trigger VPS snapshot: $_. Proceeding with deployment..."
    }
}

$FtpProtocol = $Config["FTP_PROTOCOL"]
$FtpUser = $Config["FTP_USER"]
$FtpPassEnc = [Uri]::EscapeDataString($Config["FTP_PASS"])
$FtpHost = $Config["FTP_HOST"]
$FtpPort = $Config["FTP_PORT"]
$FtpRoot = $Config["FTP_REMOTE_ROOT"]

$ScriptFile = "$ProjectRoot\winscp_sync.txt"
$Excludes = "| .git/; .env; .env.deploy; /private_uploads/; /uploads/; /api/logs/; node_modules/; *.log; *.map; /tmp/; /ttfontdata/; /vendor/mpdf/mpdf/ttfonts/; *.filepart; *.in.*; /bot.bodyharmony.com.br/; /.ftpquota/"

$WinSCPScriptContent = @"
option batch continue
option confirm off
open ${FtpProtocol}://${FtpUser}:${FtpPassEnc}@${FtpHost}:${FtpPort}/ -timeout=300 -passive=on
rm /*/.in.*
rm /assets/.in.*
rm /api/v1/.in.*
option batch abort
synchronize remote -filemask="$Excludes" "$BuildDir" "/"
exit
"@

Set-Content -Path $ScriptFile -Value $WinSCPScriptContent -Encoding UTF8

try {
    Write-Host "Syncing files (winscp)..."
    & $WinSCP /script="$ScriptFile" /log="$ProjectRoot\logs\deploy.log" /loglevel=0
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Server-Side Sync completed!"
    }
    else {
        throw "WinSCP returned error. Check logs/deploy.log"
    }
}
catch {
    Write-Error "FTP Upload failed. Details: $_"
    exit 1
}
finally {
    if (Test-Path $ScriptFile) { Remove-Item $ScriptFile -Force }
}

# --- 4. SMOKE TEST (SPA & BUNDLE INTEGRITY) ---
Write-Host "Performing Deep Smoke Test..." -ForegroundColor Cyan
try {
    Start-Sleep -Seconds 2
    
    # 1. Validar Backend API
    $ApiUrl = "https://bodyharmony.com.br/api/v1/ping"
    $ApiResp = Invoke-WebRequest -Uri $ApiUrl -UseBasicParsing -TimeoutSec 10
    if ($ApiResp.StatusCode -ne 200) {
        throw "Backend API Ping returned status $($ApiResp.StatusCode)"
    }
    Write-Host "   ✅ Backend API is reachable (200 OK)" -ForegroundColor Green

    # 2. Validar Frontend SPA & Module Script Integrity
    $FrontUrl = "https://bodyharmony.com.br"
    $FrontResp = Invoke-WebRequest -Uri $FrontUrl -UseBasicParsing -TimeoutSec 10
    if ($FrontResp.StatusCode -ne 200) {
        throw "Frontend root returned status $($FrontResp.StatusCode)"
    }

    $JsMatch = [regex]::Match($FrontResp.Content, 'src="/assets/(index-[^"]+\.js)"')
    if (-not $JsMatch.Success) {
        throw "Could not find index-[hash].js entry in production index.html!"
    }

    $JsFile = $JsMatch.Groups[1].Value
    $JsUrl = "https://bodyharmony.com.br/assets/$JsFile"
    $JsResp = Invoke-WebRequest -Uri $JsUrl -UseBasicParsing -TimeoutSec 10

    if ($JsResp.StatusCode -ne 200) {
        throw "JS Bundle $JsFile returned status $($JsResp.StatusCode)"
    }
    if ($JsResp.Headers['Content-Type'] -notmatch 'javascript') {
        throw "JS Bundle $JsFile returned invalid MIME type '$($JsResp.Headers['Content-Type'])'! (SPA 404 rewrite detected)"
    }
    if ($JsResp.Content.TrimStart().StartsWith("<!doctype html", [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "JS Bundle $JsFile returned HTML instead of JavaScript code!"
    }

    Write-Host "   ✅ SPA Entry ($JsFile) validated: 200 OK with valid JavaScript MIME type ($($JsResp.Content.Length) bytes)" -ForegroundColor Green

    # 3. Validar Endpoint de Assinatura e Contratos
    $ContractPingUrl = "https://bodyharmony.com.br/api/v1/contracts/sign.php"
    $ContractResp = Invoke-WebRequest -Uri $ContractPingUrl -Method GET -UseBasicParsing -TimeoutSec 10 -SkipHttpErrorCheck
    if ($ContractResp.StatusCode -eq 400 -or $ContractResp.StatusCode -eq 200) {
        Write-Host "   ✅ Digital Contract & Terms Signing Engine: 200/400 (Online & Functional)" -ForegroundColor Green
    } else {
        throw "Digital Contract Signing Engine returned unexpected status $($ContractResp.StatusCode)"
    }
}
catch {
    Write-Error "❌ Smoke Test CRITICAL FAILURE: $($_.Exception.Message)"
    exit 1
}

Write-Host "DEPLOYMENT COMPLETE!"
Write-Host "Changes are live."
