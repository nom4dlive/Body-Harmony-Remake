<#
.SYNOPSIS
    Body Harmony - Hostinger DNS Configuration for Open Notebook (PLAN-108)
.DESCRIPTION
    Adds the 'notebook' A-record pointing to the Dedicated VPS IP (2.25.156.25) using Hostinger-API.ps1.
#>

param(
    [string]$Domain = "bodyharmony.com.br",
    [string]$Subdomain = "notebook",
    [string]$TargetIP = "2.25.156.25"
)

$ErrorActionPreference = "Stop"
$HelperPath = "$PSScriptRoot\Scripts\Hostinger-API.ps1"

if (Test-Path $HelperPath) {
    . $HelperPath
    Write-Host "[Hostinger API] Automation Helper loaded." -ForegroundColor Cyan
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host " CONFIGURING DNS: $Subdomain.$Domain -> $TargetIP" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

try {
    $Headers = Get-HostingerHeaders
    $Uri = "https://developers.hostinger.com/api/dns/v1/zones/$Domain"

    $Body = @{
        overwrite = $false
        zone = @(
            @{
                name = $Subdomain
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
    Write-Host "✅ DNS Record '$Subdomain.$Domain' configured successfully!" -ForegroundColor Green
}
catch {
    Write-Warning "Hostinger DNS API response: $_"
}
