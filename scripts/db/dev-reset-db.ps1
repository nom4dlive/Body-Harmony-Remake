<#
.SYNOPSIS
    Automates the Full Database Reset and Photo Sync for the Local Docker Environment.
.DESCRIPTION
    1. Copies photos from 'zz-referencias-site-antigo' to 'public_html/api/uploads/photos'.
    2. Imports 'FULL_DATABASE_RESET_V4.sql' into the running Docker MySQL container.
    3. Verifies the row count in the 'students' table.
.EXAMPLE
    ./dev-reset-db.ps1
#>

Write-Host "🔄 [1/3] Syncing Photos from References..." -ForegroundColor Cyan
# Paths relative to scripts/db/
$RepoRoot = Resolve-Path "$PSScriptRoot\..\.."
$Source = "$RepoRoot\apps\web-app\public\uploads\photos\*"
$Dest = "$RepoRoot\apps\web-app\public_html\api\uploads\photos"
$ComposeFile = "$RepoRoot\infrastructure\docker-compose.yml"

if (!(Test-Path $Dest)) {
    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
}

Copy-Item -Path $Source -Destination $Dest -Force
Write-Host "✅ Photos Synced." -ForegroundColor Green

# Start Wait-DB Logic
Write-Host "⏳ Waiting for Database to be ready..." -ForegroundColor Cyan
$MaxRetries = 30
$RetryCount = 0
$DBReady = $false

while (-not $DBReady -and $RetryCount -lt $MaxRetries) {
    try {
        $Ping = docker-compose -f $ComposeFile exec -T db mysqladmin -u root -proot ping --silent
        if ($LASTEXITCODE -eq 0) {
            $DBReady = $true
            Write-Host "✅ Database is ready!" -ForegroundColor Green
        }
        else {
            throw "Ping failed"
        }
    }
    catch {
        Write-Host "   Waiting... ($RetryCount/$MaxRetries)" -ForegroundColor DarkGray
        Start-Sleep -Seconds 2
        $RetryCount++
    }
}

if (-not $DBReady) {
    Write-Error "❌ Database failed to start in time."
    exit 1
}
# End Wait-DB Logic

$DBName = "body_harmony_db" # Default for Docker

Write-Host "🔄 [2/3] Resetting Database (Importing V4)..." -ForegroundColor Cyan
# Using cmd /c hack to bypass PowerShell redirection issues with <
cmd /c "docker-compose -f $ComposeFile exec -T -e LANG=C.UTF-8 db mysql -u root -proot $DBName < $RepoRoot\infrastructure\database\consolidated_init.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database Reset Successfully." -ForegroundColor Green
}
else {
    Write-Host "❌ Database Reset Failed." -ForegroundColor Red
    exit 1
}

Write-Host "🔄 [3/3] Verifying Data..." -ForegroundColor Cyan
Invoke-Expression "docker-compose -f $ComposeFile exec -T db mysql -u root -proot $DBName -e 'SELECT count(*) as Total_Students FROM students;'"

Write-Host "🔄 [4/4] Verifying API Connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/students.php" -Method Get
    if ($response.students.Count -eq 38) {
        Write-Host "✅ API Verified: Returning 38 Students." -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ API Warning: Returned $($response.students.Count) students (Expected 38)." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ API Verification Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🚀 Done! Local environment updated." -ForegroundColor Green
Write-Host "👉 Test URL: http://localhost:8080/licenciadas" -ForegroundColor Yellow
