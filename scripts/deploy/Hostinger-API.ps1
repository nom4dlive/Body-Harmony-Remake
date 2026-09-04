<#
.SYNOPSIS
    Body Harmony - Hostinger API Wrapper & Automation Helper (Nexus Era)
.DESCRIPTION
    Fornece funções reutilizáveis para interagir com a API da Hostinger.
    Lê dinamicamente o Token de API do tracker seguro para garantir higiene de código.
#>

$ErrorActionPreference = "Stop"

# Caminho para obter o token de segurança
$ProjectRoot = Resolve-Path "$PSScriptRoot\..\.."
$ApiTrackerFile = "$ProjectRoot\openspec\tracker\Hostinger_VPS\API.md"

function Get-HostingerToken {
    if (-not (Test-Path $ApiTrackerFile)) {
        throw "CRITICAL: Arquivo de API Tracker não encontrado em: $ApiTrackerFile"
    }
    
    # Extrai o token do arquivo markdown (linha que não seja vazia nem título/comentário)
    $Content = Get-Content $ApiTrackerFile
    $Token = $null
    foreach ($Line in $Content) {
        $CleanLine = $Line.Trim()
        # Encontra a linha de hash de token (normalmente uma string de 40+ caracteres hex/alfanumérica)
        if ($CleanLine -and $CleanLine -notmatch "^#" -and $CleanLine -notmatch "^Created" -and $CleanLine -notmatch "^Completed" -and $CleanLine -notmatch "^API" -and $CleanLine -notmatch "^https") {
            $Token = $CleanLine
            break
        }
    }
    
    if (-not $Token) {
        throw "CRITICAL: Token da API Hostinger não pôde ser lido em: $ApiTrackerFile"
    }
    
    return $Token
}

function Get-HostingerHeaders {
    $Token = Get-HostingerToken
    return @{
        "Authorization" = "Bearer $Token"
        "Accept"        = "application/json"
        "Content-Type"  = "application/json"
    }
}

# --- 1. VPS & TELEMETRIA ---

function Get-HostingerVPSList {
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines"
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Get
        return $Response
    }
    catch {
        Write-Warning "Falha ao obter lista de VPS. Detalhes: $_"
        return @()
    }
}

function Get-HostingerVPSMetrics {
    param (
        [string]$VirtualMachineId,
        [datetime]$DateFrom = (Get-Date).AddDays(-1),
        [datetime]$DateTo = (Get-Date)
    )
    
    $Headers = Get-HostingerHeaders
    $FromStr = $DateFrom.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $ToStr = $DateTo.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VirtualMachineId/metrics?date_from=$FromStr&date_to=$ToStr"
    
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Get
        return $Response
    }
    catch {
        Write-Error "Falha ao puxar métricas de telemetria da VPS: $_"
        return $null
    }
}

function Restart-HostingerVPS {
    param (
        [string]$VirtualMachineId
    )
    
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VirtualMachineId/restart"
    
    Write-Host "[Hostinger API] Reiniciando VPS $VirtualMachineId remotamente..." -ForegroundColor Yellow
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Post
        Write-Host "[Hostinger API] Comando de restart enviado com sucesso!" -ForegroundColor Green
        return $Response
    }
    catch {
        Write-Error "Falha ao solicitar restart da VPS: $_"
        return $null
    }
}

# --- 2. SNAPSHOTS & BACKUPS ---

function Create-HostingerVPSSnapshot {
    param (
        [string]$VirtualMachineId
    )
    
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VirtualMachineId/snapshot"
    
    Write-Host "[Hostinger API] Disparando Snapshot Preventivo da VPS $VirtualMachineId..." -ForegroundColor Cyan
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Post
        Write-Host "[Hostinger API] Criação de snapshot iniciada com sucesso!" -ForegroundColor Green
        return $Response
    }
    catch {
        Write-Error "Falha ao criar snapshot preventivo da VPS: $_"
        return $null
    }
}

function Restore-HostingerVPSSnapshot {
    param (
        [string]$VirtualMachineId
    )
    
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VirtualMachineId/snapshot/restore"
    
    Write-Host "[Hostinger API] CRITICAL: Revertendo VPS $VirtualMachineId para o Snapshot anterior..." -ForegroundColor Red
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Post
        Write-Host "[Hostinger API] Reversão de snapshot disparada!" -ForegroundColor Green
        return $Response
    }
    catch {
        Write-Error "Falha ao reverter snapshot da VPS: $_"
        return $null
    }
}

# --- 3. SUBDOMÍNIOS & STAGING ---

function New-HostingerSubdomain {
    param (
        [string]$HostingUsername,
        [string]$Domain,
        [string]$Subdomain
    )
    
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/hosting/v1/accounts/$HostingUsername/websites/$Domain/subdomains"
    
    $Body = @{
        "subdomain" = $Subdomain
    } | ConvertTo-Json
    
    Write-Host "[Hostinger API] Criando subdomínio de staging '$Subdomain.$Domain'..." -ForegroundColor Cyan
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Post -Body $Body
        Write-Host "[Hostinger API] Subdomínio de staging criado com sucesso!" -ForegroundColor Green
        return $Response
    }
    catch {
        Write-Error "Falha ao criar subdomínio de staging: $_"
        return $null
    }
}

# --- 4. DOCKER / PROJECT MANAGER (EXPERIMENTAL) ---

function Get-HostingerVPSProjects {
    param (
        [string]$VirtualMachineId
    )
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VirtualMachineId/docker"
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Get
        return $Response
    }
    catch {
        Write-Warning "Falha ao obter projetos Docker. Detalhes: $_"
        return @()
    }
}

function Get-HostingerVPSProjectContainers {
    param (
        [string]$VirtualMachineId,
        [string]$ProjectName
    )
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VirtualMachineId/docker/$ProjectName/containers"
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Get
        return $Response
    }
    catch {
        Write-Warning "Falha ao obter containers do projeto $ProjectName. Detalhes: $_"
        return @()
    }
}

function Stop-HostingerVPSProject {
    param (
        [string]$VirtualMachineId,
        [string]$ProjectName
    )
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VirtualMachineId/docker/$ProjectName/stop"
    Write-Host "[Hostinger API] Parando projeto Docker '$ProjectName'..." -ForegroundColor Yellow
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Post
        Write-Host "[Hostinger API] Comando de parada enviado com sucesso!" -ForegroundColor Green
        return $Response
    }
    catch {
        Write-Error "Falha ao parar o projeto $($ProjectName): $($Error[0])"
        return $null
    }
}

function Start-HostingerVPSProject {
    param (
        [string]$VirtualMachineId,
        [string]$ProjectName
    )
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VirtualMachineId/docker/$ProjectName/start"
    Write-Host "[Hostinger API] Iniciando projeto Docker '$ProjectName'..." -ForegroundColor Yellow
    try {
        $Response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method Post
        Write-Host "[Hostinger API] Comando de inicialização enviado com sucesso!" -ForegroundColor Green
        return $Response
    }
    catch {
        Write-Error "Falha ao iniciar o projeto $($ProjectName): $($Error[0])"
        return $null
    }
}

# Exporta variáveis caso o script seja incluído via dot-source
# Exemplo de uso: . "$PSScriptRoot\Operations\Scripts\Hostinger-API.ps1"
