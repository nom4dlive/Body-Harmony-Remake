---
schemaVersion: 1
generatedAt: 2026-06-02T21:15:00-03:00
reversa:
  version: "1.2.43"
kind: risk_register
producedBy: strategist
hash: "sha256:f8a9b0c1d2e3"
---

# Risk Register

> Registro de riscos da migração com probabilidade, impacto, mitigação e responsável.

## Riscos

### RISK-001
- **Descrição**: Prazo de 24h insuficiente para construir todo o sistema novo com paridade funcional total
- **Categoria**: organizacional
- **Probabilidade**: alta
- **Impacto**: crítico
- **Severidade combinada**: crítica
- **Trigger / sinal de alerta**: após 12h, menos de 40% dos módulos completos
- **Mitigação**: priorização rigorosa (auth + LMS + doctor-harmony + broadcast como core; CRUDs como Should); template Laravel boilerplate (Breeze/Jetstream) para acelerar auth
- **Plano de contingência**: estender parallel run — o sistema novo entra com funcionalidades core, CRUDs são concluídos durante parallel run antes do cutover
- **Owner**: GERMANO (desenvolvedor)
- **Status**: mitigando

### RISK-002
- **Descrição**: Degradação de performance na VPS KVM 4 com dois sistemas rodando em paralelo
- **Categoria**: técnico
- **Probabilidade**: alta
- **Impacto**: médio
- **Severidade combinada**: alta
- **Trigger / sinal de alerta**: Nginx retornando 502/504; latência do MySQL > 500ms
- **Mitigação**: otimizar Laravel (config cache, route cache, OPcache, query optimization); limitar workers PHP-FPM do sistema novo; usar ResponseCache adaptado
- **Plano de contingência**: desligar sistema legado durante pico de testes do novo, religar depois
- **Owner**: GERMANO
- **Status**: mitigando

### RISK-003
- **Descrição**: Perda ou inconsistência de dados na migração entre bancos MySQL
- **Categoria**: técnico
- **Probabilidade**: média
- **Impacto**: crítico
- **Severidade combinada**: crítica
- **Trigger / sinal de alerta**: constraints de unicidade violadas; registros órfãos; total de registros difere entre legado e novo
- **Mitigação**: script de migração com transação; comparação de counts pré/pós migração; validação de dados críticos (licenciadas, alunas, progresso)
- **Plano de contingência**: rollback do banco novo e re-executa ETL com correções; manter dump do legado antes da migração
- **Owner**: GERMANO
- **Status**: mitigando

### RISK-004
- **Descrição**: Integração com Google Gemini API falha ou muda de preço/modelo
- **Categoria**: técnico
- **Probabilidade**: baixa
- **Impacto**: alto
- **Severidade combinada**: média
- **Trigger / sinal de alerta**: 4xx/5xx da API Gemini; alteração de termos
- **Mitigação**: abstrair GeminiService atrás de uma interface (AIServiceInterface) para permitir troca de provider sem rewrites
- **Plano de contingência**: fallback para respostas mockadas ou modelo alternativo (GPT-4, Claude)
- **Owner**: GERMANO
- **Status**: mitigando

### RISK-005
- **Descrição**: Regras de negócio não documentadas ou mal interpretadas nas specs levam a paridade imperfeita
- **Categoria**: técnico
- **Probabilidade**: média
- **Impacto**: alto
- **Severidade combinada**: alta
- **Trigger / sinal de alerta**: testes de paridade falham; usuários reportam comportamento diferente
- **Mitigação**: parallel run com comparação de outputs para rotas críticas (auth, LMS progresso, doctor-harmony); revisão cruzada com o legado
- **Plano de contingência**: registrar deviations em screen_deviation_log.md e ajustar na iteração seguinte
- **Owner**: GERMANO
- **Status**: mitigando

### RISK-006
- **Descrição**: LGPD compliance — consentimento de dados de licenciadas para uso na IA não é migrado corretamente
- **Categoria**: regulatório
- **Probabilidade**: baixa
- **Impacto**: crítico
- **Severidade combinada**: alta
- **Trigger / sinal de alerta**: flag ai_usage ausente ou com valor incorreto após migração
- **Mitigação**: verificar explicitamente o campo `lgpd_status` durante ETL; logging de auditoria de consentimento
- **Plano de contingência**: re-extrair dados de consentimento do dump original e re-aplicar
- **Owner**: GERMANO
- **Status**: mitigando

### RISK-007
- **Descrição**: Risco de escopo — tentar migrar Landing Pages legadas (Vite/React) para o mesmo repositório novo
- **Categoria**: técnico
- **Probabilidade**: média
- **Impacto**: médio
- **Severidade combinada**: média
- **Trigger / sinal de alerta**: conflitos de dependência entre o SPA principal e os projetos de landing page
- **Mitigação**: landing pages podem coexistir como projetos Vite separados no mesmo repositório, sem necessidade de migração para Laravel
- **Plano de contingência**: manter landing pages na estrutura atual e só referenciá-las via link
- **Owner**: GERMANO
- **Status**: mitigando

### RISK-008
- **Descrição**: Mudança de paradigma (OO clássico → OO com DI) causa rejeição de código por parte do desenvolvedor devido a boilerplate adicional
- **Categoria**: organizacional
- **Probabilidade**: baixa
- **Impacto**: baixo
- **Severidade combinada**: baixa
- **Trigger / sinal de alerta**: tentativas de usar `global` ou Singleton no novo Laravel
- **Mitigação**: usar geradores do Laravel (make:model, make:controller, make:service) que já produzem código DI-ready; referência ao paradigm_decision.md
- **Plano de contingência**: code review focado em honrar paradigma OO com DI
- **Owner**: GERMANO
- **Status**: mitigando

## Resumo por severidade

| Severidade | Quantidade | IDs |
|---|---|---|
| Crítica | 2 | RISK-001, RISK-003 |
| Alta | 2 | RISK-002, RISK-005 |
| Média | 2 | RISK-004, RISK-007 |
| Baixa | 2 | RISK-006, RISK-008 |

## Riscos relacionados ao paradigma alvo

- **RISK-008**: mudança de OO clássico para OO com DI pode gerar código que não honra o paradigma (global inject, singletons). Mitigado com geradores Laravel + referencia à paradigm_decision.md.
- **RISK-002**: performance impacto do Laravel (mais overhead que PHP vanilla) na KVM 4 limitada. Mitigado com cache e otimizações.
