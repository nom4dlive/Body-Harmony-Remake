# Fluxograma: Strict Progression Lock (LMS)

> Gerado pelo Archaeologist em 2026-06-02

## Fluxo: Acessar Aulas de um Módulo (`/lms/modules/{id}/lessons`)

```
[Request: GET /lms/modules/{id}/lessons]
        |
        v
[Valida módulo existe e is_active=1]
        |
        |--- Não --> [Response: 404 "Módulo não encontrado"]
        |
        v Sim
[Obtém display_order do módulo atual]
        |
        v
[display_order > 1?]
        |
        |--- Não (1º módulo) --> [Pular verificação]
        |
        v Sim
[Busca módulo anterior (display_order - 1)]
        |
        v
[Módulo anterior tem quiz?]
        |
        |--- Não --> [Pular verificação]
        |
        v Sim
[Busca tentativa do usuário com passed=1]
        |
        v
[Tentativa passou?]
        |
        |--- Não -->
        |     [Response: { locked: true,
        |       locked_reason: "Complete avaliação
        |        do módulo anterior" }]
        |     [Return]
        |
        v Sim
[Continua para carregar aulas]
        |
        v
[Busca lessons do módulo (LEFT JOIN lms_progress)]
        |
        v
[Para cada lesson com attachment_count > 0:
 busca lms_attachments]
        |
        v
[Busca quiz do módulo + última tentativa]
        |
        v
[Monta resposta: module + lessons[] + quiz + certificate_available]
        |
        v
[Response: JSON 200]
```

## Notas
- **Stabilization Bypass**: Se o progression check lançar exceção, loga erro e ignora (permite acesso)
- Progression check foi introduzido na Phase 4 do desenvolvimento
- Quiz considera apenas `passed=1` na última tentativa (ordenada por `attempted_at DESC`)
