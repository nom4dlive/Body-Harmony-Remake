# Fluxograma: loginLicenciada — Autenticação de Licenciada

> Gerado pelo Archaeologist em 2026-06-02
> Confiança: 🟢 CONFIRMADO

```mermaid
flowchart TD
    A[POST /auth/licenciada/login] --> B[Recebe {login, password, device_token}]
    B --> C{Login ou senha vazio?}
    C -->|Sim| D[Response.error 400]
    C -->|Não| E[checkThrottling loginValue]
    
    E --> F{Rules dinâmicas?}
    F -->|Sim| G[Carrega nexus_security_rules]
    F -->|Não| H[Usa defaults: 5 tentativas, 15 min]
    
    G --> I[Account-based: email falhas >= limit?]
    H --> I
    I -->|Sim| J[ACCOUNT_LOCKED 429]
    I -->|Não| K[IP-based: IP falhas >= 50?]
    K -->|Sim| L[IP_BLOCKED 429]
    K -->|Não| M[Busca licenciada]
    
    M --> N{Login tem 11 dígitos?}
    N -->|Sim| O[Busca por CPF em licenciadas]
    N -->|Não| P[Busca por email/username]
    
    O --> Q{Encontrou?}
    P --> Q
    Q -->|Não| R[Fallback Admin: busca em admin_users]
    R --> S{Admin existe?}
    S -->|Sim| T[Cria user virtual com id negativo]
    S -->|Não| U[Dados não conferem 401]
    
    Q -->|Sim| V{is_active?}
    T --> V
    V -->|Não| W[Conta desativada 403]
    V -->|Sim| X{locked_until > now?}
    X -->|Sim| Y[Conta bloqueada 429]
    X -->|Não| Z{password_hash vazio?}
    
    Z -->|Sim| U
    Z -->|Não| AA[password_verify]
    AA -->|Falha| AB[RiskEngine: calcula score]
    AB --> AC[Log auth_logs failure]
    AC --> AD[Incrementa failed_login_attempts]
    AD --> AE{attempts >= 5?}
    AE -->|Sim| AF[Seta locked_until +15min]
    AE -->|Não| AG[Dados não conferem 401]
    AF --> AG
    
    AA -->|OK| AH[RiskEngine: calcula score sucesso]
    AH --> AI[Reseta failed_login_attempts]
    AI --> AJ[Log auth_logs success]
    
    AJ --> AK{licenciada_id > 0?}
    AK -->|Sim| AL[Device Management]
    AK -->|Não| AM[Admin Device: gera token admin-*]
    
    AL --> AN{device_token existe?}
    AN -->|Sim| AO[Reusa device existente]
    AN -->|Não| AP{fingerprint match?}
    AP -->|Sim| AQ[Reusa por fingerprint]
    AP -->|Não| AR[Conta devices ativos]
    
    AR --> AS{activeCount >= limit?}
    AS -->|Sim| AT[FIFO: kick oldest device]
    AT --> AR
    AS -->|Não| AU[INSERT novo device]
    
    AU --> AV[ON DUPLICATE KEY?]
    AV -->|Sim| AW[Recupera token existente]
    AV -->|Não| AX[Token novo criado]
    
    AO --> AY[UPDATE device: last_used, ip]
    AQ --> AY
    
    AY --> AZ[UPDATE licenciadas.last_login]
    AM --> AZ
    AX --> AZ
    AW --> AZ
    
    AZ --> BA{Consentimento LGPD?}
    BA --> BB[Verifica lgpd_status.terms]
    BB --> BC[Log LOGIN]
    BC --> BD[5% chance: purga logs antigos]
    
    BD --> BE[Retorna {success, licenciada, token, device_token, forceChange, consent_pending}]
```

## Fluxograma: validateToken — Validação de Token

```mermaid
flowchart TD
    A[validateToken token] --> B[Busca em admin_sessions]
    B --> C{Admin session válida?}
    C -->|Sim| D[Retorna user admin {is_admin: true}]
    C -->|Não| E[Busca em licenciada_devices]
    E --> F{Device licenciada ativo?}
    F -->|Sim| G{licenciada.is_active?}
    G -->|Não| H[Retorna null]
    G -->|Sim| I[UPDATE last_used_at]
    I --> J[Retorna user licenciada ou admin]
    F -->|Não| K[Busca em aluna_devices]
    K --> L{Aluna device ativo?}
    L -->|Sim| M{aluna.is_active?}
    M -->|Não| N[Retorna null]
    M -->|Sim| O[UPDATE last_used_at]
    O --> P[Retorna user aluna {role: aluna}]
    L -->|Não| Q[Retorna null]
```
