#!/usr/bin/env node
/**
 * audit-lazy-imports.js
 * Pre-build static analysis for all dynamic/lazy imports in React.
 * Validates that every lazy-loaded file exists and has an `export default`.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_SRC = path.resolve(__dirname, '../../apps/web-app/src/frontend/src');

console.log('========================================================');
console.log('🔍 AUDITORIA PREDITIVA DE IMPORTS DINÂMICOS & LAZY LOADS');
console.log('========================================================\n');

let totalLazyFound = 0;
let errors = 0;

function getAllSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllSourceFiles(fullPath, fileList);
    } else if (/\.(jsx?|tsx?)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = getAllSourceFiles(FRONTEND_SRC);

const lazyRegex = /(?:lazy|safeLazy)\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"](.*?)['"]\s*\)\s*\)/g;

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;

  while ((match = lazyRegex.exec(content)) !== null) {
    totalLazyFound++;
    const importPath = match[1];
    const sourceDir = path.dirname(filePath);

    // Resolve extensions
    const candidateExtensions = ['', '.jsx', '.js', '.tsx', '.ts', '/index.jsx', '/index.js'];
    let resolvedPath = null;

    for (const ext of candidateExtensions) {
      const testPath = path.resolve(sourceDir, importPath + ext);
      if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
        resolvedPath = testPath;
        break;
      }
    }

    const relSource = path.relative(FRONTEND_SRC, filePath);

    if (!resolvedPath) {
      console.error(`  ❌ ERRO: Import lazy inexistente em ${relSource} -> '${importPath}'`);
      errors++;
      continue;
    }

    // Check default export
    const targetContent = fs.readFileSync(resolvedPath, 'utf8');
    const hasDefaultExport = /export\s+default\s+|export\s*\{\s*default\s*\}|module\.exports\s*=|export\s+default\s+function|export\s+default\s+class/i.test(targetContent);

    if (!hasDefaultExport) {
      console.error(`  ❌ ERRO: Arquivo ${path.relative(FRONTEND_SRC, resolvedPath)} importado via lazy mas NÃO possui 'export default'!`);
      errors++;
    } else {
      console.log(`  ✅ OK: [${relSource}] -> ${path.relative(FRONTEND_SRC, resolvedPath)}`);
    }
  }
}

console.log('\n========================================================');
console.log(`📊 TOTAL: ${totalLazyFound} imports analisados | ${errors} falhas encontradas`);
console.log('========================================================\n');

if (errors > 0) {
  process.exit(1);
}
process.exit(0);
