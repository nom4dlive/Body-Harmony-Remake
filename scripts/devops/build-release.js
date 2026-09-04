/**
 * build-release.js
 * 
 * Script de Build Unificado para Deploy (Body Harmony v21)
 * 
 * Objetivo:
 * Gerar estrutura "Clean" em /build/public_html pronta para upload na Hostinger.
 * 
 * Fluxo:
 * 1. Limpar /build/public_html (exceto uploads se existirem)
 * 2. Compilar Frontend (Vite) -> /build/public_html
 * 3. Copiar Backend (API) de src/backend/api -> /build/public_html/api
 * 4. Copiar Assets/Configs (.htaccess, logo, setup)
 * 5. Gerar Relatório de Build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
// Paths
const ROOT = path.resolve(__dirname, '..', '..');
const WEBAPP_ROOT = path.join(ROOT, 'apps/web-app');
// FIX: Build Output must be inside apps/web-app/build for consistency
const BUILD_DIR = path.join(WEBAPP_ROOT, 'build');
const PUBLIC_HTML = path.join(BUILD_DIR, 'public_html');

// Sources
// IMPORTANTE: A fonte da API é apps/web-app/src/backend (Nova Estrutura)
const API_SOURCE = path.join(WEBAPP_ROOT, 'src/backend/api');
const STATIC_SOURCE = path.join(WEBAPP_ROOT, 'src/backend');
const FRONTEND_DIR = path.join(WEBAPP_ROOT); // Vite agora roda na raiz do app
const ENV_SOURCE = path.join(WEBAPP_ROOT, '.env');
const ENV_EXAMPLE = path.join(WEBAPP_ROOT, '.env.example');
const MIGRATIONS_SOURCE = path.join(ROOT, 'infrastructure/database/migrations');

console.log('\n🏗️  Iniciando Build de Release Body Harmony...\n');

// 1. Preparar Diretório
console.log('🧹 Limpando diretório de build...');
if (fs.existsSync(PUBLIC_HTML)) {
    // Preservar uploads, mas SEMPRE limpar api/ e assets/ para garantir sincronização
    const uploadsPath = path.join(PUBLIC_HTML, 'uploads');
    const privateUploadsPath = path.join(PUBLIC_HTML, 'private_uploads');
    const apiPath = path.join(PUBLIC_HTML, 'api');
    const assetsPath = path.join(PUBLIC_HTML, 'assets');
    const indexPath = path.join(PUBLIC_HTML, 'index.html');

    const cleanDirContents = (dirPath) => {
        if (!fs.existsSync(dirPath)) return;
        try {
            const entries = fs.readdirSync(dirPath);
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry);
                try {
                    fs.rmSync(fullPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
                } catch (err) {
                    // Ignore transient Windows file lock
                }
            }
        } catch (err) {
            try {
                fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
            } catch (e) {}
        }
    };

    // SEMPRE limpar api/ e assets/ para forçar cópia fresca
    if (fs.existsSync(apiPath)) {
        console.log('   🔄 Removendo api/ antiga para sincronização...');
        cleanDirContents(apiPath);
    }
    // 🛡️ Graceful Chunk Retention Policy (PLAN-222)
    // Manter chunks recentes para sessões ativas pós-deploy, podando apenas arquivos com mais de 48h
    if (fs.existsSync(assetsPath)) {
        try {
            const now = Date.now();
            const maxAgeMs = 48 * 60 * 60 * 1000; // 48 horas
            const entries = fs.readdirSync(assetsPath);
            let prunedCount = 0;
            for (const entry of entries) {
                const fullPath = path.join(assetsPath, entry);
                try {
                    const stats = fs.statSync(fullPath);
                    if (now - stats.mtimeMs > maxAgeMs) {
                        fs.unlinkSync(fullPath);
                        prunedCount++;
                    }
                } catch (e) {}
            }
            if (prunedCount > 0) {
                console.log(`   🧹 Podados ${prunedCount} chunks com mais de 48h de releases anteriores.`);
            } else {
                console.log('   🛡️ Retendo chunks da release anterior para transição suave (zero 404).');
            }
        } catch (e) {}
    }
    if (fs.existsSync(indexPath)) {
        try { fs.unlinkSync(indexPath); } catch (e) {}
    }

    // Preservar uploads
    if (fs.existsSync(uploadsPath) || fs.existsSync(privateUploadsPath)) {
        console.log('   ℹ️  Preservando pastas de uploads...');
    }
} else {
    fs.mkdirSync(PUBLIC_HTML, { recursive: true });
}
console.log('   ✅ Diretório limpo\n');

// 2. Build Frontend (Vite)
console.log('⚛️  Compilando Frontend (React/Vite)...');
try {
    // Sobrescrever outDir via CLI para garantir destino correto
    // emptyOutDir=false para não apagar o que acabamos de criar (ou preserves)
    const viteCmd = `npm run build -- --outDir "${PUBLIC_HTML}" --emptyOutDir false`;
    console.log(`   Executando: ${viteCmd} em ${FRONTEND_DIR}`);

    const buildLogPath = path.join(FRONTEND_DIR, 'build_output.log');
    const logStream = fs.openSync(buildLogPath, 'w');
    try {
        execSync(viteCmd, {
            cwd: FRONTEND_DIR,
            shell: true,
            stdio: ['ignore', logStream, 'inherit'],
            env: { ...process.env, NODE_ENV: 'production' }
        });
    } finally {
        fs.closeSync(logStream);
    }
    console.log('   ✅ Frontend compilado com sucesso\n');
} catch (e) {
    console.error('   ❌ Falha no build do Frontend:', e.message);
    process.exit(1);
}

// 3. Copiar Backend (API)
console.log('🐘 Copiando Backend (PHP API)...');
const API_TARGET = path.join(PUBLIC_HTML, 'api');

if (fs.existsSync(API_SOURCE)) {
    copyRecursive(API_SOURCE, API_TARGET);

    // Validar arquivos críticos
    if (fs.existsSync(path.join(API_TARGET, 'index.php'))) {
        console.log('   ✅ API copiada com sucesso\n');
    } else {
        console.warn('   ⚠️  Alerta: index.php não encontrado na API copiada!\n');
    }
} else {
    console.error(`   ❌ Fonte da API não encontrada: ${API_SOURCE}`);
    process.exit(1);
}

// 3.0.1 Copiar Migrations (para Nexus Sync)
console.log('📂 Copiando Migrations (Database)...');
const MIGRATIONS_TARGET = path.join(API_TARGET, 'migrations');
if (fs.existsSync(MIGRATIONS_SOURCE)) {
    copyRecursive(MIGRATIONS_SOURCE, MIGRATIONS_TARGET);
    console.log('   ✅ Migrations copiadas com sucesso\n');
} else {
    console.warn(`   ⚠️  Migrations não encontradas em: ${MIGRATIONS_SOURCE}\n`);
}

// 3.0.2 Copiar Scripts de Automação (para rodar via CLI no servidor)
console.log('📂 Copiando Scripts de Automação (CLI)...');
const SCRIPTS_TARGET = path.join(PUBLIC_HTML, 'scripts/lms');
const SCRIPTS_SOURCE = path.join(ROOT, 'scripts/lms');
if (fs.existsSync(SCRIPTS_SOURCE)) {
    copyRecursive(SCRIPTS_SOURCE, SCRIPTS_TARGET);
    console.log('   ✅ Scripts de automação copiados com sucesso\n');
} else {
    console.warn(`   ⚠️  Scripts de automação não encontrados em: ${SCRIPTS_SOURCE}\n`);
}

// 3.1 Copiar Vendor (Dependências PHP)
console.log('📦 Copiando Vendor (Composer)...');
const VENDOR_SOURCE = path.join(WEBAPP_ROOT, 'src/backend/vendor');
const VENDOR_TARGET = path.join(PUBLIC_HTML, 'vendor');

if (fs.existsSync(VENDOR_SOURCE)) {
    copyRecursive(VENDOR_SOURCE, VENDOR_TARGET);
    console.log('   ✅ Vendor copiado com sucesso\n');
} else {
    console.warn('   ⚠️  Vendor não encontrado! Execute composer install.\n');
}

// 4. Arquivos Essenciais (.htaccess, resources)
console.log('📋 Copiando arquivos essenciais...');
const filesToCopy = [
    '.htaccess',
    'setup_auto.php',
    'setup_env.php',
    'logo.svg',
    'logo-white.svg',
    'robots.txt',
    'ping.php'
];

filesToCopy.forEach(file => {
    const src = path.join(STATIC_SOURCE, file);
    // .htaccess, robots.txt e scripts de diagnóstico vão para a raiz, o resto para /api
    const isRootFile = [
        '.htaccess',
        'robots.txt'
    ].includes(file);

    const dest = isRootFile
        ? path.join(PUBLIC_HTML, file)
        : path.join(API_TARGET, file);

    if (file === '.htaccess' && fs.existsSync(path.join(STATIC_SOURCE, '.htaccess.production'))) {
        console.log(`   ✅ Using .htaccess.production for Release`);
        fs.copyFileSync(path.join(STATIC_SOURCE, '.htaccess.production'), dest);
    } else if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`   ✅ ${file}`);
    } else {
        // Tentar buscar no frontend public como fallback
        const fallbackSrc = path.join(FRONTEND_DIR, 'public', file);
        if (fs.existsSync(fallbackSrc)) {
            fs.copyFileSync(fallbackSrc, dest);
            console.log(`   ✅ ${file} (do frontend)`);
        } else {
            console.log(`   ⚠️  ${file} não encontrado (ignorado)`);
        }
    }
});

// 5. Garantir Uploads (apenas públicos)
const foldersToEnsure = ['uploads', 'uploads/crm'];  // REMOVIDO 'private_uploads' - deve ficar FORA do public_html
foldersToEnsure.forEach(folder => {
    const target = path.join(PUBLIC_HTML, folder);
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
        console.log(`   ✅ Pasta ${folder} criada`);
    } else {
        console.log(`   ℹ️  Pasta ${folder} preservada`);
    }
});

// REMOVIDO: private_uploads NÃO deve ser copiada para public_html (VULNERABILIDADE DE SEGURANÇA)
// Arquivos privados (vídeos, etc.) devem permanecer FORA do public_html e serem acessados apenas via stream.php
console.log('🔒 private_uploads: Mantida fora do public_html (segurança)');

// 6. Copiar .env (Desativado para evitar sobrescrever prod com configs locais)
console.log('🔐 Configurando ambiente (.env)... [Ignorado no Build de Release]');
/*
if (fs.existsSync(ENV_SOURCE)) {
    const envTarget = path.join(PUBLIC_HTML, '.env');
    const envApiTarget = path.join(API_TARGET, '.env');
    fs.copyFileSync(ENV_SOURCE, envTarget);
    fs.copyFileSync(ENV_SOURCE, envApiTarget);
    console.log('   ✅ .env incluído na raiz e na pasta /api do build');
} else {
    console.warn('   ⚠️  Aviso: .env não encontrado. Use setup_env.php no servidor como fallback.');
}
*/

// REGRA 22: Unificar diretórios de build entre apps/web-app/build/public_html e build/public_html
const ROOT_PUBLIC_HTML = path.join(ROOT, 'build/public_html');
console.log('🔄 Sincronizando com build/public_html raiz (REGRA 22)...');
copyRecursive(PUBLIC_HTML, ROOT_PUBLIC_HTML);
console.log('   ✅ Diretórios de build unificados');

console.log('\n========================================');
console.log('🚀 BUILD RELEASE SUCESSO');
console.log('========================================');
console.log(`📂 Output: ${PUBLIC_HTML}`);
console.log('👉 Próximo: Execute Operations/deploy-release.ps1');

// Helper
function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Ignorar logs, node_modules e pastas temporárias de cache
        if (['node_modules', 'Logs', '.git', 'tmp', 'temp', 'ttfontdata'].includes(entry.name)) continue;

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
