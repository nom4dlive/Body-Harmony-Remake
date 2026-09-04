<#
.SYNOPSIS
    Body Harmony - VPS Telemetry & Self-Healing (Nexus Guard V3.1)
.DESCRIPTION
    Monitora métricas de CPU, RAM e integridade da VPS da Hostinger via API.
    Oferece funcionalidade de autocura disparando reinicializações remotas da VPS
    se travamentos persistentes forem detectados ou se a flag de correção for acionada.
.EXAMPLE
    .\self-healing.ps1 -VpsId "123456" -CheckOnly
#>

param (
    [string]$VpsId,
    [switch]$CheckOnly,
    [switch]$ForceRestart
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

# Resgata o ID da VPS do env se não fornecido
if (-not $VpsId) {
    $EnvFile = "$ScriptDir\..\..\.env.deploy"
    if (Test-Path $EnvFile) {
        $Config = @{}
        Get-Content $EnvFile | Where-Object { $_ -match "^[^#].+=" } | ForEach-Object {
            $parts = $_ -split '=', 2
            $Config[$parts[0].Trim()] = $parts[1].Trim()
        }
        if ($Config.ContainsKey("HOSTINGER_VPS_ID")) {
            $VpsId = $Config["HOSTINGER_VPS_ID"]
        }
    }
}

if (-not $VpsId) {
    Write-Warning "AVISO: HOSTINGER_VPS_ID não configurado. Pulando telemetria e autocura ativa."
    exit 0
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " TELEMETRIA E AUTOCURA (NEXUS GUARD V3.1) " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "VPS Alvo: $VpsId"

# 1. Obter telemetria de performance
Write-Host "Consultando métricas da VPS via Hostinger API..." -ForegroundColor Yellow
$Metrics = Get-HostingerVPSMetrics -VirtualMachineId $VpsId

if ($null -eq $Metrics) {
    Write-Warning "Não foi possível resgatar as métricas de telemetria da VPS Hostinger."
    exit 1
}

# 2. Verificação de Integridade / Gatilhos de Autocura
$CPU_Threshold = 95.0
$RAM_Threshold = 95.0
$Container_CPU_Threshold = 50.0 # Threshold para container individual

$IssueDetected = $false
$Reason = ""
$TargetProjectsToStop = @()

# Se houver métricas reais, fazemos a análise estrutural da VM
if ($Metrics.cpu) {
    $LastCpu = $Metrics.cpu[-1]
    Write-Host "Última leitura de CPU global: $LastCpu%"
    if ($LastCpu -gt $CPU_Threshold) {
        $IssueDetected = $true
        $Reason += "Uso excessivo de CPU global ($LastCpu% > $CPU_Threshold%). "
    }
}

if ($Metrics.memory) {
    $LastRam = $Metrics.memory[-1]
    Write-Host "Última leitura de RAM global: $LastRam%"
    if ($LastRam -gt $RAM_Threshold) {
        $IssueDetected = $true
        $Reason += "Esgotamento de Memória RAM global ($LastRam% > $RAM_Threshold%). "
    }
}

# 3. Auditoria Fina de Containers Docker Compose
Write-Host "`nConsultando status dos containers Docker na VPS..." -ForegroundColor Yellow
$Projects = Get-HostingerVPSProjects -VirtualMachineId $VpsId
if ($Projects -and $Projects.Count -gt 0) {
    foreach ($Project in $Projects) {
        Write-Host "  Projeto: $($Project.name) [Status: $($Project.status)]" -ForegroundColor Cyan
        $ContainersResponse = Get-HostingerVPSProjectContainers -VirtualMachineId $VpsId -ProjectName $Project.name
        $Containers = $null
        if ($ContainersResponse) {
            # Evita o gotcha de enumeração de array do PowerShell
            if ($ContainersResponse.PSObject -and $ContainersResponse.PSObject.Properties.Name -contains "value") {
                $Containers = $ContainersResponse.value
            }
            else {
                $Containers = $ContainersResponse
            }
        }
        
        if ($Containers) {
            foreach ($Container in $Containers) {
                $CpuVal = 0
                $HealthStr = $Container.health
                if ($Container.stats -and $Container.stats.cpu_percentage) {
                    $CpuVal = [double]$Container.stats.cpu_percentage
                }
                
                Write-Host "    - Container: $($Container.name) | CPU: $CpuVal% | Status: $($Container.status) | Health: $HealthStr"
                
                # Regra de Autocura de Container: CPU muito alta e em provável Crash Loop (uptime baixo)
                $IsUptimeShort = $Container.status -match "second" -or $Container.status -match "1 minute" -or $Container.status -match "2 minutes" -or $Container.status -match "3 minutes" -or $Container.status -match "4 minutes"
                
                if ($CpuVal -gt $Container_CPU_Threshold -and $IsUptimeShort) {
                    Write-Host "      [Nexus Guard] ALERTA: Container $($Container.name) detectado em potencial Crash Loop (CPU alta $CpuVal% e uptime baixo)!" -ForegroundColor Red
                    if ($TargetProjectsToStop -notcontains $Project.name) {
                        $TargetProjectsToStop += $Project.name
                        $IssueDetected = $true
                        $Reason += "Container $($Container.name) em Crash Loop no projeto $($Project.name). "
                    }
                }
                
                # Regra para container marcado como Unhealthy por várias sondas
                if ($HealthStr -eq "unhealthy") {
                    Write-Host "      [Nexus Guard] ALERTA: Container $($Container.name) está marcado como UNHEALTHY!" -ForegroundColor Red
                    if ($TargetProjectsToStop -notcontains $Project.name) {
                        $TargetProjectsToStop += $Project.name
                        $IssueDetected = $true
                        $Reason += "Container $($Container.name) unhealthy no projeto $($Project.name). "
                    }
                }
            }
        }
    }
}

if ($ForceRestart) {
    $IssueDetected = $true
    $Reason = "Reinicialização forçada manual acionada pelo operador."
}

# 4. Ação de Autocura
if ($IssueDetected) {
    Write-Host "`n[Nexus Guard] ALERTA: Anomalia detectada na VPS Hostinger!" -ForegroundColor Red
    Write-Host "Motivo: $Reason" -ForegroundColor Yellow
    
    if ($CheckOnly) {
        Write-Host "[Self-Healing] Ação pulada pois a flag -CheckOnly está ativa." -ForegroundColor Yellow
    }
    else {
        # Se detectamos containers específicos para parar, paramos apenas eles em vez de reiniciar a VPS toda!
        if ($TargetProjectsToStop.Count -gt 0) {
            foreach ($Proj in $TargetProjectsToStop) {
                Write-Host "[Self-Healing] Parando preventivamente o projeto instável '$Proj' para proteger a VPS..." -ForegroundColor Magenta
                Stop-HostingerVPSProject -VirtualMachineId $VpsId -ProjectName $Proj
            }
        }
        else {
            # Caso o problema seja global da VPS (ex: RAM esgotada sem container em Crash Loop óbvio)
            Write-Host "[Self-Healing] Iniciando reinicialização global da VPS..." -ForegroundColor Magenta
            Restart-HostingerVPS -VirtualMachineId $VpsId
        }
    }
}
else {
    Write-Host "`n[Nexus Guard] VPS e containers operando dentro dos parâmetros ideais de integridade." -ForegroundColor Green
}

exit 0
