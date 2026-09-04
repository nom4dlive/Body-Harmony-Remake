<#
.SYNOPSIS
    Body Harmony - Hostinger DNS Configuration for CRM Stack (PLAN-151)
.DESCRIPTION
    Adds the 'crm' and 'evolution' A-records pointing to the Dedicated VPS IP (2.25.156.25) using Hostinger-API.ps1.
#>

param(
    [string]$Domain = "bodyharmony.com.br",
    [string]$TargetIP = "2.25.156.25"
)

$ErrorActionPreference = "Stop"
$HelperPath = "$PSScriptRoot\Scripts\Hostinger-API.ps1"

if (Test-Path $HelperPath) {
    . $HelperPath
    Write-Host "[Hostinger API] Automation Helper loaded." -ForegroundColor Cyan
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " CONFIGURING DNS RECORDS FOR CRM & EVOLUTION -> $TargetIP " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

try {
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/dns/v1/zones/$Domain"

    $Body = @{
        overwrite = $false
        zone = @(
            @{
                name = "crm"
                type = "A"
                ttl = 300
                records = @(
                    @{ content = $TargetIP }
                )
            },
            @{
                name = "evolution"
                type = "A"
                ttl = 300
                records = @(
                    @{ content = $TargetIP }
                )
            }
        )
    } | ConvertTo-Json -Depth 5

    Write-Host "Sending DNS update request to Hostinger API..." -ForegroundColor Cyan
    $Response = Invoke-RestMethod -Uri $Uri -Method Put -Headers $Headers -Body $Body
    Write-Host "✅ DNS Records 'crm.$Domain' and 'evolution.$Domain' configured successfully!" -ForegroundColor Green
}
catch {
    Write-Warning "Hostinger DNS API response: $_"
}
