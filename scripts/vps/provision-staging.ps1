<#
.SYNOPSIS
    Body Harmony - Provision Staging Subdomain
.DESCRIPTION
    Script para provisionar automaticamente um subdomínio de staging via API da Hostinger.
    Útil para testes de design de novas variantes ou homologação.
.EXAMPLE
    .\provision-staging.ps1 -Subdomain "test-design" -HostingUsername "u388974772" -Domain "bodyharmony.com.br"
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$Subdomain,
    
    [Parameter(Mandatory=$true)]
    [string]$HostingUsername,
    
    [string]$Domain = "bodyharmony.com.br"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$HelperPath = "$ScriptDir\Hostinger-API.ps1"

if (-not (Test-Path $HelperPath)) {
    Write-Error "CRITICAL: Script Hostinger-API.ps1 não encontrado em: $HelperPath"
    exit 1
}

# Carrega o helper
. $HelperPath

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   PROVISIONADOR DE STAGING: HOSTINGER   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Subdomínio pretendido: $Subdomain.$Domain"
Write-Host "Nome de Usuário Hosting: $HostingUsername"

try {
    $Result = New-HostingerSubdomain -HostingUsername $HostingUsername -Domain $Domain -Subdomain $Subdomain
    if ($Result) {
        Write-Host "Provisionamento concluído!" -ForegroundColor Green
        Write-Host "O novo subdomínio estará ativo em alguns minutos após a propagação de DNS." -ForegroundColor Yellow
        exit 0
    } else {
        Write-Error "Falha ao processar requisição de subdomínio na Hostinger."
        exit 1
    }
}
catch {
    Write-Error "Erro crítico ao provisionar subdomínio: $_"
    exit 1
}
