??? Regras Especializadas: Infraestrutura, VPS & Deploy HÌbrido
Manual de Invariantes para Docker, Traefik, Evolution API, Chatwoot, Nginx Proxy, SSL/HSTS e Blindagem SSH.


??? REGRA 2: EspaÁo Negativo & Blindagem da VPS (Production Safety)
Diretriz: A infraestrutura fÌsica da VPS Hostinger Dedicada (2.25.156.25) sob containers Docker Compose e gateway Traefik È considerada EspaÁo Negativo (imut·vel por padr„o).
AÁ„o:
… proibido remover a restriÁ„o de loopback local (127.0.0.1:3306) do container bodyharmony-db para expor o MySQL de forma desprotegida para a WAN.
… expressamente proibido comitar, ler ou expor chaves SSH privadas locais (openspec/tracker/Hostinger_VPS/id_ed25519), arquivos de senhas (rootpass.txt) ou chaves criptogr·ficas (.pem, .key) no Git. O .gitignore deve ser mantido sempre blindado.


?? REGRA 22: Invariante de Roteamento de Deploy HÌbrido (Production Hostinger vs Staging VPS)
Diretriz: O domÌnio p˙blico de produÁ„o bodyharmony.com.br È servido diretamente pela Hostinger Web Hosting (45.152.44.244) via WinSCP/FTP (Operations/deploy-hostinger.ps1). A VPS Dedicada (2.25.156.25) atua em ambiente de microsserviÁos/staging.
AÁ„o:
Todo deploy de frontend SPA (index.html e assets/) destinado ao domÌnio p˙blico oficial DEVE obrigatoriamente ser sincronizado na Hostinger Web Hosting (45.152.44.244) via deploy-hostinger.ps1.
Antes de qualquer sincronizaÁ„o, garantir a unificaÁ„o dos diretÛrios de build entre build/public_html e apps/web-app/build/public_html.
… proibido considerar um deploy de frontend p˙blico concluÌdo apenas com envio para a VPS (2.25.156.25).


??? REGRA 32: Invariante de AutenticaÁ„o DistribuÌda VPS ? Hostinger (Distributed Auth Bridge Invariant)
Diretriz: RequisiÁıes de validaÁ„o de tokens entre o microserviÁo FastAPI na VPS e o backend PHP na Hostinger devem utilizar URLs absolutas com extens„o explÌcita .php (/api/v1/auth/validate-token.php).
AÁ„o:
O AuthMiddleware no FastAPI deve injetar cabeÁalho User-Agent de navegador e consultar o validador com timeout defensivo.
O router PHP deve registrar rotas com e sem extens„o (/auth/validate-token e /auth/validate-token.php), aceitando tokens de administradores (admin_sessions), dispositivos (licenciada_devices) e identificadores diretos (cpf/id).


??? REGRA 39: Invariante de ResiliÍncia de Payload e SanitizaÁ„o Pydantic na VPS (FastAPI Strict Payload Invariant)
Diretriz: Chamadas HTTP para serviÁos de IA na VPS Dedicada (/api/v1/transform/execute, /api/v1/rag/*) devem ser blindadas contra falhas de incompatibilidade de schema do Pydantic (HTTP 422 Unprocessable Content).
AÁ„o:
O cliente frontend (smartbookApi.js) deve implementar camada de retry defensivo com schema canÙnico mÌnimo ({ notebook_id, transformation_key, source_ids }).
Manter matriz de aliases bidirecionais (mindmap <-> mapa_mental_clinico, quiz <-> quiz_simulado_alunas, infographic <-> infografico_clinico).


?? REGRA 41: Invariante de SincronizaÁ„o e Recarregamento de CÛdigo em Containers Docker na VPS (VPS Docker Code Sync & Reload Invariant)
Diretriz: Deploys de serviÁos backend Python executados em containers Docker na VPS Dedicada (2.25.156.25) devem garantir a paridade em tempo de execuÁ„o entre o sistema de arquivos do host e o espaÁo de trabalho interno do container.
AÁ„o:
O script de deploy oficial (Operations/deploy-open-notebook-vps.ps1) deve obrigatoriamente copiar os diretÛrios modificados diretamente para dentro do container (open_notebook_app:/app/) e executar o restart imediato do serviÁo.


??? REGRA 58: Invariante de LiberaÁ„o de Iframe do Chatwoot no Servidor Web (Chatwoot Iframe CSP Invariant)
Diretriz: Qualquer rota do ecossistema destinada ao envelopamento dentro do sidebar ou modais do Chatwoot (/portal-gestor/crm/dossier-embed, /crm/dossier-embed) deve ter seus cabeÁalhos HTTP liberados tanto no .htaccess quanto nos controllers PHP de backend.


?? REGRA 63: Invariante de Transporte Seguro SSL/HTTPS e Anti-Mixed Content (SSL/HSTS & Mixed Content Invariant)
Diretriz: O domÌnio canÙnico bodyharmony.com.br e todas as suas rotas e ativos devem operar sob transporte estritamente criptografado HTTPS, com prevenÁ„o autom·tica contra conte˙do misto (Mixed Content) em todos os navegadores.


?? REGRA 64: Invariante de CodificaÁ„o UTF-8 em Scripts CLI e Daemons Python (Python CLI Unicode Encoding Invariant)
Diretriz: Todos os scripts de automaÁ„o, ferramentas de auditoria, runners de testes e daemons de monitoramento escritos em Python executados no ambiente Windows devem garantir a reconfiguraÁ„o defensiva de encoding para UTF-8 no topo do script.


??? REGRA 72: Invariante de Underscores em Headers e Tokens no Proxy Nginx (Nginx Headers Underscore & Token Invariant)
Diretriz: No Nginx, cabeÁalhos HTTP com caracteres de sublinhado (api_access_token exigido pelo Chatwoot) devem ser explicitamente habilitados (underscores_in_headers on;).


## üöÄ REGRA 76: Invariante de Resolu√ß√£o Relativa de Scripts de Deploy (PSScriptRoot Invariant)
Diretriz: Scripts PowerShell situados em subpastas de n√≠vel 2 (ex: scripts/deploy/deploy-pro.ps1, scripts/deploy/deploy-hostinger.ps1) devem obrigatoriamente resolver a raiz do projeto utilizando $PSScriptRoot\..\.. (e n√£o $PSScriptRoot\..) para garantir a correta localiza√ß√£o de .env.deploy, diret√≥rios de build e credenciais de FTP/WinSCP.

## üõ°Ô∏è REGRA 77: Invariante de Smoke Test com Valida√ß√£o de M√≥dulos ES6 e MIME-Type (SPA Bundle Integrity Invariant)
Diretriz: √â expressamente proibido declarar um deploy de SPA React/Vite como conclu√≠do validando apenas endpoints de API. O pipeline de deploy DEVE validar at√¥mica e obrigatoriamente o carregamento real do bundle JavaScript em produ√ß√£o.
A√ß√£o:
1. O step de Smoke Test deve realizar GET https://bodyharmony.com.br/.
2. Extrair via regex o nome do chunk principal referenciado em <script src="/assets/index-[hash].js">.
3. Realizar GET direto para o arquivo extra√≠do (/assets/index-[hash].js).
4. Validar que:
   - O status retornado seja estritamente HTTP 200 OK.
   - O cabe√ßalho Content-Type seja do tipo javascript (ex: application/javascript, application/x-javascript, text/javascript).
   - O conte√∫do da resposta N√ÉO seja um documento HTML (<!doctype html>).
5. Se qualquer uma dessas checagens falhar, o script deve abortar com Exit Code 1.
