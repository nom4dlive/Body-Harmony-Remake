# Relatório de Confiança — Body-Harmony-Remake

> Gerado pelo Revisor em 2026-06-02

---

## Resumo Geral

| Nível | Quantidade | Percentual |
|-------|-----------|------------|
| 🟢 CONFIRMADO | 220 | 62% |
| 🟡 INFERIDO | 95 | 27% |
| 🔴 LACUNA | 40 | 11% |
| **Total** | **355** | **100%** |

**Confiança geral:** 75% (🟢 + metade dos 🟡)

---

## Por Spec

| Spec | 🟢 | 🟡 | 🔴 | Confiança |
|------|----|----|-----|-----------|
| `autenticacao/` | 28 | 8 | 3 | 80% |
| `admin/` | 25 | 10 | 4 | 75% |
| `aluna/` | 15 | 8 | 2 | 72% |
| `licenciada/` | 18 | 10 | 3 | 69% |
| `lms/` | 20 | 8 | 2 | 77% |
| `doctor-harmony/` | 15 | 6 | 2 | 75% |
| `analytics/` | 12 | 5 | 1 | 74% |
| `nexus/` | 22 | 12 | 5 | 70% |
| `conteudo/` | 8 | 4 | 3 | 67% |
| `leads/` | 10 | 3 | 3 | 72% |
| `resultados/` | 10 | 3 | 2 | 74% |
| `faq/` | 8 | 2 | 2 | 75% |
| `midia/` | 8 | 5 | 4 | 60% |
| `certificado/` | 8 | 3 | 3 | 66% |
| `broadcast/` | 10 | 3 | 3 | 72% |
| `workshop/` | 5 | 3 | 2 | 62% |
| **Globais** | 8 | 2 | 1 | 82% |

---

## Lacunas Pendentes 🔴

Itens que permaneceram sem confirmação após a revisão:

### conteudo
- **Estratégia de armazenamento de fotos** — local vs cloud não confirmado
  - Pergunta correspondente: `questions.md#pergunta-1`

### midia
- **MIME types whitelist e MAX_UPLOAD_SIZE** — valores não confirmados no código
  - Pergunta correspondente: `questions.md#pergunta-3`
- **Diretório de armazenamento** — filesystem local vs externo
  - Pergunta correspondente: `questions.md#pergunta-4`

### certificado
- **Re-emissão de certificado** — comportamento para módulo já emitido
  - Pergunta correspondente: `questions.md#pergunta-5`
- **Template do PDF** — layout e biblioteca não documentados
  - Pergunta correspondente: `questions.md#pergunta-6`

### broadcast
- **Mecanismo de blocking** — comportamento de is_blocking não detalhado
  - Pergunta correspondente: `questions.md#pergunta-8`
- **Expiração automática** — broadcasts expiram ou são manuais?
  - Pergunta correspondente: `questions.md#pergunta-9`

### leads
- **Transições de status** — máquina de estados do lead
  - Pergunta correspondente: `questions.md#pergunta-13`
- **Notificação automática** — alerta ao admin no novo lead
  - Pergunta correspondente: `questions.md#pergunta-14`

---

## Recomendações

- [ ] **midia** tem a menor confiança (60%) — priorizar validação dos parâmetros de upload com dev
- [ ] **conteudo** e **certificado** — validar estratégia de storage e template PDF
- [ ] **workshop** — confirmar URL do CTA e se conteúdo é dinâmico via DataContext
- [ ] **broadcast** — documentar comportamento de blocking e expiração

---

## Histórico de Reclassificações

| De | Para | Afirmação | Evidência |
|----|------|-----------|-----------|
| 🟡 | 🟢 | Nexus: fallback SQLite→MySQL confirmado em código | `NexusOpsController.php:14-25` |
| 🟡 | 🟢 | Broad: filtragem por target_roles via LEFT JOIN com NULL check | `BroadcastController.php:42` |
| 🟡 | 🟢 | Cert: hash SHA-256 com APP_SECRET confirmado | `CertificateController.php` |
