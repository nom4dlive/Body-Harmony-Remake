# PLAN-066 — Dashboard de Métricas do Funil de Onboarding

**Status**: `IMPLEMENTATION`
**Protocolo**: Nexus Protocol V3.1
**Autor**: Antigravity Agent
**Data**: 2026-08-21
**Contrato de API**: [`openspec/contracts/admin/gestor-onboarding-metrics.json`](../contracts/admin/gestor-onboarding-metrics.json)

---

## 📋 Objetivo

Integrar um **bloco visual de métricas do Funil de Onboarding de Licenciadas** diretamente no Dashboard do Gestor (`/admin`), exibindo em tempo real:

- Contagens de licenciadas em cada um dos 5 estágios do funil
- Taxa de conversão (Pré-cadastro → Ativo & Liberado)
- Alertas de ação (ex: licenciadas aguardando assinatura há +24h)
- Atalho direto para o `OnboardingFunnelPage.jsx`

---

## 🎯 Escopo (In Scope)

1. **Backend PHP 8.4** — Novo método `getMetrics()` no `OnboardingService.php` + nova rota `GET /admin/onboarding/metrics` em `OnboardingController.php` e `index.php`.
2. **Frontend React 18** — Novo componente `OnboardingMetricsWidget.jsx` integrado ao `Dashboard.jsx` como widget collapsible (seguindo o padrão do `DashboardWidget`).
3. **API JS** — Novo método `onboardingApi.getMetrics()` em `api.js`.
4. **Testes** — Extensão do `tests/onboarding_funnel_smoke_test.php` com o teste do endpoint de métricas.

## ⛔ Espaço Negativo (Out of Scope)

- Nenhuma alteração no schema do banco de dados (sem novas tabelas/migrations).
- Sem alteração na `OnboardingFunnelPage.jsx` (apenas o Dashboard recebe o widget novo).
- Sem integração com gráficos externos (Chart.js / Recharts) — apenas cards de estatísticas puros.

---

## 🔗 Contrato JSON Associado

**Arquivo**: `openspec/contracts/admin/gestor-onboarding-metrics.json`

**Endpoint**: `GET /api/v1/admin/onboarding/metrics`
**Auth**: admin | superadmin

**Response esperada**:
```json
{
  "success": true,
  "metrics": {
    "total": 47,
    "por_estagio": {
      "PRE_CADASTRO": 10,
      "CONTRATO_EMITIDO": 8,
      "AGUARDANDO_ASSINATURA": 12,
      "VALIDAR_PAGAMENTO": 5,
      "ATIVO_LIBERADO": 9,
      "CANCELADO": 3
    },
    "taxa_conversao_pct": 19.15,
    "taxa_abandono_pct": 6.38,
    "alertas_assinatura_pendente": 4,
    "ativacoes_no_periodo": 3,
    "contratos_emitidos_no_periodo": 7
  }
}
```

---

## 🛠️ Checklist de Implementação Atômica

### Backend PHP 8.4

- [ ] **1.** Adicionar método `getMetrics(int $periodoDias = 30): array` em `OnboardingService.php`
  - Agrega contagens por `status` via `COUNT(*) GROUP BY status`
  - Calcula `taxa_conversao_pct` e `taxa_abandono_pct`
  - Conta `alertas_assinatura_pendente` (status `AGUARDANDO_ASSINATURA` + `last_reminder_sent_at` NULL ou < NOW() - 24h)
  - Conta ativações e contratos emitidos dentro de `periodo_dias` dias
- [ ] **2.** Adicionar método `getMetrics()` em `OnboardingController.php` que chama o service e responde JSON
- [ ] **3.** Registrar rota `GET /admin/onboarding/metrics` em `api/v1/index.php`

### Frontend React 18

- [ ] **4.** Criar `apps/web-app/src/frontend/src/pages/Admin/components/OnboardingMetricsWidget.jsx`
  - Cards de estatísticas: Total, Pré-cadastro, Contrato Emitido, Aguardando Assinatura, Validar Pagamento, Ativo & Liberado, Cancelado
  - Badge de alerta 🔴 se `alertas_assinatura_pendente > 0`
  - Barra de progresso Gold de conversão (`taxa_conversao_pct`)
  - Botão CTA Gold "Ver Funil Completo" → `/admin/onboarding`
  - Skeleton loader enquanto carrega, auto-refresh a cada 60s
- [ ] **5.** Adicionar `onboardingApi.getMetrics()` em `api.js`
- [ ] **6.** Integrar `<OnboardingMetricsWidget />` no `Dashboard.jsx` como novo `DashboardWidget` entre "Equipe & Licenciadas" e "Estúdio de Conteúdo"

### Testes & Build

- [ ] **7.** Estender `tests/onboarding_funnel_smoke_test.php` com Teste 8 — validação do endpoint `/admin/onboarding/metrics`
- [ ] **8.** Executar `php tests/onboarding_funnel_smoke_test.php` e atestar 8/8 PASS
- [ ] **9.** Executar `npm run build` em `apps/web-app` e atestar Exit Code 0
- [ ] **10.** Atualizar `openspec/tracker/task.md` e arquivar em `openspec/archive/`

---

## ✅ Critérios de Aceitação

| Critério | Descrição |
|:---|:---|
| Query SQL | `COUNT(*) GROUP BY status` com Prepared Statements PDO (100% SQLi-safe) |
| Alertas | Badge vermelho aparece quando há licenciadas em `AGUARDANDO_ASSINATURA` há +24h |
| Performance | Endpoint responde em < 200ms (query simples de agregação) |
| Responsivo | Widget renderiza corretamente em mobile 375px e desktop 1440px |
| Paleta V3.1 | Cards usam Navy Blue (`#0A3E60`) e Gold (`#ED7E13`); alertas usam vermelho apenas para badges de urgência |
| Sem regressões | Build Vite Exit Code 0 e smoke test 8/8 PASS |
