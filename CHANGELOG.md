Changelog — Body Harmony (Recent Releases)
[V302] - 2026-08-31
CRM V4 Ergonomia de Frontend, Hub Unificado de Configurações, Telemetria Viva Evolution API & Zero-Mock Invariant (PLAN-186 a PLAN-190)
?? Refinamento Ergonômico de Interface & Chat Bubbles (PLAN-186):
Diferenciação visual Luxury entre mensagens enviadas (Navy Blue alinhadas à direita) e recebidas (Clean Gray alinhadas à esquerda).
Compactação de botões, remoção de checklists redundantes e reorganização responsiva das abas.
?? Hub Unificado de Configurações (PLAN-187):
Agrupamento das abas Linhas & Conexões, Google Workspace, Analytics, Equipe & Roteamento e Paleta Visual em um hub central de abas internas no UnifiedSettingsHub.jsx.
?? Auditoria Fullstack & Áudio/Mídia Nativa (PLAN-189):
Player de áudio inline, gravador de notas de voz por microfone e upload direto de imagens/PDFs via inbox_messages.php.
Endpoint inbox_actions.php para alternar status (open, resolved, snoozed), atribuir agentes e adicionar etiquetas no Chatwoot.
?? Telemetria 100% Viva de Números & Atribuição de Usuários do Gestor (PLAN-190):
Mapeamento estrito e em tempo real dos números pareados na Evolution API (+55 18 99635-6825, +55 18 99601-2050, +55 18 99619-3745).
Purga total de números manuais/falsos em sementes e remoção de loops sintéticos de fallback no inbox_conversations.php.
Integração da atribuição de atendentes com a base unificada de admin_users (portal-gestor/usuarios).
[V301] - 2026-08-31
CRM V4 Omnichannel Hub / Google Stitch Pure Integration, Linhas Operacionais, CRUD de Números & Blindagem de Runtime (PLAN-181 a PLAN-185)
?? Omnichannel Inbox Tri-Painel & Google Stitch Interface (PLAN-181 / PLAN-182):
Implementação nativa fullstack do protótipo Stitch com Lista de Conversas por Silos, Canvas de Chat com Áudio Player/Notas Internas e Dossiê 360º Integrado com Histórico da Loja e Contratos.
Substituição total de mock data por consumo direto de dados reais da Evolution API v2, Chatwoot e banco de dados MySQL (licenciadas, shop_orders).
?? Gestão de Atendentes, Silos & Guilherme 2 Números (PLAN-183):
Isolamento estrito de visibilidade por atendente: Cibele (Linha 01 - Clínica/Recepção), Giovanna (Linha 03 - Vendas/Cursos), Guilherme (Linha 02 - Jurídico/Finanças e Linha 04 - Suporte Licenciadas).
Modal de Transferência com Nota de Contexto e prioridades em tempo real.
?? Central de Conexões, CRUD de Números & Redirecionamento de Domínio (PLAN-184):
Gestor completo de linhas com modal para adição de novos números, edição de telefones/DDI/DDD e pareamento QR Code com persistência na tabela crm_channels.
Redirecionamento transparente no Nginx da VPS (crm.bodyharmony.com.br -> bodyharmony.com.br/portal-gestor/crm), preservando rotas de API e WebSockets para o backend.
??? Blindagem de Runtime, Trava de Foco & Error Boundary (PLAN-185 / REGRA 60):
Eliminação de TypeError: Cannot read properties of null (reading 'name') com optional chaining e fallbacks universais.
Envelopamento do CRMHubPage com <ErrorBoundary /> para recuperação graciosa.
Trava de foco estrita (selectedConvIdRef) contra race conditions de polling e confirmação de segurança para envio em Grupos de WhatsApp.
[V300] - 2026-08-31
CRM Pure & Google Workspace / Harmonização Visual, 1-Clique OAuth e Deploy Híbrido Estabilizado (PLAN-155 a PLAN-160)
?? Google Workspace 1-Clique & SSOT bodyharmony@gmail.com (PLAN-157/158/159):
Integração 1-clique no CRM Hub conectando Google Calendar (Agenda Matriz), Google Contacts (People API), Google Drive (Prontuários) e Google Meet (Teleatendimento).
Resolução de chaves de Service Account (nom4d-crm) em api/config/ com blindagem .htaccess e endpoint google_status.php.
? Harmonização Completa do CRM Puro & Chatwoot (PLAN-155/156/160):
Injeção de monograma oficial BH em SVG Data URI (zero imagens quebradas).
Eliminação de colisões da TopBar institucional com os filtros e botões de ordenação do Chatwoot.
Implementação de Slide-Over Drawer interna para Agenda, Anamneses e Dossiês 360º.
?? Validação, Testes & Deploy:
Build de release unificado compilado com Code 0, 11/11 testes Vitest PASS, deploy Hostinger ativo e auditado por subagente browser com HTTP 200 em todas as rotas.
[V299] - 2026-08-31
Auth & Google Workspace / Provisionamento de Credenciais 100% Exclusivas bodyharmony36@gmail.com (PLAN-183)
?? Service Account Dedicada & Chave JSON Exclusiva:
Criada a Service Account bodyharmony-crm-sa@nom4d-crm.iam.gserviceaccount.com com APIs habilitadas (drive, calendar, people, gmail, iam) e chave dedicada google-service-account.json.
??? Utilitário OAuth2 & Token Generator (scripts/generate_google_tokens.py):
Script Python para handshake OAuth2 oficial com bodyharmony36@gmail.com e geração do token.json com permissão restrita (chmod 600).
?? Suporte Dual no Backend PHP 8.4 (GoogleWorkspaceService.php):
Carregamento transparente de token.json e google-service-account.json com fallback e tolerância a falhas.
[V298] - 2026-08-31
Governance & CRM Isolation / Blindagem da Linha Exclusiva de Licenciadas & Provisionamento da Clínica Matriz (PLAN-182)
?? Blindagem da Linha de Suporte às Licenciadas ((18) 99601-2050): Canal exclusivo para franqueadas, alunas e mentorias da Dra. Joselene Silva.
?? 4ª Linha Oficial Dedicada: Clínica Matriz (Cibele): Provisionada a instância inst_clinica para atendimento de pacientes de Assis/SP.
[V297] - 2026-08-30
AI & Analytics / Plantão Noturno 24/7 da Dra. Harmony AI & Conector Google Looker Studio (PLAN-173)
?? Plantão Noturno & Finais de Semana (Dra. Harmony AI 24/7): Acolhimento autônomo e triagem inteligente para Segunda a Sexta das 18h às 08h e Finais de Semana (24h).
?? Telemetria Executiva em Tempo Real (Google Looker Studio): Endpoint GET /api/v1/crm/analytics/export consolidando produtividade e conversão.
[V296] - 2026-08-30
Social Channels & Agenda / Canais Sociais Instagram/Telegram & Sincronizador Google Contacts (PLAN-172)
?? Sincronizador da Agenda Telefônica (Google Contacts / People API): Serviço em lote e individual padronizando nomes oficiais.
?? Canais Sociais no Chatwoot (Instagram Direct & Telegram): Roteamento inteligente de DMs e dúvidas.
[V295] - 2026-08-30
CRM Power-Ups / Motor Anti No-Show, Webhook Anamnese & Macros de Vendas Chatwoot (PLAN-171)
? Motor Anti No-Show Clínico: Disparos automáticos de lembretes 24h e 2h antes via WhatsApp com botões interativos.
?? Webhook de Anamnese (Google Forms): Injeção de nota privada com análise de risco clínico.
?? Carga de Macros de Vendas (Canned Responses): Sincronização em 1 clique das macros de atendimento.

