# devops/post_deploy_smoke.ps1
# Teste Pos-Deploy Automatizado para o Ecossistema Body Harmony

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       BODY HARMONY - TESTE POS-DEPLOY EM PRODUCAO        " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$targets = @(
    @{ Name = "Backend Ping API"; Url = "https://bodyharmony.com.br/api/ping.php"; Expected = 200 },
    @{ Name = "Evolution Webhook Gateway"; Url = "https://bodyharmony.com.br/api/v1/crm/evolution_webhook.php"; Expected = 200 },
    @{ Name = "CRM Delta Polling Endpoint"; Url = "https://bodyharmony.com.br/api/v1/crm/inbox_poll_delta.php"; Expected = 200 },
    @{ Name = "Portal Gestor CRM SPA"; Url = "https://bodyharmony.com.br/portal-gestor/crm"; Expected = 200 },
    @{ Name = "LMS Portal Aluna SPA"; Url = "https://bodyharmony.com.br/portal-aluna"; Expected = 200 }
)

$allPassed = $true

foreach ($target in $targets) {
    try {
        $res = Invoke-WebRequest -Uri $target.Url -Method Get -UseBasicParsing -TimeoutSec 15
        $code = $res.StatusCode
        $content = ($res.Content -replace '\s+', ' ').Trim()
        if ($content.Length -gt 100) { $content = $content.Substring(0, 100) + '...' }

        Write-Host "[HTTP $code] $($target.Name)" -ForegroundColor Green
        Write-Host "   URL: $($target.Url)" -ForegroundColor Gray
        Write-Host "   Preview: $content" -ForegroundColor DarkGray
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if (-not $code) { $code = "ERROR" }
        Write-Host "[HTTP $code] $($target.Name)" -ForegroundColor Yellow
        Write-Host "   URL: $($target.Url)" -ForegroundColor Gray
        Write-Host "   Detalhe: $($_.Exception.Message)" -ForegroundColor Red
        if ($target.Expected -eq 200) {
            $allPassed = $false
        }
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "TODOS OS HEALTHCHECKS POS-DEPLOY PASSARAM COM SUCESSO (HTTP 200 OK)!" -ForegroundColor Green
} else {
    Write-Host "ALGUNS HEALTHCHECKS APRESENTARAM ANOMALIAS. AUDITE OS LOGS ACIMA." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
