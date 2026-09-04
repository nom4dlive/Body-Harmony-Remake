---
schemaVersion: 1
generatedAt: 2026-06-02T21:06:00-03:00
reversa:
  version: "1.2.43"
kind: migration_brief
producedBy: orchestrator
hash: "sha256:a1b2c3d4e5f6"
---

# Migration Brief

> Documento de critério de migração coletado em entrevista no início do `/reversa-migrate`.
> Consumido pelos seis agentes do Time de Migração. Não pergunta paradigma (responsabilidade do Paradigm Advisor) nem apetite (derivado em `paradigm_decision.md`).

## Objetivo da migração

Unificar múltiplos sistemas/projetos e bancos de dados que hoje estão em diferentes domínios/servidores em uma única plataforma coesa. O driver principal é performance e escalabilidade — o sistema legado atual não escala para a demanda prevista e a fragmentação de bases de dados e domínios gera complexidade operacional.

## Métricas de sucesso

- **Paridade funcional total**: sistema novo cobre 100% das funcionalidades do legado
- **Performance**: redução significativa no tempo de resposta (a ser definido benchmark comparativo)
- **Qualidade do código**: mínimo de 80% de cobertura de testes automatizados

## Restrições

- **Prazo**: 24 horas para entrega completa
- **Orçamento**: VPS Hostinger KVM 4 já existente (recursos limitados)
- **Técnicas**: múltiplos bancos e domínios precisam ser unificados sem perda de dados; APIs externas e integrações existentes devem continuar funcionando
- **Operacionais**: sistema novo deve rodar em paralelo com o legado na mesma VPS até testes finais autorizarem a migração; janela de cutover deve ser mínima

## Fatores de risco conhecidos

- **Risco de dados (integridade)**: múltiplos bancos e domínios podem ter dados inconsistentes; migração de dados é crítica
- **Risco de escopo (24h)**: prazo extremamente curto para entrega — requer priorização agressiva
- **Risco de integração**: APIs externas e serviços de terceiros não podem quebrar durante a transição
- **Risco de paridade funcional**: funcionalidades podem ser perdidas ou mal interpretadas na migração

## Stakeholders

| Nome / papel | Responsabilidade na migração |
|---|---|
| GERMANO (desenvolvedor) | Decisor técnico e executor da migração |
| Licenciadas (usuárias finais) | Usuárias do sistema — precisam de comunicação clara sobre mudanças |
| Alunas (clientes finais) | Usuárias finais com acesso limitado — não podem ser impactadas negativamente |

## Stack alvo

- **Linguagem**: a definir (Paradigm Advisor recomendará)
- **Framework**: a definir
- **Banco**: a definir (unificação das bases atuais)
- **Mensageria** (se houver): a definir
- **Infra**: Hostinger KVM 4 VPS (mesmo hardware do legado), Docker Compose + Traefik
- **Outros componentes relevantes**: sistema novo deve ser otimizado para performance máxima dentro dos recursos da KVM 4

## Escopo declarado

- **Incluído**: todos os módulos do ecossistema Body Harmony (admin, aluna, licenciada, LMS, conteúdo, certificados, analytics, broadcast, media, nexus/segurança, doctor-harmony/IA, leads, landing pages, frontend SPA, telegram-bot)
- **Excluído**: nenhum — migração completa

## Notas livres

O sistema deve ser otimizado para performance máxima dentro de uma KVM 4 da Hostinger. A VPS já conta com o sistema atual e o novo sistema deve ser testado em paralelo na mesma VPS até que os testes finais autorizem a migração final. O prazo de 24 horas implica que o Paradigm Advisor e o Strategist precisam recomendar uma abordagem ultra-eficiente que maximize reuso e minimize retrabalho.
