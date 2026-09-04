# scripts/db-export.ps1
# Exporta o banco de dados do Docker para arquivo SQL limpo (Deploy Hostinger)

$ErrorActionPreference = "Stop"
$ContainerName = "infrastructure-db-1"
$DbName = "body_harmony_db"
$ExportPath = "infrastructure/database/database_master_v1.sql"

Write-Host "?? Iniciando Export do Banco de Dados..." -ForegroundColor Cyan

# Verificar se container esta rodando
if (!(docker ps -q -f name=$ContainerName)) {
    Write-Error "Container $ContainerName nao encontrado ou parado. Rode db-docker-rebuild.ps1 primeiro."
}

# Executar Dump
Write-Host "?? Exportando $DbName..." -ForegroundColor Yellow
# Nota: Adicionamos --no-tablespaces para compatibilidade e definimos charset explícito
cmd /c "docker exec $ContainerName mysqldump -u root -proot --hex-blob --default-character-set=utf8mb4 --no-tablespaces $DbName > $ExportPath"

if (Test-Path $ExportPath) {
    $size = (Get-Item $ExportPath).Length / 1KB
    Write-Host "? Export concluido: $ExportPath" -ForegroundColor Green
    Write-Host "?? Tamanho: $([math]::Round($size, 2)) KB" -ForegroundColor Green
    Write-Host "?? PRONTO PARA DEPLOY NA HOSTINGER!" -ForegroundColor Cyan
}
else {
    Write-Error "Falha ao criar arquivo de exportacao."
}
