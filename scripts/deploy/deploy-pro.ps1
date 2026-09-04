<#
.SYNOPSIS
    Body Harmony - Production Deployment Script (Secure & Smart)
    Version: 2.0 (Nexus Protocols)

.DESCRIPTION
    Automates the build and deployment process to Hostinger via WinSCP.
    Features:
    - Zero-Knowledge (Credentials loaded from .env.deploy)
    - Build Verification (Checks for critical artifacts)
    - Smart Sync (Exclude sensitive files, Mirror mode)
    - Smoke Test (Health check post-deploy)

.EXAMPLE
    .\deploy-pro.ps1 -Target Production
#>

param (
    [string]$Target = "Production",
    [switch]$SkipBuild,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\..\.."

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     BODY HARMONY - HOSTINGER PREMIUM DEPLOY PIPELINE     " -ForegroundColor Yellow
Write-Host "  Target: Hostinger Premium (Hospedagem Compartilhada Brasil) " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# --- 1. CONFIGURATION LOAD ---
Write-Host "[1/5] Loading Secure Configuration..." -ForegroundColor Cyan
$EnvFile = "$ProjectRoot\.env.deploy"

if (-not (Test-Path $EnvFile)) {
    Write-Error "CRITICAL: .env.deploy not found! Create it with FTP_* variables."
    exit 1
}

$Config = @{}
Get-Content $EnvFile | Where-Object { $_ -match "^[^#].+=" } | ForEach-Object {
    $parts = $_ -split '=', 2
    $Config[$parts[0].Trim()] = $parts[1].Trim()
}

$RequiredVars = @("FTP_HOST", "FTP_USER", "FTP_PASS")
foreach ($var in $RequiredVars) {
    if (-not $Config.ContainsKey($var)) {
        Write-Error "Missing config: $var"
        exit 1
    }
}

# WinSCP Detection
$WinSCP = if ($Config.ContainsKey("WINSCP_PATH")) { $Config["WINSCP_PATH"] } else { "C:\Program Files (x86)\WinSCP\WinSCP.com" }
if (-not (Test-Path $WinSCP)) {

    # Try global path
    $WinSCP = "WinSCP.com"
    if (-not (Get-Command $WinSCP -ErrorAction SilentlyContinue)) {
        Write-Error "WinSCP not found. Install it or set WINSCP_PATH in .env.deploy"
        exit 1
    }
}

# --- 2. BUILD PROCESS ---
if (-not $SkipBuild) {
    Write-Host "[2/5] Building Release Vite and PHP Packaging..." -ForegroundColor Cyan


    Push-Location "$ProjectRoot\apps\web-app"
    
    # Run the build script
    cmd /c "npm run build:release"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build Failed! Aborting deployment."
        exit 1
    }
    Pop-Location
}
else {
    Write-Host "⏩ Skipping Build..." -ForegroundColor Yellow
}

# --- 3. VERIFICATION ---
Write-Host "[3/5] Verifying Artifacts..." -ForegroundColor Cyan
$BuildDir = "$ProjectRoot\apps\web-app\build\public_html"
Write-Host "   [DIR] Build Directory: $BuildDir" -ForegroundColor Yellow
$CriticalFiles = @(

    "index.html",
    "api\index.php",
    "assets",
    ".htaccess"
)

foreach ($file in $CriticalFiles) {
    if ([string]::IsNullOrWhiteSpace($file)) { continue }
    $FullPath = Join-Path $BuildDir $file
    if (-not (Test-Path -Path $FullPath)) {
        Write-Error "Missing critical artifact: $file ($FullPath)"
        exit 1
    }
}
Write-Host "   ✅ Artifacts Validated." -ForegroundColor Green

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

# --- 4. DEPLOYMENT (WinSCP) ---
Write-Host "[4/5] Syncing to Hostinger ($($Config["FTP_HOST"]))..." -ForegroundColor Cyan

$ScriptFile = "$ProjectRoot\winscp_sync_script.txt"
$RemotePath = $Config["FTP_REMOTE_ROOT"]
if ([string]::IsNullOrWhiteSpace($RemotePath)) { $RemotePath = "/" }

# Exclusions: .git, .env (security), node_modules, logs, UPLOADS (CRITICAL!)
$excludes = "| .git/; .env; .env.deploy; /private_uploads/; /uploads/; /api/logs/; node_modules/; *.log; *.map; /tmp/; /ttfontdata/; /vendor/mpdf/mpdf/ttfonts/; *.filepart; *.in.*; /public_html/; /domains/; /bot.bodyharmony.com.br/; /.ftpquota/"

$FtpProtocol = $Config["FTP_PROTOCOL"]
$FtpUser = $Config["FTP_USER"]
$FtpPassEnc = [Uri]::EscapeDataString($Config["FTP_PASS"])
$FtpHost = $Config["FTP_HOST"]
$FtpPort = $Config["FTP_PORT"]
$WinSCPScriptContent = "option batch continue`noption confirm off`nopen ${FtpProtocol}://${FtpUser}:${FtpPassEnc}@${FtpHost}:${FtpPort}/ -hostkey=*`nsynchronize remote -delete -filemask=""$excludes"" ""$BuildDir"" ""$RemotePath""`nexit"

Set-Content -Path $ScriptFile -Value $WinSCPScriptContent -Encoding UTF8

try {
    & $WinSCP /script="$ScriptFile" /log="$ProjectRoot\logs\deploy.log" /loglevel=0
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Sync Completed Successfully!" -ForegroundColor Green
    }
    else {
        Write-Error "   ❌ Sync Failed! Check logs\deploy.log"
        exit 1
    }
}
finally {
    if (Test-Path $ScriptFile) { Remove-Item $ScriptFile -Force }
}

# --- 5. SMOKE TEST (SPA & BUNDLE INTEGRITY) ---
Write-Host "[5/5] Performing Deep Smoke Test..." -ForegroundColor Cyan
try {
    Start-Sleep -Seconds 3
    
    function Invoke-RobustRequest ($url) {
        $attempts = 0
        while ($attempts -lt 3) {
            $attempts++
            try {
                return Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 12
            } catch {
                if ($attempts -ge 3) { throw $_ }
                Start-Sleep -Seconds 2
            }
        }
    }

    # 1. Validar Backend API
    $ApiUrl = "https://bodyharmony.com.br/api/v1/ping"
    $ApiResp = Invoke-RobustRequest $ApiUrl
    if ($ApiResp.StatusCode -ne 200) {
        throw "Backend API Ping returned status $($ApiResp.StatusCode)"
    }
    Write-Host "   ✅ Backend API is reachable (200 OK)" -ForegroundColor Green

    # 2. Validar Frontend SPA & Module Script Integrity
    $FrontUrl = "https://bodyharmony.com.br"
    $FrontResp = Invoke-RobustRequest $FrontUrl
    if ($FrontResp.StatusCode -ne 200) {
        throw "Frontend root returned status $($FrontResp.StatusCode)"
    }

    $JsMatch = [regex]::Match($FrontResp.Content, 'src="/assets/(index-[^"]+\.js)"')
    if (-not $JsMatch.Success) {
        throw "Could not find index-[hash].js entry in production index.html!"
    }

    $JsFile = $JsMatch.Groups[1].Value
    $JsUrl = "https://bodyharmony.com.br/assets/$JsFile"
    $JsResp = Invoke-RobustRequest $JsUrl

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

    # 3. Validar Anti-Cache Policy no index.html
    $CacheHeader = $FrontResp.Headers['Cache-Control']
    if ($CacheHeader) {
        Write-Host "   ✅ Anti-Cache Policy (index.html) active: $CacheHeader" -ForegroundColor Green
    }

    # 4. Validar Endpoint de Saúde LMS & SmartBook AI (Rota ativa e protegida por Auth Guard)
    $AiStatusUrl = "https://bodyharmony.com.br/api/v1/admin/lms/notebook/auth/status"
    try {
        $AiResp = Invoke-RobustRequest $AiStatusUrl
        if ($AiResp.StatusCode -eq 200) {
            Write-Host "   ✅ SmartBook AI Hub API is operational (200 OK)" -ForegroundColor Green
        }
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        if ($resp -and ($resp.StatusCode.value__ -eq 401 -or $resp.StatusCode.value__ -eq 200)) {
            Write-Host "   ✅ SmartBook AI Hub API route is active and secured (401 Auth Guard Active)" -ForegroundColor Green
        } else {
            throw $_
        }
    }
}
catch {
    Write-Error "❌ Smoke Test CRITICAL FAILURE: $($_.Exception.Message)"
    exit 1
}

Write-Host "`nDEPLOYMENT FINISHED SUCCESSFULLY!" -ForegroundColor Green

