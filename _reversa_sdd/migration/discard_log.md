---
schemaVersion: 1
generatedAt: 2026-06-02T21:12:00-03:00
reversa:
  version: "1.2.43"
kind: discard_log
producedBy: curator
hash: "sha256:c4d5e6f7a8b9"
---

# Discard Log

> Registro completo do que foi descartado da migração e por quê. Cada item tem rastreabilidade para a origem no legado.

## Itens descartados

### BR-DESCARTAR-001
- **Origem**: `_reversa_sdd/architecture.md` § "Dívidas Técnicas" e `_reversa_sdd/code-analysis.md` § Auth
- **Descrição**: Injeção global de dependências (`global $pdo, $loggedUser`) em todos os controllers — padrão do MVC customizado legado
- **Justificativa**: No paradigma OO com DI (Laravel), toda dependência é injetada via Service Container. O mecanismo de `global` não existe e não deve ser reproduzido. O caso de uso (acesso a banco e usuário autenticado) é absorvido por construção: `DB::connection()` para banco e `Auth::user()` para usuário logado.
- **Vinculado a paradigma**: sim
  - Paradigma legado: OO clássico com injeção global
  - Como o paradigma alvo absorve: Service Container resolve PDO via facade `DB`; `$loggedUser` é substituído por `Auth::user()` (Laravel) injetável via `AuthManager`
- **Reposição no sistema novo**: `DB::connection()` + `Auth::user()` padrão Laravel
- **Risco de descartar**: baixo — padrão Laravel consolidado

### BR-DESCARTAR-002
- **Origem**: `_reversa_sdd/autenticacao/requirements.md` § RN-06 (NexusGuard.php:39)
- **Descrição**: Superadmin hardcoded como `id=5` e verificação inline (`role='superadmin' OR id=5`)
- **Justificativa**: No paradigma OO com DI, autorização é declarativa via Gates/Policies, não hardcoded. A regra de negócio "existe um papel superadmin" migra (BR-MIGRAR-021), mas a implementação específica (id=5 + OR inline) é descartada.
- **Vinculado a paradigma**: sim
  - Paradigma legado: verificação inline de ID fixo
  - Como o paradigma alvo absorve: Laravel Gate `before` para superadmin + Role-based authorization com roles configuráveis
- **Reposição no sistema novo**: `Gate::before(fn ($user) => $user->role === 'superadmin')` + Spatie Permission ou Gate policies
- **Risco de descartar**: baixo — padrão Laravel consolidado; requer migrar designação de superadmin no seed

## Itens descartados por mudança de paradigma (subseção dedicada)

| ID | Origem | Paradigma legado | Substituto no paradigma alvo |
|---|---|---|---|
| BR-DESCARTAR-001 | `_reversa_sdd/architecture.md` | Injeção global (`global $pdo`) | `DB::connection()` + Service Container |
| BR-DESCARTAR-002 | `_reversa_sdd/autenticacao/requirements.md` | Superadmin hardcoded id=5 | `Gate::before` + roles configuráveis |

## Notas

Nenhum item descartado por incompatibilidade técnica com o brief (escopo total declarado). Todos os descartes são puramente mecanismos do paradigma OO clássico que o OO com DI (Laravel) substitui por construções nativas do framework. As regras de negócio subjacentes (acesso a banco, autorização superadmin) são preservadas e migradas como BR-MIGRAR.
