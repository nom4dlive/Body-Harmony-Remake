# Matriz de Permissões — Body Harmony

> Gerado pelo Detective em 2026-06-02
> Confiança: 🟢 CONFIRMADO | 🟡 INFERIDO

## Papéis do Sistema

| Papel | Base de Dados | Autenticação | Identificador |
|-------|---------------|-------------|---------------|
| **Público** | — | Nenhuma | Visitante anônimo |
| **Licenciada** | `licenciadas` | Device Token (X-Device-Token) | `role: 'licenciada'` |
| **Aluna** | `alunas` | Device Token (X-ALUNA-TOKEN) | `role: 'aluna'` |
| **Admin** | `admin_users` | Bearer Token (Authorization) | `is_admin: true` |
| **Superadmin (Nexus)** | `admin_users (role=superadmin)` | Bearer Token (NexusGuard) | `role: 'superadmin'` |

## Matriz de Permissões por Funcionalidade

### Site Público
| Funcionalidade | Público | Licenciada | Aluna | Admin | Superadmin |
|---------------|---------|------------|-------|-------|------------|
| Home, Mentores, Contato | ✅ | ✅ | ✅ | ✅ | ✅ |
| Galeria de Resultados | ✅ | ✅ | ✅ | ✅ | ✅ |
| Depoimentos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leads (POST /leads) | ✅ | ✅ | ✅ | ✅ | ✅ |
| FAQ (leitura) | ✅ | ✅ | ✅ | ✅ | ✅ |

### Autenticação
| Funcionalidade | Público | Licenciada | Aluna | Admin | Superadmin |
|---------------|---------|------------|-------|-------|------------|
| Login Licenciada | ✅ | — | — | — | — |
| Login Aluna | ✅ | — | — | — | — |
| Login Admin | ✅ | — | — | — | — |
| Login Nexus (God Mode) | ❌ | ❌ | ❌ | ❌ | ✅ |

### Portal Licenciada
| Funcionalidade | Licenciada | Admin | Superadmin |
|---------------|------------|-------|------------|
| Dashboard (Bento) | ✅ | ✅ | ✅ |
| Aulas (LMS) | ✅ | ✅ | ✅ |
| Progresso | ✅ | ✅ | ✅ |
| Mentoria IA (Doctor Harmony) | ✅ | ✅ | ✅ |
| Certificados | ✅ | ✅ | ✅ |
| Biblioteca de Recursos | ✅ | ✅ | ✅ |
| Perfil / Privacidade (LGPD) | ✅ | ✅ | ✅ |
| Signal Tower (broadcasts) | ✅ | ✅ | ✅ |

### Portal Aluna
| Funcionalidade | Aluna | Admin | Superadmin |
|---------------|-------|-------|------------|
| Dashboard | ✅ | ✅ | ✅ |
| Aulas (acesso modular) | ✅ | ✅ | ✅ |
| Certificados | ✅ | ✅ | ✅ |
| Suporte | ✅ | ✅ | ✅ |
| Perfil | ✅ | ✅ | ✅ |

### Admin (Backoffice)
| Funcionalidade | Admin | Superadmin |
|---------------|-------|------------|
| Dashboard Admin | ✅ | ✅ |
| Gerenciar Licenciadas | ✅ | ✅ |
| Gerenciar Alunas | ✅ | ✅ |
| Gerenciar LMS (módulos/aulas/quizzes) | ✅ | ✅ |
| Gerenciar Mídia (MediaManager) | ✅ | ✅ |
| Gerenciar Mentores | ✅ | ✅ |
| Gerenciar Resultados | ✅ | ✅ |
| Gerenciar Depoimentos | ✅ | ✅ |
| Gerenciar Leads | ✅ | ✅ |
| Gerenciar FAQ | ❌ | ✅ |
| Gerenciar Conteúdo do Site | ✅ | ✅ |
| Gerenciar Configurações | ✅ | ✅ |
| Editor Visual | ✅ | ✅ |
| Gerenciar Temas | ✅ | ✅ |
| Gerenciar Admin Users | ❌ | ✅ |

### Superadmin (Nexus)
| Funcionalidade | Superadmin |
|---------------|------------|
| NexusGuard (God Mode Login) | ✅ |
| Watchtower Dashboard | ✅ |
| War Room Analytics | ✅ |
| Signal Tower Console | ✅ |
| Vault (FAQ, Config) | ✅ |
| Engine Room (Cache, Feature Flags) | ✅ |
| Forensics Lab (Audit Logs) | ✅ |
| AI Control Tower (Doctor Harmony Config) | ✅ |
| Review Hub (casos pendentes) | ✅ |
| Ops Dashboard | ✅ |
| Database Dashboard | ✅ |
| Scripts Manager | ✅ |
| Testing Hub (Sandbox) | ✅ |
| Impersonação de usuário | ✅ |

## Mecanismo de Autenticação

### Admin / Superadmin
```
Request → Authorization: Bearer <token>
         → admin_sessions (6h expiry)
         → validateToken() → user.is_admin = true
         → Router check: is_admin check no index.php
```

### Licenciada
```
Request → X-Device-Token: <device_token>
         → licenciada_devices (is_active=1)
         → validateToken() → user.role = 'licenciada', user.is_admin = false
         → LicenciadaGuard (frontend) / middleware role check
```

### Aluna
```
Request → X-ALUNA-TOKEN: <device_token>
         → aluna_devices (is_active=1, prefixo al_)
         → validateToken() → user.role = 'aluna', user.is_admin = false
         → AlunaGuard (frontend)
```

## Mecanismo de Autorização no Backend

### 1. Router-level (index.php)
```php
if (!$user['is_admin']) Response::error('Unauthorized', 403);
```
Usado para ~30 rotas admin. Verificação pos-router, antes do controller.

### 2. Controller-level
```php
// AdminDoctorHarmonyController:
if (!$this->user['is_admin']) Response::error('Unauthorized', 403);

// QuizController (admin):
if (!$this->user['is_admin']) Response::error('Unauthorized', 403);

// NexusForensicsController:
if (!$this->user || !$this->user['is_admin']) Response::error('Unauthorized', 403);
```

### 3. Superadmin-level (role check)
```php
// admin/auth_nexus.php:
if ($user['role'] !== 'superadmin') { /* 403 */ }

// admin/watchtower/core.php, war_room/, vault/, signal_tower/, engine/:
if (!$user || $user['role'] !== 'superadmin') { /* throw */ }

// NexusGuard.php:
if ($user['role'] !== 'superadmin' && $user['id'] != 5) { /* 403 */ }
```

### 4. Frontend Guards
```jsx
<ProtectedRoute><AdminDashboard /></ProtectedRoute>      // admin geral
<RoleGuard requiredRole="licenciada"><Portal /></RoleGuard> // licenciada
<LicenciadaGuard><LicenciadaDashboard /></LicenciadaGuard>  // licenciada
<AlunaGuard><AlunaDashboard /></AlunaGuard>                 // aluna
```

## Notas de Segurança
- **🟡** Admin auth não distingue entre `admin` e `superadmin` no middleware principal — distinção é feita apenas em controllers específicos
- **🟢** NexusGuard é o único ponto que bloqueia por role `!== 'superadmin'`
- **🟢** Device tokens de aluna têm prefixo `al_` para evitar conflito com licenciadas
- **🟡** Fallback query param `?token=` existe para legacy — representa risco de vazamento em logs
