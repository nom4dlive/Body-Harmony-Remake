# scripts/db/migration/apply-migration.ps1
# Applies a specific SQL update script to the running database WITHOUT resetting it.
# Supports Local (Docker) and Production (Hostinger VPS API Integration).

param(
    [Parameter(Mandatory = $true)]
    [string]$MigrationFile,
    
    [ValidateSet("Local", "Production")]
    [string]$Environment = "Local"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $MigrationFile)) {
    throw "Migration file not found: $MigrationFile"
}

Write-Host "?? APPLYING MIGRATION..." -ForegroundColor Cyan
Write-Host "File: $MigrationFile" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow

if ($Environment -eq "Production") {
    # --- PRODUCTION MIGRATION SAFETY FLOW (HOSTINGER API V125) ---
    $ProjectRoot = Resolve-Path "$PSScriptRoot\..\..\.."
    $EnvFile = "$ProjectRoot\.env.deploy"
    $HelperPath = "$ProjectRoot\Operations\Scripts\Hostinger-API.ps1"
    
    $VpsId = $null
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
    
    if ($VpsId -and (Test-Path $HelperPath)) {
        try {
            . $HelperPath
            Write-Host "[Nexus Guard] Disparando Snapshot Preventivo da VPS Hostinger ($VpsId) antes da migração..." -ForegroundColor Cyan
            $SnapshotResult = Create-HostingerVPSSnapshot -VirtualMachineId $VpsId
            if ($SnapshotResult) {
                Write-Host "[Nexus Guard] Snapshot preventivo iniciado com sucesso!" -ForegroundColor Green
            }
        }
        catch {
            Write-Warning "AVISO: Não foi possível criar snapshot na Hostinger: $_. Continuando migração por conta e risco..."
        }
    }
    
    # Executa a migração em produção
    try {
        Write-Host "Executando SQL no servidor de Produção..." -ForegroundColor Yellow
        # Nota: Normalmente executado via SSH ou ponte de dados (nexus-gate.ps1)
        # Simulamos a execução e tratamento de erro de forma genérica
        $NexusGate = "$ProjectRoot\Operations\Scripts\nexus-gate.ps1"
        if (Test-Path $NexusGate) {
            & $NexusGate -SqlFile $MigrationFile
        } else {
            # Se não houver nexus-gate, disparar via Docker local espelhado ou alertar
            throw "Ponte operacional nexus-gate.ps1 não encontrada para deploy de banco de produção."
        }
        Write-Host "? Migration applied successfully in Production." -ForegroundColor Green
    }
    catch {
        Write-Error "CRITICAL ERROR: Migration failed in Production! Details: $_"
        
        # Rotina de Autocura / Rollback de Hardware
        if ($VpsId -and (Test-Path $HelperPath)) {
            $Confirm = Read-Host "Deseja restaurar o snapshot preventivo da VPS Hostinger agora para mitigar corrupções? (y/n)"
            if ($Confirm -eq 'y') {
                try {
                    Restore-HostingerVPSSnapshot -VirtualMachineId $VpsId
                    Write-Host "[Nexus Guard] Restauração de snapshot da Hostinger disparada!" -ForegroundColor Green
                }
                catch {
                    Write-Error "Falha crítica ao restaurar snapshot remoto: $_"
                }
            }
        }
        exit 1
    }
}
else {
    # --- LOCAL ENVIRONMENT (DOCKER) ---
    try {
        Get-Content $MigrationFile | docker exec -i infrastructure-db-1 mysql -u root -proot body_harmony_db
        Write-Host "? Migration applied successfully." -ForegroundColor Green
    }
    catch {
        Write-Error "Migration failed: $_"
    }
}

