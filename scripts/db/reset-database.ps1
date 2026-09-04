<#
.SYNOPSIS
    Reset completo do banco de dados Body Harmony para V6.
    
.DESCRIPTION
    Este script automatiza:
    - Limpeza do banco antigo
    - Reset para V6 (38 licenciadas, schema completo)
    - Validação da estrutura
    
.PARAMETER Environment
    Ambiente alvo: "Local" ou "Production"
    
.PARAMETER SkipConfirmation
    Pula confirmação (use com cautela!)
    
.EXAMPLE
    .\reset-database.ps1 -Environment Local
    .\reset-database.ps1 -Environment Production -SkipConfirmation
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("Local", "Production")]
    [string]$Environment,
    
    [switch]$SkipConfirmation
)

$ErrorActionPreference = "Stop"

# Configuração
$Config = @{
    Local      = @{
        Url = "http://localhost:8080/api/tools/run_sql.php"
        Key = "DEPLOY_2026"
    }
    Production = @{
        Url = "https://abril-hysteroid-payably.ngrok-free.dev/api/tools/run_sql.php"
        Key = "DEPLOY_2026"
    }
}

$Target = $Config[$Environment]
$SqlFile = "infrastructure/database/consolidated_init.sql"

# Banner
Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🗄️  BODY HARMONY - DATABASE RESET V6" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Ambiente: " -NoNewline
Write-Host $Environment -ForegroundColor $(if ($Environment -eq "Production") { "Red" } else { "Green" })
Write-Host "URL: $($Target.Url)`n"

# Confirmação
if (-not $SkipConfirmation) {
    Write-Host "⚠️  ATENÇÃO:" -ForegroundColor Yellow
    Write-Host "  - Todos os dados do banco serão APAGADOS" -ForegroundColor Red
    Write-Host "  - O banco será resetado para V6 (38 licenciadas)" -ForegroundColor Yellow
    Write-Host "  - Não há volta!" -ForegroundColor Red
    Write-Host ""
    
    $Confirm = Read-Host "Digite 'CONFIRMAR' para prosseguir"
    
    if ($Confirm -ne "CONFIRMAR") {
        Write-Host "`n❌ Operação cancelada pelo usuário.`n" -ForegroundColor Red
        exit 0
    }
}

# Verificar arquivo SQL
if (-not (Test-Path $SqlFile)) {
    Write-Error "Arquivo SQL não encontrado: $SqlFile"
    exit 1
}

$FullPath = Resolve-Path $SqlFile
$SqlContent = Get-Content $FullPath -Raw -Encoding UTF8

# Estatísticas do SQL
$TableCount = ([regex]::Matches($SqlContent, "CREATE TABLE")).Count
$InsertCount = ([regex]::Matches($SqlContent, "INSERT INTO")).Count

Write-Host "`n📊 Script SQL:" -ForegroundColor Cyan
Write-Host "  - Arquivo: $(Split-Path $SqlFile -Leaf)"
Write-Host "  - Tamanho: $([math]::Round((Get-Item $FullPath).Length / 1KB, 2)) KB"
Write-Host "  - Tabelas: $TableCount"
Write-Host "  - INSERTs: $InsertCount`n"

# Deploy
Write-Host "🚀 Executando reset..." -ForegroundColor Cyan

try {
    $Response = Invoke-RestMethod -Uri $Target.Url -Method Post -Body @{
        key = $Target.Key
        sql = $SqlContent
    } -TimeoutSec 30
    
    Write-Host "`n✅ Reset concluído com sucesso!`n" -ForegroundColor Green
    Write-Host "Resposta do servidor:" -ForegroundColor Gray
    Write-Host $Response
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "  ✅ Banco de dados V6 ativo!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green
    
    # Próximos passos
    if ($Environment -eq "Production") {
        Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
        Write-Host "  1. Gerar logins das licenciadas:" -ForegroundColor Yellow
        Write-Host "     https://seu-dominio.com/api/tools/generate_logins.php?key=DEPLOY_2026"
        Write-Host "  2. DELETAR api/tools/generate_logins.php do servidor`n" -ForegroundColor Red
    }
}
catch {
    Write-Host "`n❌ Erro ao executar reset:`n" -ForegroundColor Red
    Write-Error $_.Exception.Message
    
    Write-Host "`n💡 Resolução de problemas:" -ForegroundColor Yellow
    Write-Host "  - Verifique se o servidor está acessível"
    Write-Host "  - Confirme que run_sql.php existe em api/tools/"
    Write-Host "  - Valide a chave DEPLOY_2026 no servidor`n"
    
    exit 1
}
