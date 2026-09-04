# ADR-001: ResponseCache com Stale-While-Revalidate

**Data**: Inferido ~V76-V141 (commits de cache)
**Confiança**: 🟡 INFERIDO

## Contexto
O sistema precisava de cache para reduzir carga no banco MySQL em rotas de alta leitura (LMS modules, admin listings). Cache simples com TTL fixo causava degradação quando expirava e múltiplos requests batiam no banco simultaneamente.

## Decisão
Implementar ResponseCache baseado em arquivos JSON no disco, com stale-while-revalidate:
- Servir dado stale (antigo) enquanto revalida em background
- Cache público (compartilhado globalmente) vs cache privado (segmentado por token de usuário)
- Prefixos de cache para invalidação seletiva

## Alternativas Consideradas
- **Redis**: Descartado por complexidade de infra (VPS dedicada sem Redis)
- **APCu**: Descartado por não persistir entre requests (cache de opcode apenas)
- **MySQL query cache**: Depreciado no MySQL 8.4

## Consequências
- Positivo: Redução drástica de queries MySQL em endpoints de leitura
- Positivo: Invalidação seletiva por prefixo (ex: `admin_lms_modules_`)
- Positivo: Zero dependências externas
- Negativo: Cache em disco (I/O bound em alta concorrência)
- Negativo: Stale data servida por até 1 TTL adicional em pico
