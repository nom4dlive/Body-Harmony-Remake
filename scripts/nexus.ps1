# Nexus Master CLI Orchestrator (V3.2) - Body Harmony
[CmdletBinding()]
param (
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$Target = ""
)

$ErrorActionPreference = "Continue"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptRoot

function Show-Header {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "  🏛️  NEXUS MASTER CLI ORCHESTRATOR (V3.2) - BODY HARMONY " -ForegroundColor White
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Help {
    Show-Header
    Write-Host "Comandos Disponiveis:" -ForegroundColor Yellow
    Write-Host "  ./scripts/nexus.ps1 gate                 -> Executa o Hard-Gatekeeper (sintaxe, contratos, seguranca)" -ForegroundColor White
    Write-Host "  ./scripts/nexus.ps1 deploy [hostinger|vps|pro] -> Dispara deploy para o ambiente desejado" -ForegroundColor White
    Write-Host "  ./scripts/nexus.ps1 db [migrate|seed|reset]    -> Executa rotinas no banco de dados" -ForegroundColor White
    Write-Host "  ./scripts/nexus.ps1 status               -> Exibe o status e saude do repositorio" -ForegroundColor White
    Write-Host ""
}

switch ($Command.ToLower()) {
    "gate" {
        Show-Header
        Write-Host "🚀 Executando Nexus Hard-Gate..." -ForegroundColor Cyan
        & powershell -ExecutionPolicy Bypass -File "$ScriptRoot\nexus_gate.ps1"
    }
    "deploy" {
        Show-Header
        $DeployTarget = if ($Target) { $Target.ToLower() } else { "hostinger" }
        Write-Host "🚀 Iniciando Deploy para [$DeployTarget]..." -ForegroundColor Cyan
        switch ($DeployTarget) {
            "hostinger" {
                & powershell -ExecutionPolicy Bypass -File "$ScriptRoot\deploy\deploy-hostinger.ps1"
            }
            "vps" {
                & powershell -ExecutionPolicy Bypass -File "$ScriptRoot\deploy\deploy-crm-vps.ps1"
            }
            "pro" {
                & powershell -ExecutionPolicy Bypass -File "$ScriptRoot\deploy\deploy-pro.ps1"
            }
            default {
                Write-Host "Alvo desconhecido. Use: hostinger | vps | pro" -ForegroundColor Yellow
            }
        }
    }
    "db" {
        Show-Header
        $DbAction = if ($Target) { $Target.ToLower() } else { "migrate" }
        Write-Host "🗄️ Executando Acao de Banco de Dados [$DbAction]..." -ForegroundColor Cyan
        switch ($DbAction) {
            "migrate" {
                & powershell -ExecutionPolicy Bypass -File "$ScriptRoot\db\run-migrations.ps1"
            }
            "seed" {
                & powershell -ExecutionPolicy Bypass -File "$ScriptRoot\db\run-seeds.ps1"
            }
            "reset" {
                & powershell -ExecutionPolicy Bypass -File "$ScriptRoot\db\reset-database.ps1"
            }
            default {
                Write-Host "Acao de DB desconhecida. Use: migrate | seed | reset" -ForegroundColor Yellow
            }
        }
    }
    "status" {
        Show-Header
        Write-Host "🔍 Verificando Integridade do Workspace..." -ForegroundColor Cyan
        & powershell -ExecutionPolicy Bypass -File "$ScriptRoot\nexus_gate.ps1" -SkipBuild
    }
    default {
        Show-Help
    }
}