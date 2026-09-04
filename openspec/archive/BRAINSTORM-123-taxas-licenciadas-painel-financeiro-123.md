# BRAINSTORM-123 — Integração de Taxas de Licenciamento no Painel Financeiro

**ID:** 123
**Slug:** taxas-licenciadas-painel-financeiro
**Data:** 2026-08-25
**Stakeholder:** Jurídico & Financeiro
**Base de Dados:** `relatorio_taxas_licenciadas.html` (13 licenciadas, R$ 74.400 total)

---

## 1. Contexto Técnico do Problema

O relatório jurídico (`relatorio_taxas_licenciadas.html`) mapeia **13 licenciadas** com taxas iniciais de licenciamento, mas opera como um silo isolado — sem integração com o Painel Financeiro (PLAN-122) ou com o fluxo de emissão de contratos (OnboardingService). Os valores pagos não são registrados automaticamente no banco de dados, exigindo entrada manual e sujeita a erro humano.

### Dados do Relatório Jurídico

| Licenciada | Valor | Modalidade | Status | Cidade/UF |
|:---|:---|:---|:---|:---|
| Jaqueline Leal Venturini | R$ 6.000 | PIX | Assinado | Linhares/ES |
| Joice Aparecida Ferreira | R$ 6.200 | À Vista | Assinado + Eletro Face | Maria Helena/PR |
| Luana Ramos | R$ 6.500 | Cartão + Saldo | Assinado + Ouvinte R$ 2k | Itajubá/MG |
| Mariana Cristina Tiamazo | R$ 6.200 | PIX Fracionado | Assinado | Cordeirópolis/SP |
| Mariana Pereira Telles da Costa | R$ 7.000 | Cartão 5x (Stone) | Assinado | Uberaba/MG |
| Mariany Vieira Rahal | R$ 7.000 | Cartão | Assinado | Frutal/MG |
| Nathália Kluczkowski | R$ 7.000 | Cartão 12x (Stone) | Assinado | Prudentópolis/PR |
| Nilsuelen Barbosa Garcia | R$ 7.000 | Cartão 12x (InfinitePay) | Assinado | Araçatuba/SP |
| Thamirez Souza Santana Silva | R$ 6.200 | Cartão à vista | Assinado | Internacional/Brasil |
| Yonalia Santos de Oliveira | R$ 7.000 | PIX | Assinado | Salvador/BA |
| **Francisnara Isabel Paes Pereira** | **R$ 6.300** | **PIX** | **Pago 22/08 — Pendente Contrato** | Santa Bárbara/MG |
| Marcela Rodrigues Coelho | - | - | Sem Documentos | A definir |
| Marina Schneider | - | - | Apenas Foto | A definir |

**Totais:**
- Contratos formais: R$ 66.100 (10 licenciadas)
- Geral com adicionais: R$ 74.400 (Francisnara R$ 6.300 + Ouvinte Luana R$ 2.000)
- Ticket médio: R$ 6.610

---

## 2. Espaço Negativo (Fora de Escopo)

- **VPS Dedicada (2.25.156.25):** Nenhum impacto. Este brainstorm é 100% Hostinger Premium (Frontend + API PHP + MySQL).
- **Traefik / Docker:** Não aplicável.
- **Streaming de Vídeo LMS:** Não impactado.
- **Chaves SSH / Credenciais:** Nenhuma nova credencial necessária. Dados transitam via API interna autenticada.

---

## 3. Análise Transversal em Seis Camadas

### 3.1 Dados (MySQL)

**Situação Atual:** A tabela `licenciadas` (REGRA 8: coluna `cpf`) possui dados cadastrais mas **não** possui campos dedicados para taxas de licenciamento. A tabela `financial_transactions` (PLAN-122) registra transações genéricas mas não está vinculada ao fluxo de onboarding.

**Impacto:**
- Necessidade de enriquecer o schema `licenciadas` com campos opcionais de taxa (ou criar tabela de histórico de taxas).
- Vincular transações financeiras ao `source_type = 'licenciada_onboarding'` quando o pagamento da taxa é confirmado.
- A tabela `financial_transactions` já suporta `source_type` e `source_id` — basta padronizar o tipo.

**Migração Necessária:** Sim — adicionar colunas opcionais em `licenciadas` ou criar tabela `licenciada_taxas`.

### 3.2 Backend (PHP 8.4 Services)

**Serviços Impactados:**
- **`OnboardingService.php`**: Ao finalizar o onboarding (status `ATIVO_LIBERADO`), registrar automaticamente a transação financeira.
- **`FinancialService.php`**: Novo método para listar taxas de licenciamento vinculadas a contratos.
- **`ContractService.php`** (se existir): Ao compilar o contrato, preencher o valor da Cláusula 7ª dinamicamente.

**Novo Serviço:** `LicenseTaxService.php` — centraliza lógica de cálculo, registro e consulta de taxas.

### 3.3 APIs & Contratos

**Novos Endpoints:**
| Método | Rota | Descrição |
|:---|:---|:---|
| `GET` | `/admin/financial/license-taxes` | Lista taxas com filtros (status, modalidade, período) |
| `POST` | `/admin/financial/license-taxes` | Registra taxa manualmente (para casos como Francisnara) |
| `GET` | `/admin/financial/license-taxes/summary` | KPIs consolidados (total, ticket médio, pendências) |
| `PATCH` | `/admin/financial/license-taxes/{id}` | Atualiza status (ex: de "pago" para "contrato_assinado") |

**Contratos JSON:** `openspec/contracts/admin/financial/license_taxes*.json`

### 3.4 Rotas & Navegação

**Frontend:**
- Nova aba/sub-página dentro de `/portal-gestor/financeiro` chamada "Taxas de Licenciamento".
- Link na sidebar do AdminLayout sob o grupo Financeiro.
- Botão de ação "Registrar Taxa" no card de nova licenciada no Onboarding.

**Backend:**
- Rotas sob `/admin/financial/license-taxes/*` protegidas por `financial_manage` (RBAC existente).
- Middleware de autenticação admin padrão.

### 3.5 Interface (Frontend React)

**Novo Componente:** `LicenseTaxesPage.jsx`
- **KPI Grid:** Total Contratado, Ticket Médio, Pendências Documentais, Taxa de Conversão (pago/assinado).
- **Tabela Principal:** Estilo idêntico ao relatório HTML — avatar, nome, CNPJ, valor, modalidade, status, ações.
- **Filtros:** Por modalidade (PIX/Cartão), faixa de valor (R$ 6.000/R$ 7.000), status (Assinado/Pendente).
- **Modal de Detalhes:** Cláusula 7ª completa, dados cadastrais, comprovantes.
- **Card de Pendências:** Licenciadas sem contrato (Francisnara, Marcela, Marina) com CTA de ação.

**Reuso:** Seguir padrão de `FinancialTransactionsPage.jsx` (tabela paginada, filtros, modal).

### 3.6 Marca & Identidade

- **Cores:** Navy `#0A3E60` para cabeçalhos e KPIs primários. Gold `#ED7E13` para badges de status "Pago" e CTAs.
- **Tipografia:** `Montserrat` bold para valores monetários, regular para detalhes.
- **Alvos de toque:** Botões de ação >= 44x44px, cards com hover elevation.
- **Badges:** `badge-gold` para "Contrato Assinado", `badge-success` para "Pago", `badge-warning` para "Pendente", `badge-danger` para "Sem Documentos".

---

## 4. Três Opções de Arquitetura

### Opção A — Conservadora (Low Risk)
**Esforço:** ~3 dias | **Risco:** Baixo

**Abordagem:** Importação manual + dashboard read-only.

- Criar tabela `licenciada_taxas` com campos: `licenciada_id`, `valor_cents`, `modalidade`, `status`, `comprovante_url`, `contrato_assinado_at`.
- Inserir os 13 registros do relatório via migration seed.
- Dashboard somente leitura no Painel Financeiro.
- Sem automação — entrada manual para novas licenciadas.

**Prós:**
- Entrega rápida, zero risco de quebra.
- Dados históricos preservados.

**Contras:**
- Não sincroniza com onboarding.
- Requer dupla entrada (onboarding + financeiro).

### Opção B — Recomendada (Balanced) ⭐
**Esforço:** ~6 dias | **Risco:** Médio-Baixo

**Abordagem:** Integração ponta a ponta Onboarding → Financeiro → Contratos.

1. **Migração V123:** Adicionar colunas `licensing_fee_cents`, `licensing_fee_method`, `licensing_fee_paid_at` em `licenciadas` (ou tabela dedicada).
2. **Hook no OnboardingService:** Ao mudar status para `ATIVO_LIBERADO`, criar `financial_transactions` automaticamente com `source_type = 'licenciada_onboarding'`.
3. **ContractService:** Preencher valor da Cláusula 7ª dinamicamente a partir do campo `licensing_fee_cents`.
4. **LicenseTaxService:** CRUD completo + KPIs + filtros.
5. **LicenseTaxesPage.jsx:** Dashboard interativo com tabela, filtros, modal e pendências.
6. **Seed:** Inserir os 13 registros históricos do relatório jurídico.

**Prós:**
- Sincronização automática onboarding → financeiro.
- Contratos refletem valor real pago.
- Dashboard completo e interativo.

**Contras:**
- Requer alteração em `OnboardingService` ( ponto crítico).
- migração de dados para licenciadas existentes.

### Opção C — Next-Gen (High Performance)
**Esforço:** ~12 dias | **Risco:** Alto

**Abordagem:** Motor de cobrança integrado + webhook Stone bidirecional + QR Code de pagamento.

- Tudo da Opção B +
- Webhook Stone cria transação automaticamente ao detectar pagamento de taxa.
- QR Code PIX gerado dinamicamente para novas licenciadas.
- Sistema de lembretes automáticos (WhatsApp) para pendências.
- Relatório DRE segmentado por licenciada.
- Exportação fiscal (SPED/RFB) automatizada.

**Prós:**
- Automação total, zero entrada manual.
- Conformidade fiscal robusta.

**Contras:**
- Complexidade elevada, depende de validação Stone.
- Custo de desenvolvimento 4x maior.
- Pode atrasar outras features do roadmap.

---

## 5. Veredito Técnico

### **Recomendação: Opção B (Balanced)**

A Opção B equilibra velocidade de entrega com integridade de dados. A sincronização Onboarding → Financeiro elimina a dupla entrada e garante que todo contrato gerado tenha seu valor financeiro registrado automaticamente. A seed com os 13 registros históricos assegura que o relatório jurídico seja refletido no dashboard imediatamente.

**Justificativa adicional:**
- A REGRA 10 (Dual-Signature Invariant) exige que contratos assinados por ambas as partes sejam rastreados — a Opção B vincula assinatura ao pagamento.
- A REGRA 8 (Licenciadas CPF Invariant) garante que queries usem `l.cpf` — a integração respeita este invariante.
- O webhook Stone já foi refatorado no PLAN-122 — a Opção B reutiliza essa infraestrutura.

---

## 6. Matriz de Segurança e Riscos

| Risco | Severidade | Mitigação |
|:---|:---|:---|
| Quebra de onboarding ao adicionar hook | **ALTO** | Testes unitários do hook antes de deploy; hook em transaction separada |
| Migração corrompendo dados existentes | **MÉDIO** | `ALTER TABLE ... ADD COLUMN ... DEFAULT NULL` (sem quebra de schema) |
| Dados financeiros duplicados | **MÉDIO** | Constraint `UNIQUE(licenciada_id, source_type)` na tabela de taxas |
| Exposição de valores em API pública | **BAIXO** | Todas as rotas são `/admin/*` com autenticação RBAC `financial_manage` |
| Webhook Stone criando transações duplicadas | **BAIXO** | Idempotência via `source_id` único (já implementado no PLAN-122) |

---

## 7. Próximos Passos Recomendados

1. Executar `/plan` para transformar a **Opção B** em um `PLAN-123` com deltas atômicos.
2. Priorizar a migração V123 e o `LicenseTaxService` no Delta 1.
3. Validar com o stakeholder jurídico os 13 registros antes da seed.
