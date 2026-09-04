# Máquinas de Estado — Body Harmony

> Gerado pelo Detective em 2026-06-02
> Confiança: 🟢 CONFIRMADO | 🟡 INFERIDO

## 1. Licenciada Auth — Lockout State Machine

```
                    [failed_login_attempts < MAX]
                    ┌──────────────────────────────────┐
                    │                                  │
                    v                                  │
┌──────────┐   falha    ┌──────────────┐   limite     ┌──────────────┐
│  ACTIVE  │ ────────→  │  LOCKED      │  atingido    │  TEMP-BLOCK  │
│          │           │  (tentativas) │ ←────────── │  (locked_at) │
└──────────┘           └──────────────┘              └──────────────┘
    │  │                                                  │
    │  │ sucesso                                          │ tempo
    │  └──────────────────────────────────────────────────┘
    │                                                     │
    │  reset tentativas                                   │ v
    └─────────────────────────────────────────────────────┘
                                                    ┌──────────────┐
                                                    │   ACTIVE     │
                                                    │  (reaberto)  │
                                                    └──────────────┘
```

- **Gatilho LOCKED**: `failed_login_attempts >= MAX_ATTEMPTS` (configurável via nexus_security_rules)
- **Gatilho UNLOCK**: tempo decorrido >= `locked_until` OU admin reset
- **Campos**: `licenciadas.locked_until`, `licenciadas.failed_login_attempts`

## 2. Aluna Auth — Lockout State Machine

```
Idêntica à licenciada, mas com MAX_DEVICES = 1 (vs 2 da licenciada)
```

## 3. LMS Progress — Lesson State Machine

```
┌──────────┐   play     ┌──────────────┐   progress > 0  ┌──────────────┐
│  UNSEEN  │ ────────→  │  WATCHING    │ ─────────────→  │  IN PROGRESS │
│          │            │  (progress=0)│                 │ (0<p<100)    │
└──────────┘            └──────────────┘                 └──────────────┘
                                                               │
                                                         is_completed=1
                                                               │
                                                               v
                                                         ┌──────────────┐
                                                         │  COMPLETED   │
                                                         │ (p=100)      │
                                                         └──────────────┘
```

- **Gatilho UNSEEN → WATCHING**: 1º INSERT em `lms_progress` (log PLAY)
- **Gatilho IN PROGRESS → COMPLETED**: frontend envia `is_completed=1` (log LESSON_COMPLETE)
- **Transição permitida**: COMPLETED pode voltar a WATCHING se admin resetar

## 4. LMS Strict Progression — Module Lock State

```
                    ┌──────────────────┐
                    │   MODULE N       │
                    │   (disponível)   │
                    └────────┬─────────┘
                             │
                    [Quiz do módulo N existe?]
                             │
               ┌─────── Sim ───┴─── Não ───────┐
               v                                v
     ┌──────────────────┐            ┌──────────────────┐
     │  PRECISA PASSAR  │            │  MODULE N+1      │
     │  (locked=true)   │            │  (disponível)     │
     └────────┬─────────┘            └──────────────────┘
              │
    [Tentativa com passed=1?]
              │
     ┌─── Sim ┴─── Não ─────┐
     v                      v
┌──────────┐      ┌──────────────┐
│  UNLOCK  │      │   LOCKED     │
│ (acesso) │      │ (bloqueado)  │
└──────────┘      └──────────────┘
```

## 5. AI Clinical Case — Review State Machine

```
┌────────────┐   analyze()    ┌──────────────┐
│  SUBMITTED │ ────────────→  │  ANALYZED    │
│  (upload)  │                │              │
└────────────┘                └──────┬───────┘
                                     │
                        ┌────────────┼────────────┐
                        │            │            │
                   crisis=true  needs_review   confidence>=threshold
                   ou confidence < threshold     e !crisis
                        │            │            │
                        v            v            │
                   ┌────────┐  ┌──────────┐       │
                   │ PENDING │  │ PENDING  │       │
                   │(crise)  │  │(revisão) │       │
                   └────┬────┘  └────┬─────┘       │
                        │            │             │
                        └──────┬─────┘             │
                               │                   │
                     mentor submitReview()         │
                               │                   │
                               v                   v
                         ┌──────────┐       ┌──────────┐
                         │ REVIEWED │       │ANALYZED  │
                         │          │       │(auto)    │
                         └──────────┘       └──────────┘
```

- **Gatilho ANALYZED → PENDING**: confidence < threshold (0.80) OU crisis detected
- **Gatilho PENDING → REVIEWED**: mentor humano submitReview() com notas
- **Gatilho CRISIS**: palavras de desistência → needs_review=1 forçado mesmo após análise

## 6. Lead — Status State Machine

```
┌──────────┐               ┌────────────┐
│   NEW    │ ────────────→ │ CONTACTED  │
└──────────┘               └──────┬─────┘
                                  │
                         ┌────────┼────────┐
                         │        │        │
                         v        v        v
                    ┌────────┐ ┌────────┐ ┌────────┐
                    │QUALIFIED│ │LOST    │ │ARCHIVED│
                    └────────┘ └────────┘ └────────┘
```

- Transições manuais via admin PUT `/admin/leads/{id}`

## 7. Broadcast — Active State

```
              toggle()             toggle()
┌──────────┐ ──────────→ ┌──────────────┐ ──────────→ ┌──────────┐
│  ACTIVE  │             │   INACTIVE   │             │  ACTIVE  │
└──────────┘ ←────────── └──────────────┘ ←────────── └──────────┘
```

- Simples toggle via `UPDATE system_broadcasts SET is_active = NOT is_active`
- Broadcasts ativos aparecem para usuários não-lidos via LEFT JOIN com NULL check

## 8. LMS Resource — Approval State Machine

```
┌──────────┐             ┌────────────┐
│  PENDING │ ──────────→ │  APPROVED  │
└──────────┘             └────────────┘
       │                        │
       │                   ┌────┴────┐
       v                   v         v
┌──────────┐          ┌────────┐  ┌──────────┐
│ REJECTED │          │ACTIVE  │  │ INACTIVE │
└──────────┘          └────────┘  └──────────┘
```

## 9. Device — Active State

```
              revoke()
┌──────────┐ ──────────→ ┌──────────────┐
│  ACTIVE  │             │   INACTIVE   │
└──────────┘             └──────────────┘
```

- Dispositivos podem ser revogados admin ou automaticamente por limite excedido
- Licenciada: max 2 devices ativos. Aluna: max 1 device ativo.
