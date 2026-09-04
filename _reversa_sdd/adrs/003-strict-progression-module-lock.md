# ADR-003: Strict Progression Lock (Phase 4)

**Data**: Inferido ~Phase 4
**Confiança**: 🟢 CONFIRMADO

## Contexto
Licenciadas estavam pulando módulos sem completar a avaliação do módulo anterior, prejudicando a absorção do conteúdo.

## Decisão
Implementar bloqueio de progressão entre módulos:
- Módulo N+1 só desbloqueia se módulo N teve quiz E foi aprovado (passed=1)
- Se módulo N não tem quiz, módulo N+1 fica livre
- Verificação silenciosa com try-catch (stabilization bypass: se falhar, permite acesso)
- Resposta inclui `locked: true` + `locked_reason` para o frontend exibir modal

## Alternativas Consideradas
- **Bloqueio total**: Impedir acesso mesmo por URL direta — adotado
- **Apenas aviso visual**: Não bloquear, apenas recomendar — descartado por não resolver o problema
- **Bloqueio apenas no frontend**: Frágil, bypassável — descartado

## Consequências
- Positivo: Progressão pedagógica garantida
- Positivo: Stabilization bypass evita deadlock em caso de erro
- Negativo: Complexidade adicional de lógica (precisa verificar módulo anterior, quiz, tentativa)
- Negativo: UX impactada — licenciada precisa entender por que está bloqueada
