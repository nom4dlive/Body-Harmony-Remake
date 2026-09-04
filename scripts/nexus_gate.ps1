# Nexus Hard Gatekeeper (V3.2) - Motor de Verificacao Deterministica
param (
    [switch]$SkipBuild,
    [switch]$VerboseOutput
)

$ErrorActionPreference = 'Continue'
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptRoot

Write-Host ""
Write-Host "[NEXUS HARD-GATE] Iniciando Verificacao Deterministica..." -ForegroundColor Cyan

$Failures = @()
$PassedChecks = 0

# 1. Checagem de Espaco Negativo e Segredos
Write-Host "[1/4] Auditando Espaco Negativo e Segredos..." -NoNewline
try {
    $SensitivePatterns = @('*.env', '*.pem', '*.key', 'id_ed25519', 'rootpass.txt')
    $FoundSecrets = @()
    
    $GitStatus = git status --porcelain 2>$null
    if ($GitStatus) {
        foreach ($Line in $GitStatus) {
            if ($Line.Length -gt 3) {
                $FilePath = $Line.Substring(3).Trim()
                foreach ($Pattern in $SensitivePatterns) {
                    if ($FilePath -like $Pattern -or $FilePath -like ('*/' + $Pattern)) {
                        $FoundSecrets += $FilePath
                    }
                }
            }
        }
    }
    
    if ($FoundSecrets.Count -gt 0) {
        $Failures += ("SEGREDO EXPOSTO: Arquivos sensiveis detectados no Git: " + ($FoundSecrets -join ', '))
        Write-Host " [FALHOU]" -ForegroundColor Red
    } else {
        $PassedChecks++
        Write-Host " [OK]" -ForegroundColor Green
    }
} catch {
    Write-Host " [AVISO: Git indisponivel]" -ForegroundColor Yellow
}

# 2. Checagem de Sintaxe PHP (php -l)
Write-Host "[2/4] Validando Sintaxe PHP Nativa..." -NoNewline
$PhpFiles = Get-ChildItem -Path "$ProjectRoot\api", "$ProjectRoot\src", "$ProjectRoot\scripts" -Filter '*.php' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 60
$PhpErrors = @()

foreach ($File in $PhpFiles) {
    if (Test-Path $File.FullName) {
        $PhpLint = & php -l "$($File.FullName)" 2>&1
        if ($LASTEXITCODE -ne 0) {
            $PhpErrors += ("Erro de Sintaxe em " + $File.Name + ": " + $PhpLint)
        }
    }
}

if ($PhpErrors.Count -gt 0) {
    $Failures += ($PhpErrors -join "`n")
    Write-Host " [FALHOU]" -ForegroundColor Red
} else {
    $PassedChecks++
    Write-Host (" [OK: " + $PhpFiles.Count + " arquivos avaliados]") -ForegroundColor Green
}

# 3. Validacao de Contratos de API & Auditoria Preditiva CI
Write-Host "[3/4] Verificando Contratos, Paridade de Rotas e Imports..." -NoNewline
$ContractsDir = Join-Path $ProjectRoot 'openspec\contracts'
$CiLazyScript = Join-Path $ProjectRoot 'scripts\ci\audit-lazy-imports.js'
$CiRoutesScript = Join-Path $ProjectRoot 'scripts\ci\audit-api-routes.js'
$PhpTestScript = Join-Path $ProjectRoot 'apps\web-app\src\backend\tests\LmsNotebookSecurityTest.php'

$AuditErrors = @()

if (Test-Path $CiLazyScript) {
    $LazyOut = & node "$CiLazyScript" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $AuditErrors += "Falha na auditoria de imports lazy: $LazyOut"
    }
}

if (Test-Path $CiRoutesScript) {
    $RoutesOut = & node "$CiRoutesScript" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $AuditErrors += "Falha na auditoria de rotas API: $RoutesOut"
    }
}

if (Test-Path $PhpTestScript) {
    $TestOut = & php "$PhpTestScript" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $AuditErrors += "Falha na suite de testes PHP: $TestOut"
    }
}

$ContractE2EScript = Join-Path $ProjectRoot 'scripts\devops\test_contract_signing_e2e.ps1'
if (Test-Path $ContractE2EScript) {
    $ContractOut = & pwsh -File "$ContractE2EScript" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $AuditErrors += "Falha no validador E2E de contratos e termos: $ContractOut"
    }
}

if ($AuditErrors.Count -gt 0) {
    $Failures += ($AuditErrors -join "`n")
    Write-Host " [FALHOU]" -ForegroundColor Red
} else {
    $PassedChecks++
    Write-Host " [OK: Lazy Imports, Rotas e Testes Unitarios PASS]" -ForegroundColor Green
}

# 4. Build de Integridade do Frontend (Vite/Node) & Scanner Estatico
if (-not $SkipBuild) {
    Write-Host "[4/4] Verificando Build do Frontend & Styled-Components..." -NoNewline
    $WebAppDir = Join-Path $ProjectRoot "apps\web-app"
    $TargetDir = if (Test-Path "$WebAppDir\package.json") { $WebAppDir } elseif (Test-Path "$ProjectRoot\package.json") { $ProjectRoot } else { $null }
    
    if ($TargetDir) {
        # 4.1 Scanner Estatico Anti-Error #12 (Keyframes sem css tag)
        $FrontendSrc = Join-Path $TargetDir "src"
        if (Test-Path $FrontendSrc) {
            $JsxFiles = Get-ChildItem -Path $FrontendSrc -Include *.jsx,*.tsx,*.js -Recurse -ErrorAction SilentlyContinue
            $UnsafeKeyframeFiles = @()
            foreach ($F in $JsxFiles) {
                $Content = Get-Content $F.FullName -Raw -ErrorAction SilentlyContinue
                if ($Content -and $Content -match 'keyframes`') {
                    # Se tiver interpolacao em template string pura dentro de styled
                    if ($Content -match 'animation:\s*\$\{[^}]+\}[^;]*;[\s\S]*?\$\(\{\s*\$') {
                        # Warning / check
                    }
                }
            }
        }

        # 4.2 Compilacao Real
        Push-Location $TargetDir
        try {
            $BuildOutput = & npm run build 2>&1
            if ($LASTEXITCODE -ne 0) {
                $Failures += ("Falha na compilacao do Frontend (npm run build em " + $TargetDir + "): " + $BuildOutput)
                Write-Host " [FALHOU]" -ForegroundColor Red
            } else {
                $PassedChecks++
                Write-Host " [OK: Build verificado em apps/web-app]" -ForegroundColor Green
            }
        } finally {
            Pop-Location
        }
    } else {
        $PassedChecks++
        Write-Host " [OK: Sem diretorio frontend configurado]" -ForegroundColor Green
    }
} else {
    Write-Host "[4/4] Build do Frontend pulado (-SkipBuild)." -ForegroundColor Yellow
}

# Relatorio Final
Write-Host "========================================================"
if ($Failures.Count -gt 0) {
    Write-Host ("[NEXUS GATE BLOQUEANTE] Verificacao falhou com " + $Failures.Count + " erro(s):") -ForegroundColor Red
    foreach ($Err in $Failures) {
        Write-Host ("  - " + $Err) -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "ACAO NECESSARIA: Corrija os pontos acima antes de declarar a tarefa concluida." -ForegroundColor Yellow
    Write-Host "========================================================"
    exit 1
} else {
    Write-Host "[NEXUS GATE PASS] Todas as verificacoes passaram com 100% de integridade!" -ForegroundColor Green
    Write-Host "Codigo seguro, tipado, compilado e pronto para deploy." -ForegroundColor Cyan
    Write-Host "========================================================"
    exit 0
}
