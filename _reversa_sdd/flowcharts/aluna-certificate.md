# Fluxograma: Aluna certificate — Emissão de Certificado

> Gerado pelo Archaeologist em 2026-06-02

```mermaid
flowchart TD
    A[GET /aluna/certificate/{module_id}] --> B[Verifica acesso em aluna_course_access]
    B --> C{Tem acesso?}
    C -->|Não| D[403 Módulo sem acesso]
    C -->|Sim| E[Busca certificado existente]
    E --> F{Já existe certificado?}
    F -->|Sim| G[Retorna certificado existente]
    F -->|Não| H[Conta total de aulas ativas no módulo]
    H --> I[Conta aulas concluídas pela aluna]
    I --> J{totalLessons > 0 E doneLessons >= totalLessons?}
    J -->|Não| K[422 Aulas pendentes]
    J -->|Sim| L[Gera hash_code = bin2hex(random_bytes(32))]
    L --> M[INSERT em aluna_certificates]
    M --> N[Retorna {certificate, generated: true}]
```
