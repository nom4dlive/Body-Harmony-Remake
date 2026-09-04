# C4 — Diagrama de Contexto (Nível 1)

> Gerado pelo Architect em 2026-06-02

```mermaid
graph TB
    subgraph "Usuários"
        L([Licenciada<br/>Profissional])
        A([Aluna<br/>Cliente final])
        AD([Admin])
        SA([Superadmin<br/>Nexus])
    end

    subgraph "Sistema Body Harmony"
        BH([Body Harmony<br/>Plataforma de Ensino<br/>Estética Avançada])
    end

    subgraph "Sistemas Externos"
        GM([Google Gemini API<br/>Multimodal Vision])
        CDN([Imgur / CDN<br/>Imagens externas])
        E([E-mail / SMS<br/>Notificações])
    end

    L -->|"HTTPS<br/>Device Token"| BH
    A -->|"HTTPS<br/>Aluna Token"| BH
    AD -->|"HTTPS<br/>Bearer Token"| BH
    SA -->|"HTTPS<br/>NexusGuard"| BH

    BH -->|"REST API<br/>Gemini Vision"| GM
    BH -->|"HTTP"| CDN
    BH -->|"SMTP/API"| E

    style BH fill:#0A3E60,color:#fff
    style L fill:#ED7E13,color:#fff
    style A fill:#ED7E13,color:#fff
    style AD fill:#ED7E13,color:#fff
    style SA fill:#ED7E13,color:#fff
    style GM fill:#666,color:#fff
    style CDN fill:#666,color:#fff
    style E fill:#666,color:#fff
```

### Descrição
- **Licenciada**: Profissional que compra o curso. Acessa LMS, mentoria IA, certificados, biblioteca.
- **Aluna**: Cliente final da licenciada. Acesso modular a módulos específicos.
- **Admin**: Gerencia licenciadas, alunas, conteúdo, LMS, mídia, leads.
- **Superadmin (Nexus)**: Acesso irrestrito. Gerencia sistema, segurança, audit, configurações.
- **Google Gemini API**: IA multimodal para análise de casos clínicos (Doctor Harmony).
- **Imgur/CDN**: Imagens de resultados/depoimentos hospedadas externamente.
