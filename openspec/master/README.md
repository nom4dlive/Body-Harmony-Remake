??? OpenSpec Master Specifications (SSOT — Nexus Protocol V3.1)
Este diretório armazena as Especificações Mestres Perenes (Single Source of Truth) do ecossistema Body Harmony. Nenhuma implementação em código pode contradizer ou violar as especificações consolidadas aqui.


??? Mapa de Especificações Mestres por Domínio
Especificação
Domínio & Escopo
00-spec-driven-development-guide.md
Manual Mestre de Governança SDD, Ciclo de Vida de Deltas e Automação de Workflows.
01-architecture-v6.md
Topologia de Domínios, Deploy Híbrido (Hostinger Web Hosting vs VPS Dedicada) e Split-Traffic.
09-lms-system-master.md
Plataforma LMS, Streaming HLS com DRM-Lite, Conversão FFmpeg e Player React.
12-database-schema.md
Dicionário de Dados Completo do MySQL (42 tabelas), Charset e Constraints.
30-nexus-architecture.md
Arquitetura de Segurança, Firewall de Aplicação, WAL Mode e Rate Limiting.
31-portal-gestor.md
Especificação de Funcionalidades do Portal do Gestor (LMS, Agenda, Contratos, RBAC).
32-portal-licenciada.md
Interface de Alunas/Licenciadas, Modais, Assistente Clínico e Acessibilidade.
35-crm-operations-guide.md
Guia Operacional de Atendimento CRM, Linhas WhatsApp Evolution v2, Chatwoot e Silos.
spec_pages_routes_glossary.md
Glossário Terminológico Oficial e Mapa Canônico de Rotas SPA/API.
spec_impact_matrix.json
Matriz Estruturada de Dependências e Impacto de Alterações entre Módulos.



?? Regra de Ouro de Governança
Toda alteração que modifique schemas, novas entidades ou novas rotas deve atualizar o respectivo documento em openspec/master/ antes do arquivamento do delta.

