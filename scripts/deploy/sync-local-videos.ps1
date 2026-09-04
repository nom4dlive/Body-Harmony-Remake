# ==============================================================================
# Body Harmony - Local LMS Asset Synchronizer (Nexus V3.1)
# Normaliza e sincroniza os vídeos e miniaturas locais com a VPS Hostinger
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path "$PSScriptRoot\..\.."
$EnvFile = "$ProjectRoot\.env.deploy"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         BODY HARMONY - LMS LOCAL ASSET SYNC V3.1         " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. LOAD CONFIGURATION
if (-not (Test-Path $EnvFile)) {
    Write-Error "CRITICAL: .env.deploy not found at $EnvFile"
    exit 1
}

$Config = @{}
Get-Content $EnvFile | Where-Object { $_ -match "^[^#].+=" } | ForEach-Object {
    $parts = $_ -split '=', 2
    $Config[$parts[0].Trim()] = $parts[1].Trim()
}

$SSHHost = $Config["VPS_SSH_HOST"]
$SSHUser = $Config["VPS_SSH_USER"]
$SSHPort = if ($Config.ContainsKey("VPS_SSH_PORT")) { $Config["VPS_SSH_PORT"] } else { "22" }
$RemoteRoot = if ($Config.ContainsKey("VPS_REMOTE_ROOT")) { $Config["VPS_REMOTE_ROOT"] } else { "/opt/bodyharmony" }
$SSHKey = $Config["VPS_SSH_KEY"]

if (-not (Test-Path $SSHKey)) {
    Write-Error "SSH Key not found at $SSHKey"
    exit 1
}

$LocalBackupsDir = "$ProjectRoot\backups\Aulas"
$LocalThumbnailsDir = "$ProjectRoot\private_uploads\thumbnails"
$RemoteLessonsDir = "$RemoteRoot/private_uploads/lessons"
$RemoteThumbnailsDir = "$RemoteRoot/private_uploads/thumbnails"

# 2. PREPARE REMOTE DIRECTORIES
Write-Host "[1/4] Preparing remote directories on VPS..." -ForegroundColor Cyan
& ssh.exe -p $SSHPort -i $SSHKey -o StrictHostKeyChecking=no "${SSHUser}@${SSHHost}" "mkdir -p `"$RemoteLessonsDir`" `"$RemoteThumbnailsDir`" && chmod -R 755 `"$RemoteRoot/private_uploads`""
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to prepare remote directories on VPS"
    exit 1
}
Write-Host "  ✅ Remote directories ready!" -ForegroundColor Green

# 3. UPLOAD THUMBNAILS
Write-Host "`n[2/4] Syncing LMS Thumbnails to VPS..." -ForegroundColor Cyan
if (Test-Path $LocalThumbnailsDir) {
    $thumbs = Get-ChildItem "$LocalThumbnailsDir\*" -Include *.png, *.jpg, *.jpeg -ErrorAction SilentlyContinue
    $count = ($thumbs | Measure-Object).Count
    Write-Host "  Found $count local thumbnails." -ForegroundColor Gray
    
    foreach ($thumb in $thumbs) {
        $name = $thumb.Name
        Write-Host "  📤 Uploading thumbnail: $name..." -ForegroundColor Gray
        & scp.exe -P $SSHPort -i $SSHKey -o StrictHostKeyChecking=no $thumb.FullName "${SSHUser}@${SSHHost}:${RemoteThumbnailsDir}/$name"
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "  ⚠️ Failed to upload thumbnail: $name"
        }
    }
    Write-Host "  ✅ Thumbnails synced successfully!" -ForegroundColor Green
} else {
    Write-Warning "Local thumbnails directory not found: $LocalThumbnailsDir"
}

# 4. MAPPING AND UPLOADING VIDEOS
Write-Host "`n[3/4] Normalizing and Syncing LMS Videos to VPS..." -ForegroundColor Cyan

$VideoMapping = @{
    '01 Introdução ao Body Harmony\Aula 1- Boas vindas.mp4' = 'Introducao_ao_Body_Harmony_Aula_1_-_Boas_vindas.mp4'
    '01 Introdução ao Body Harmony\Aula 2 - Conhecendo a musculatura esqueletica.mp4' = 'Introducao_ao_Body_Harmony_Aula_2_-_Conhecendo_a_musculatura_esqueletica.mp4'
    '01 Introdução ao Body Harmony\Introdução - Aula 3-Composição Muscular.mov' = 'Introducao_ao_Body_Harmony_Aula_3_-_Composicao_Muscular.mov'
    '01 Introdução ao Body Harmony\Introdução - Aula 4 - Fibras Musculares Tipo 1 - BRANCA.mov' = 'Introducao_ao_Body_Harmony_Aula_4_-_Fibras_Musculares_Tipo_1_-_BRANCA.mov'
    '01 Introdução ao Body Harmony\Introdução - Aula 5 - Fibras Musculares - Tipo 2 - Vermelhas.mov' = 'Introducao_ao_Body_Harmony_Aula_5_-_Fibras_Musculares_-_Tipo_2_-_Vermelhas.mov'
    'Aulas Praticas\Gluteo- Colocação de eletrodo e exercicios.mov' = 'Aulas_Praticas_Gluteo_-_Colocacao_de_eletrodo_e_exercicios__69c02b16ee352.mov'
    'Aulas Praticas\Quadriceps - Colocação de eletrodo e exercícios.mov' = 'Aulas_Praticas_Quadriceps_-_Colocacao_de_Eletrodo_e_Exercicios_.mov'
    'Aulas Praticas\Dorsais - Colocação de eletrodo e execução.mov' = 'Aulas_Praticas_Dorsais_-_Colocacao_de_Eletrodo_e_Execucao_.mov'
    'EletroFace -Aula teórica e fundamentos\Eletroface - Teoria.mov' = 'EletroFace_-Aula_teorica_e_fun_Eletroface_-_Teoria_.mov'
    'Fundamentos da Eletroestimulação\Eletroestimulação e seus conceitos.mov' = 'Fundamentos_da_Eletroestimulac_Eletroestimulacao_e_Seus_Conceitos.mov'
    'Interpretação de exames - DR ULISSES LOPES\Aula - TGO E TGP.mov' = 'Interpretacao_de_exames_-_DR_U_Aula_1_-_TGO_E_TGP_.mov'
    'Interpretação de exames - DR ULISSES LOPES\🚨 Aula 02 - CPK (creatinofosfoquinase).mov' = 'Interpretacao_de_exames_-_DR_U__Aula_2_-_CPK_creatinofosfoquinase.mov'
    'Interpretação de exames - DR ULISSES LOPES\Aula 3 - Pancreas e Insulina.mp4' = 'Interpretacao_de_exames_-_DR_U_Aula_3_-_Pancreas_e_Insulina.mp4'
    'Interpretação de exames - DR ULISSES LOPES\Aula 4 - Glucagon.mp4' = 'Interpretacao_de_exames_-_DR_U_Aula_4_-_Glucagon_.mp4'
    'Interpretação de exames - DR ULISSES LOPES\Aula 5 - Testosterona.mp4' = 'Interpretacao_de_exames_-_DR_U_Aula_5_-_Testosterona.mp4'
    'Negocios marketing\Aula 1 - CAIXA RAPIDO.mp4' = 'Negocios_marketing__Aula_1_-_CAIXA_RAPIDO.mp4'
    'Negocios marketing\Aula 2 - CAIXA RAPIDO.mp4' = 'Negocios_marketing__Aula_2_-_CAIXA_RAPIDO.mp4'
    'Negocios marketing\Aula 3 - CAIXA RAPIDO.mp4' = 'Negocios_marketing__Aula_3_-CAIXA_RAPIDO.mp4'
    'Introdução a Prática\Introducao a Pratica - Aula 1.mp4' = 'Introducao_a_Pratica_e_Protoco_Aula_1_-_Mindset_Profissional_e_a_Comunicacao_com_.mp4'
    'Introdução a Prática\Introducao A Pratica - Aula 2.mp4' = 'Introducao_a_Pratica_e_Protoco_Aula_2_-_Protocolos_Iniciais_e_Identificacao_de_Pe.mp4'
    'Introdução a Prática\Introducao A Pratica - Aula 3.mp4' = 'Introducao_a_Pratica_e_Protoco_Aula_3_-_Fatores_de_Sucesso_Metricas_e_Configuraco.mp4'
    'Protocolo 3S.mp4' = 'Protocolo_3s_Masterclass_Protocolo_3S__A_Arte_da_Harmonizacao_C.mp4'
}

foreach ($item in $VideoMapping.GetEnumerator()) {
    $localRel = $item.Key
    $remoteName = $item.Value
    $localFile = "$LocalBackupsDir\$localRel"
    
    if (Test-Path $localFile) {
        $sizeMB = [math]::Round((Get-Item $localFile).Length / 1MB, 1)
        Write-Host "  📤 Uploading: $localRel ($sizeMB MB) -> $remoteName..." -ForegroundColor Gray
        & scp.exe -P $SSHPort -i $SSHKey -o StrictHostKeyChecking=no $localFile "${SSHUser}@${SSHHost}:${RemoteLessonsDir}/$remoteName"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "  ⚠️ Failed to upload $localRel"
        } else {
            Write-Host "  ✅ $remoteName" -ForegroundColor Green
        }
    } else {
        Write-Warning "Local backup file not found: $localFile"
    }
}

# 5. FIX PERMISSIONS ON REMOTE DIR
Write-Host "`n[4/4] Finalizing remote permissions on VPS..." -ForegroundColor Cyan
& ssh.exe -p $SSHPort -i $SSHKey -o StrictHostKeyChecking=no "${SSHUser}@${SSHHost}" "chown -R www-data:www-data `"$RemoteRoot/private_uploads`" && chmod -R 755 `"$RemoteRoot/private_uploads`""
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to finalize remote permissions on VPS"
    exit 1
}
Write-Host "  ✅ Permissions successfully configured!" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "                SYNC COMPLETED SUCCESSFULLY!              " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green

