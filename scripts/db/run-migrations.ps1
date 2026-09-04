# scripts/run-migrations.ps1
param(
    [string]$envPath = "apps/web-app/src/backend/.env"
)

Write-Host "?? Iniciando Migrations Body Harmony..." -ForegroundColor Cyan

if (!(Test-Path $envPath)) {
    Write-Error "Faltando arquivo .env em $envPath"
    return
}

# Auto-load .env
$envContent = Get-Content $envPath
foreach ($line in $envContent) {
    if ($line -match "^([^#].*?)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($name, $value)
    }
}

$dbHost = [System.Environment]::GetEnvironmentVariable("DB_HOST")
$dbName = [System.Environment]::GetEnvironmentVariable("DB_NAME")
$dbUser = [System.Environment]::GetEnvironmentVariable("DB_USER")
$dbPass = [System.Environment]::GetEnvironmentVariable("DB_PASS")

$migrationPath = "apps/web-app/src/backend/migrations"
if (!(Test-Path $migrationPath)) { New-Item -ItemType Directory -Path $migrationPath }

$files = Get-ChildItem "$migrationPath/*.sql" | Sort-Object Name

# Check migration_history (requires mysql cli)
# We assume mysql is in path for local dev usage
foreach ($file in $files) {
    Write-Host "? Aplicando migration: $($file.Name)..." -ForegroundColor Yellow
    # Simulating execution via CLI for now or just checking if we can run it
    try {
        mysql -h $dbHost -u $dbUser "-p$dbPass" $dbName -e "source $($file.FullName)"
        Write-Host "? Migration $($file.Name) aplicada!" -ForegroundColor Green
    }
    catch {
        Write-Error "Falha ao aplicar migration $($file.Name): $_"
    }
}

Write-Host "? Processo concludo." -ForegroundColor Cyan
