# ADR-002: Hybrid Review para Casos Clínicos (Option C)

**Data**: Inferido ~Phase 4
**Confiança**: 🟢 CONFIRMADO

## Contexto
Doctor Harmony (IA) analisa casos clínicos com fotos/áudio, mas a confiança da IA varia. Casos críticos ou de baixa confiança precisam de revisão humana para garantir segurança e qualidade.

## Decisão
Implementar sistema híbrido (Option C):
- IA analisa todos os casos
- Se confidence < 0.80 (threshold configurável) → `needs_review=true`, status=PENDING
- Se crise detectada (palavras de desistência) → `needs_review=true`, status=PENDING
- Mentor humano revisa via `submitReview()` e define feedback
- Admin pode configurar threshold, modelo Gemini, system prompt via `ai_config`

## Alternativas Consideradas
- **Option A (Full Auto)**: IA decide tudo sem revisão — risco inaceitável para casos clínicos
- **Option B (Full Manual)**: Todos os casos revisados — não escala
- **Option C (Hybrid)**: Apenas casos abaixo do threshold vão para revisão — equilíbrio ideal

## Consequências
- Positivo: 80%+ dos casos resolvidos automaticamente
- Positivo: Casos críticos sempre revisados (crisis detection + low confidence)
- Positivo: Threshold e prompt configuráveis sem deploy
- Negativo: Casos PENDING podem acumular sem mentores disponíveis
- Negativo: Complexidade adicional de estados (ANALYZED → PENDING → REVIEWED)
