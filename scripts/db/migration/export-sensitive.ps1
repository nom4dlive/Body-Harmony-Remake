# scripts/db/migration/export-sensitive.ps1
# Exports sensitive data (Users, Progress, Logs) to SQL for Hostinger Import

param(
    [string]$OutputPath = "infrastructure/database/migrations/sensitive_data_$(Get-Date -Format 'yyyyMMdd_HHmm').sql"
)

$ErrorActionPreference = "Stop"

Write-Host "?? EXPORTING SENSITIVE DATA FOR HOSTINGER..." -ForegroundColor Cyan

# Ensure directory exists
$Dir = Split-Path $OutputPath -Parent
if (!(Test-Path $Dir)) {
    New-Item -ItemType Directory -Path $Dir -Force | Out-Null
}

# Tables to export (Data Only)
$Tables = @("students", "student_devices", "lms_progress", "lms_quiz_attempts", "lms_certificates", "lms_user_badges", "lms_points_log", "audit_logs", "leads", "results")

# Export Command
# --no-create-info: Data only
# --complete-insert: Better compatibility
# --hex-blob: For binary data
# --skip-triggers: Hostinger might have different trigger perms
$Cmd = "docker exec infrastructure-db-1 mysqldump -u root -proot body_harmony_db --no-create-info --complete-insert --hex-blob --skip-triggers " + ($Tables -join " ")

Write-Host "? Exporting tables: $($Tables -join ', ')..." -ForegroundColor Yellow

try {
    Invoke-Expression $Cmd | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Host "? Export success: $OutputPath" -ForegroundColor Green
}
catch {
    Write-Error "Failed to export data: $_"
}
