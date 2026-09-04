<#
.SYNOPSIS
    Body Harmony - Uploads Synchronization Tool
.DESCRIPTION
    Synchronizes local licensing photos under /uploads/licenciadas/ to Hostinger.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
$WinSCP = "C:\Program Files (x86)\WinSCP\WinSCP.com"

if (-not (Test-Path $WinSCP)) {
    $WinSCP = "WinSCP.com"
}

Write-Host "=============================================="
Write-Host "   UPLOADS SYNC PIPELINE: BODY HARMONY"
Write-Host "=============================================="

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

$FtpProtocol = $Config["FTP_PROTOCOL"]
$FtpUser = $Config["FTP_USER"]
$FtpPassEnc = [Uri]::EscapeDataString($Config["FTP_PASS"])
$FtpHost = $Config["FTP_HOST"]
$FtpPort = $Config["FTP_PORT"]

$LocalUploadDir = "$ProjectRoot\apps\web-app\src\backend\uploads\licenciadas"
$RemoteUploadDir = "/uploads/licenciadas"

if (-not (Test-Path $LocalUploadDir)) {
    Write-Error "Local upload dir not found at: $LocalUploadDir"
    exit 1
}

Write-Host "Local Directory: $LocalUploadDir"
Write-Host "Remote Directory: $RemoteUploadDir"
Write-Host "Sincronizando fotos de licenciadas para Hostinger..." -ForegroundColor Cyan

$ScriptFile = "$ProjectRoot\winscp_uploads_sync.txt"

# Usamos a opção de sincronização em WinSCP (local -> remote)
# Não deletamos arquivos no destino (-delete switch é omitido)
$WinSCPScriptContent = @"
option batch continue
option confirm off
open ${FtpProtocol}://${FtpUser}:${FtpPassEnc}@${FtpHost}:${FtpPort}/ -timeout=300 -passive=on
synchronize remote "$LocalUploadDir" "$RemoteUploadDir"
exit
"@

Set-Content -Path $ScriptFile -Value $WinSCPScriptContent -Encoding UTF8

try {
    Write-Host "Running WinSCP Uploads Sync..."
    & $WinSCP /script="$ScriptFile" /log="$ProjectRoot\logs\uploads_sync.log" /loglevel=0
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Uploads Synchronization completed successfully!" -ForegroundColor Green
    }
    else {
        throw "WinSCP returned error. Check logs/uploads_sync.log"
    }
}
catch {
    Write-Error "WinSCP Upload failed. Details: $_"
    exit 1
}
finally {
    if (Test-Path $ScriptFile) { Remove-Item $ScriptFile -Force }
}
