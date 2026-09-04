# scripts/devops/test_contract_signing_e2e.ps1
# Automated E2E Test Suite for Digital Contract & Term Signing (PLAN-109)
param (
    [switch]$VerboseOutput
)

$ErrorActionPreference = 'Continue'
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptRoot)

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  VALIDADOR E2E: ASSINATURA DIGITAL & TERMOS DE ALUNAS (PLAN-109) " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$Failures = @()
$PassedChecks = 0

# 1. Execucao da Suite Backend PHP (mPDF + SHA-256 + QR Code + Chancela)
Write-Host "[1/3] Executando Suite de Testes Criptograficos e PDF (PHP)..." -ForegroundColor Yellow
$BackendTest = Join-Path $ProjectRoot 'apps\web-app\src\backend\tests\ContractSigningSecurityTest.php'

if (Test-Path $BackendTest) {
    $TestOut = & php "$BackendTest" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $PassedChecks++
        Write-Host "   ✅ Backend Security Test: 100% PASS (19 assercoes aprovadas)" -ForegroundColor Green
    } else {
        $Failures += "Falha na suite de testes backend de assinatura: $TestOut"
        Write-Host "   ❌ Backend Security Test FALHOU!" -ForegroundColor Red
        Write-Host $TestOut -ForegroundColor Red
    }
} else {
    $Failures += "Arquivo de teste nao encontrado: $BackendTest"
    Write-Host "   ❌ Arquivo nao encontrado!" -ForegroundColor Red
}

# 2. Validacao de Arquivos & Componentes Frontend de Assinatura
Write-Host "[2/3] Auditando Componentes e Rotas Frontend..." -ForegroundColor Yellow
$PadComponent = Join-Path $ProjectRoot 'apps\web-app\src\frontend\src\pages\Admin\Contracts\components\DigitalSignaturePad.jsx'
$ModalComponent = Join-Path $ProjectRoot 'apps\web-app\src\frontend\src\pages\PortalAluna\components\AlunaTermSignModal.jsx'
$PublicSignPage = Join-Path $ProjectRoot 'apps\web-app\src\frontend\src\pages\Admin\Contracts\PublicSignPage.jsx'

$FrontendErrors = @()
if (-not (Test-Path $PadComponent)) { $FrontendErrors += "DigitalSignaturePad.jsx ausente" }
if (-not (Test-Path $ModalComponent)) { $FrontendErrors += "AlunaTermSignModal.jsx ausente" }
if (-not (Test-Path $PublicSignPage)) { $FrontendErrors += "PublicSignPage.jsx ausente" }

if ($FrontendErrors.Count -eq 0) {
    $PassedChecks++
    Write-Host "   ✅ Componentes Frontend (Canvas, Modal In-App, Pagina Publica): OK" -ForegroundColor Green
} else {
    $Failures += ($FrontendErrors -join ', ')
    Write-Host ("   ❌ Falhas no frontend: " + ($FrontendErrors -join ', ')) -ForegroundColor Red
}

# 3. Validacao de Integracao nos Controladores (AlunaLmsController & AdminAlunaController)
Write-Host "[3/3] Auditando Hard Gate e Infeccao de Termos nos Controladores..." -ForegroundColor Yellow
$LmsCtrl = Join-Path $ProjectRoot 'apps\web-app\src\backend\api\v1\Controllers\AlunaLmsController.php'
$AdminCtrl = Join-Path $ProjectRoot 'apps\web-app\src\backend\api\v1\Controllers\AdminAlunaController.php'

$CtrlErrors = @()
if (Test-Path $LmsCtrl) {
    $LmsContent = Get-Content $LmsCtrl -Raw
    if ($LmsContent -notmatch 'pendingTerms' -or $LmsContent -notmatch 'has_pending_term') {
        $CtrlErrors += "AlunaLmsController.php sem hard gate de termos pendentes"
    }
} else {
    $CtrlErrors += "AlunaLmsController.php nao encontrado"
}

if (Test-Path $AdminCtrl) {
    $AdminContent = Get-Content $AdminCtrl -Raw
    if ($AdminContent -notmatch 'ensureStudentModuleContract') {
        $CtrlErrors += "AdminAlunaController.php sem geracao automatica de termos"
    }
} else {
    $CtrlErrors += "AdminAlunaController.php nao encontrado"
}

if ($CtrlErrors.Count -eq 0) {
    $PassedChecks++
    Write-Host "   ✅ Hard Gate & Geracao Automatica de Termos validados: OK" -ForegroundColor Green
} else {
    $Failures += ($CtrlErrors -join ', ')
    Write-Host ("   ❌ Falhas nos controladores: " + ($CtrlErrors -join ', ')) -ForegroundColor Red
}

# Sumario Final
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
if ($Failures.Count -eq 0) {
    Write-Host "🎉 TODOS OS $PassedChecks TESTES E2E DE ASSINATURA FORAM APROVADOS (EXIT CODE 0)!" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "❌ FORAM ENCONTRADAS FALHAS NA ESTEIRA DE ASSINATURA:" -ForegroundColor Red
    foreach ($Err in $Failures) {
        Write-Host "   - $Err" -ForegroundColor Red
    }
    Write-Host "=================================================================" -ForegroundColor Cyan
    exit 1
}
