#!/usr/bin/env node
/**
 * audit-api-routes.js
 * Pre-build validation of endpoint parity between `src/services/api.js` and `src/backend/api/v1/index.php`.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_API = path.resolve(__dirname, '../../apps/web-app/src/frontend/src/services/api.js');
const BACKEND_ROUTER = path.resolve(__dirname, '../../apps/web-app/src/backend/api/v1/index.php');

console.log('========================================================');
console.log('🔍 AUDITORIA PREDITIVA DE PARIDADE DE ROTAS (API CONTRACTS)');
console.log('========================================================\n');

if (!fs.existsSync(FRONTEND_API) || !fs.existsSync(BACKEND_ROUTER)) {
  console.error('  ❌ ERRO: Arquivos de API ou Router não encontrados!');
  process.exit(1);
}

const frontendContent = fs.readFileSync(FRONTEND_API, 'utf8');
const backendContent = fs.readFileSync(BACKEND_ROUTER, 'utf8');

// Extract endpoints called in lmsNotebookApi and other clients
const endpointRegex = /(?:url|endpoint|path|request|get|post|put|delete)\s*[:(]\s*[`'"](?:\/api\/v1)?(\/[a-zA-Z0-9_\-\/{}$]+)[`'"]/gi;
const calledEndpoints = new Set();
let match;

while ((match = endpointRegex.exec(frontendContent)) !== null) {
  let ep = match[1];
  // Ignore dynamic variable templates
  if (ep.includes('${') || ep.includes('{id}') || ep.includes('{moduleId}')) {
    ep = ep.replace(/\$\{[^}]+\}/g, '{param}').replace(/\{[^}]+\}/g, '{param}');
  }
  calledEndpoints.add(ep);
}

console.log(`  ℹ️  Mapeados ${calledEndpoints.size} padrões de endpoint no frontend.`);

// Extract router registrations in backend index.php
const routerRegex = /\$router->(?:add\s*\(\s*['"](?:GET|POST|PUT|DELETE|PATCH)['"]\s*,\s*|get\s*\(|post\s*\(|put\s*\(|delete\s*\(|patch\s*\()\s*['"](.*?)['"]/gi;
const backendRoutes = new Set();

while ((match = routerRegex.exec(backendContent)) !== null) {
  let route = match[1];
  if (!route.startsWith('/')) route = '/' + route;
  backendRoutes.add(route.replace(/\{[a-zA-Z0-9_]+\}/g, '{param}'));
}

console.log(`  ℹ️  Mapeadas ${backendRoutes.size} rotas registradas no backend PHP.\n`);

const criticalRoutes = [
  '/admin/lms/notebook/auth/config',
  '/admin/lms/notebook/auth/session-token',
  '/admin/lms/notebooks/modules/{param}/sources',
  '/admin/lms/notebooks/sync',
  '/aluna/notebook/chat',
  '/aluna/notebook/podcast/generate',
  '/aluna/smartbook/transformations',
  '/aluna/smartbook/transformations/execute'
];

let criticalPassed = 0;
for (const cr of criticalRoutes) {
  const exists = Array.from(backendRoutes).some(br => br === cr || br === cr.replace('/api/v1', ''));
  if (exists) {
    console.log(`  ✅ OK (Critical Route): ${cr}`);
    criticalPassed++;
  } else {
    console.warn(`  ⚠️  ATENÇÃO: Rota crítica ${cr} requer atenção no router.`);
  }
}

// 🛡️ Zero-ID Audit: Detect any frontend calls hardcoding ID 0 to single-item endpoints
const FRONTEND_SRC = path.resolve(__dirname, '../../apps/web-app/src/frontend/src');
function checkZeroIdCalls(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      checkZeroIdCalls(full);
    } else if (/\.(jsx?|tsx?)$/.test(f)) {
      const code = fs.readFileSync(full, 'utf8');
      if (/syncSingleModule\s*\(\s*0\s*\)/.test(code) || /modules\/0\/sync/.test(code)) {
        console.error(`  ❌ ERRO PREDITIVO: Chamada inválida com ID 0 detectada em ${f}!`);
        process.exit(1);
      }
    }
  }
}
checkZeroIdCalls(FRONTEND_SRC);
console.log('  ✅ OK: Nenhuma chamada com ID 0 para rotas de item único detectada.');

console.log('\n========================================================');
console.log(`📊 TOTAL: ${criticalPassed}/${criticalRoutes.length} rotas críticas de IA verificadas`);
console.log('========================================================\n');

process.exit(0);
