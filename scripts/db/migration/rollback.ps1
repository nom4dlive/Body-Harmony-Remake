# scripts/db/migration/rollback.ps1
# Restores database from a specific SQL file (snapshot)

param(
    [Parameter(Mandatory = $true)]
    [string]$SnapshotFile
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $SnapshotFile)) {
    throw "Snapshot file not found: $SnapshotFile"
}

Write-Host "?? ROLLING BACK DATABASE..." -ForegroundColor Red
Write-Host "Target: $SnapshotFile" -ForegroundColor Yellow

$Confirm = Read-Host "Are you sure? This will OVERWRITE the current database data (y/n)"
if ($Confirm -ne 'y') {
    Write-Host "Aborted." -ForegroundColor Gray
    exit
}

# Restore Command
try {
    Get-Content $SnapshotFile | docker exec -i infrastructure-db-1 mysql -u root -proot body_harmony_db
    Write-Host "? Rollback complete." -ForegroundColor Green
}
catch {
    Write-Error "Rollback failed: $_"
}
