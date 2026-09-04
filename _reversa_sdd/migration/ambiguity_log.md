---
schemaVersion: 1
generatedAt: 2026-06-02T21:12:00-03:00
reversa:
  version: "1.2.43"
kind: ambiguity_log
producedBy: curator
hash: "sha256:d5e6f7a8b9c0"
---

# Ambiguity Log

> Consolidação de todos os itens ⚠️ AMBÍGUOS ou pendentes detectados pelos agentes ao longo do pipeline.
> Status final esperado quando o pipeline conclui: nenhum item PENDENTE.

## Resumo
- Total de itens: 3
- PENDENTES: 0
- RESOLVIDOS COM DECISÃO HUMANA: 3
- REFERIDOS À CODIFICAÇÃO: 0

## Itens

### AMB-001
- **Descrição**: Re-emissão de certificado para mesmo módulo — comportamento não documentado no legado
- **Detectado por**: curator (BR-HUMANA-001)
- **Origem**: `_reversa_sdd/target_business_rules.md` § BR-HUMANA-001, `_reversa_sdd/gaps.md` § G05
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: Opção A — Bloquear re-emissão (uma vez por módulo)
  - **Decisor**: GERMANO
  - **Quando**: 2026-06-02T21:13:00-03:00
  - **Justificativa**: Comportamento documentado do legado mantido

### AMB-002
- **Descrição**: Estratégia de armazenamento de fotos não confirmada — local filesystem vs cloud storage
- **Detectado por**: curator (BR-HUMANA-002)
- **Origem**: `_reversa_sdd/target_business_rules.md` § BR-HUMANA-002, `_reversa_sdd/gaps.md` § G01
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: Opção A — Armazenamento local (filesystem VPS)
  - **Decisor**: GERMANO
  - **Quando**: 2026-06-02T21:13:00-03:00
  - **Justificativa**: Menor complexidade para prazo de 24h

### AMB-003
- **Descrição**: Mecanismo de blocking para broadcasts is_blocking — modal bloqueante vs banner não-bloqueante
- **Detectado por**: curator (BR-HUMANA-003)
- **Origem**: `_reversa_sdd/target_business_rules.md` § BR-HUMANA-003, `_reversa_sdd/gaps.md` § G04
- **Status**: RESOLVIDO COM DECISÃO HUMANA
- **Decisão tomada**:
  - **Escolha**: Opção B — Banner no topo (não bloqueante)
  - **Decisor**: GERMANO
  - **Quando**: 2026-06-02T21:13:00-03:00
  - **Justificativa**: UX superior, menos intrusivo

## Itens referidos à codificação
> Lista somente itens com status `REFERIDO À CODIFICAÇÃO`. Aparecem destacados em `handoff.md`.

- Nenhum item referido à codificação até o momento.

## Notas
Itens detectados pelo Curator na análise inicial. Serão resolvidos na pausa humana após o Curator. Após resolução, migrarão para RESOLVIDOS COM DECISÃO HUMANA com as escolhas registradas.
