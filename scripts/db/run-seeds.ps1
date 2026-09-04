# scripts/run-seeds.ps1
param(
    [string]$envPath = "apps/web-app/src/backend/.env"
)

Write-Host "?? Iniciando Seeds Body Harmony..." -ForegroundColor Cyan

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

if ($dbName -eq "u388974772_bodyharmony2") {
    $dbName = "body_harmony_db"
}

$seedPath = "apps/web-app/src/backend/seeds"
if (!(Test-Path $seedPath)) { New-Item -ItemType Directory -Path $seedPath }

$files = Get-ChildItem "$seedPath/*.sql" | Sort-Object Name

foreach ($file in $files) {
    Write-Host "? Aplicando seed: $($file.Name)..." -ForegroundColor Yellow
    try {
        # Using docker exec to run mysql inside the container
        $RepoRoot = Resolve-Path "$PSScriptRoot\..\.."
        $ComposeFile = "$RepoRoot\infrastructure\docker-compose.yml"
        $relPath = "src/backend/seeds/$($file.Name)"
        
        Write-Host "   Running inside container..." -ForegroundColor DarkGray
        $FilePath = $file.FullName
        cmd /c "docker-compose -f $ComposeFile exec -T db mysql -u root -proot $dbName < `"$FilePath`""
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Seed $($file.Name) aplicado!" -ForegroundColor Green
        }
        else {
            throw "MySQL exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Error "Falha ao aplicar seed $($file.Name): $_"
    }
}

Write-Host "🚀 Processo concluído." -ForegroundColor Cyan
