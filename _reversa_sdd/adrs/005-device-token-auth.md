# ADR-005: Autenticação por Device Token

**Data**: Inferido ~V1
**Confiança**: 🟢 CONFIRMADO

## Contexto
Licenciadas e alunas acessam o sistema de múltiplos dispositivos (celular, desktop). Sessão baseada em cookie/session não funciona bem para SPA com API REST, especialmente no ecossistema mobile-first do Body Harmony.

## Decisão
Implementar autenticação via device token:
- Cada dispositivo registra um token único (`bin2hex(random_bytes(32))`)
- Armazenado em `licenciada_devices` ou `aluna_devices`
- Enviado via header `X-Device-Token` ou `X-ALUNA-TOKEN`
- Admin usa Bearer Token (admin_sessions)
- Limite de dispositivos: licenciada=2, aluna=1

## Alternativas Consideradas
- **JWT stateless**: Sem controle de revogação individual de dispositivos
- **Sessions PHP**: Não escala para SPA com múltiplos devices
- **OAuth2**: Overkill para o porte do sistema

## Consequências
- Positivo: Controle granular de dispositivos (revogação individual)
- Positivo: Limite de devices por perfil
- Positivo: Compatível com SPA e mobile
- Negativo: Token precisa ser armazenado no dispositivo (localStorage)
- Negativo: Requer consulta ao banco em toda requisição (não é stateless)
