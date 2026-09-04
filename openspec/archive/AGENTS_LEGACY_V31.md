# 📜 Constituição de IA — Nexus Protocol V3.1

Esta é a **Constituição de IA do Repositório Body Harmony**, um manual inabalável e vinculativo. Toda inteligência artificial (agentes, copilots e geradores de código) que carregar este workspace é **obrigada** a ler, memorizar e seguir estritamente estas diretrizes constitucionais sob o Doctor Harmony Protocol.

---

## 🏛️ 1. Pilares Constitucionais de Desenvolvimento

### 🌐 REGRA 1: Contratos de API Primeiro (Strict Contracts)
* **Diretriz**: É expressamente proibido codificar Controllers PHP de backend ou services/hooks de comunicação React no frontend sem que a exata estrutura de payload de dados (JSON) esteja pré-estabelecida.
* **Ação**: Toda modificação ou criação de rotas de dados deve possuir um arquivo de contrato associado em **`openspec/contracts/{endpoint_path}.json`** contendo a estrutura de input/output válida. O código final deve ter simetria matemática e semântica de 100% com o contrato.

### 🛡️ REGRA 2: Espaço Negativo & Blindagem da VPS (Production Safety)
* **Diretriz**: A infraestrutura física da **VPS Hostinger Dedicada (2.25.156.25)** sob containers Docker Compose e gateway Traefik é considerada **Espaço Negativo** (imutável por padrão).
* **Ação**:
  * É proibido remover a restrição de loopback local (`127.0.0.1:3306`) do container `bodyharmony-db` para expor o MySQL de forma desprotegida para a WAN.
  * É expressamente proibido comitar, ler ou expor chaves SSH privadas locais (`openspec/tracker/Hostinger_VPS/id_ed25519`), arquivos de senhas (`rootpass.txt`) ou chaves criptográficas (`.pem`, `.key`) no Git. O [.gitignore](file:///f:/Body-Harmony-Remake/.gitignore) deve ser mantido sempre blindado.

### 🧬 REGRA 3: Identidade Estética Luxury & Mobile-First (UX Elite)
* **Diretriz**: O ecossistema Body Harmony atende a um público de elite estética, exigindo uma interface refinada e com alta fidelidade visual.
* **Ação**:
  * Utilizar estritamente a paleta oficial: **Navy Blue (`#0A3E60`)**, **Gold/Luxury Gold (`#ED7E13`)**, e superfícies limpas (`#FFFFFF` ou `#F5F5F5`).
  * CTAs principais (Primary Actions) utilizam Gold. Links informativos ou secundários utilizam Navy Blue. É terminantemente proibido utilizar cores puras e genéricas do browser (plain red, plain blue, plain green).
  * Design Mobile-First obrigatório: Alvos de toque >= 44x44px, espaços generosos e prioridade de conteúdo visível em telas pequenas.

### 📑 REGRA 4: Simetria de Governança (Strict Mode)
* **Diretriz**: Nenhum código produtivo pode ser alterado de forma ad-hoc ou "vibe coding". A documentação master e o código devem refletir o mesmo estado de forma biunívoca.
* **Ação**:
  1. Toda alteração nasce obrigatoriamente de uma especificação/plano em **`openspec/deltas/PLAN-*.md`**.
  2. Todo plano deve declarar explicitamente o que está em escopo, o contrato JSON associado em `openspec/contracts/` e o que é considerado "Espaço Negativo (Fora de Escopo)".
  3. Ao concluir a execução atômica, o delta correspondente deve ser arquivado imediatamente na árvore histórica do repositório em `openspec/archive/` via comando `/archive`.

### ⚙️ REGRA 5: Guardrails de Workflow (Execution Safety)
* **Diretriz**: Todo workflow que modifique código produtivo ou infraestrutura deve passar por um gate de pré-verificação antes da execução.
* **Ação**:
  * `/implement` e `/deploy` exigem contrato JSON validado em `openspec/contracts/` como pré-condição obrigatória.
  * `/deploy` deve referenciar `/rollback` como plano de contingência explícito.
  * Nenhum workflow pode referenciar scripts inexistentes, paths obsoletos ou versões depreciadas.
  * Toda referência a versão do protocolo deve ser `V3.1` ou superior. Referências a `V2.3` ou anteriores são proibidas.

### 🧩 REGRA 6: Desacoplamento de Serviços & Isolamento de Testes CLI (Service Decoupling)
* **Diretriz**: Endpoints HTTP (`api/v1/*.php`) devem atuar estritamente como controladores finos de requisição/resposta. Nenhuma lógica pura de transformação de dados, validação ou compilação deve residir exclusivamente no escopo global do controller.
* **Ação**:
  * Toda regra de negócio, conversão de schemas ou compilação de documentos deve residir em classes de serviço dedicadas (`BodyHarmony\Services\*`).
  * Scripts de teste de fumaça CLI (`tests/*_smoke_test.php`) devem invocar apenas classes de serviço e helpers puros, nunca arquivos de controller que executam `auth_check.php` ou manipulam headers HTTP no escopo global.
  * Em testes de fumaça CLI, utilizar classes de Mock PDO puro em memória (`MockPDO`, `MockStatement`) com arrays associativos, evitando dependência de drivers SQLite nativos que possam estar desativados no `php.ini` do ambiente de desenvolvimento.

### 🧹 REGRA 7: Integridade de Seeds e Sanitização de Marcação (Clean Markup Invariant)
* **Diretriz**: Todo template, documento ou conteúdo HTML semeado no banco de dados (`ensure_tables.php`, migrations `.sql`) deve manter integridade pura de marcação, sendo terminantemente proibido o escape literal de quebras de linha (`\n`, `\r`) no conteúdo gravado.
* **Ação**:
  * Em arquivos de seed PHP, utilizar exclusivamente blocos **Heredoc (`<<<'EOD'`)** para marcação HTML multiline.
  * No frontend React (Live Preview e editores WYSIWYG), aplicar sempre rotinas de sanitização defensiva contra strings escapadas antes da renderização no DOM.

### 🗄️ REGRA 8: Mapeamento Estrito de Schema MySQL & Deduplicação (Licenciadas Schema Invariant)
* **Diretriz**: Consultas SQL direcionadas à tabela `licenciadas` devem respeitar estritamente a nomenclatura e existência das colunas físicas do schema oficial (`DATABASE_MASTER_V36_1.sql`), aplicando deduplicação unívoca por licenciada ativa em listagens e painéis.
* **Ação**:
  * **Colunas Válidas em `licenciadas`:** Estritamente `id`, `name`, `cpf`, `whatsapp`, `email`, `location`, `state`, `photo_url`, `is_active`, `created_at`.
  * **Colunas Inexistentes (PROIBIDAS):** É TERMINANTEMENTE PROIBIDO referenciar `licenciadas.cnpj`, `licenciadas.cidade`, `licenciadas.nome` ou `licenciadas.updated_at`.
  * **Resolução de Documento PJ/PF:** Utilizar estritamente a resolução defensiva de satélites: `COALESCE(NULLIF(lt.licenciada_cnpj, ''), NULLIF(r.cnpj, ''), NULLIF(l.cpf, ''), 'Doc não informado') AS documento_formatado`.
  * **Deduplicação Obrigatória em Dashboards:** Em queries com `LEFT JOIN` para transações, contratos ou taxas, aplicar obrigatoriamente **`GROUP BY l.id`** ancorado em `licenciadas l WHERE l.is_active = 1`, garantindo que cada licenciada cadastrada apareça exatamente uma vez.
  * **Aliases Padronizados:** Em rotas de API e Controllers PHP, aplicar alias quando necessário para padronização de resposta (`l.name AS licenciada_name`, `l.cpf AS licenciada_doc_db`, `l.whatsapp AS licenciada_whatsapp`).

### 📄 REGRA 9: Invariant de Qualificação PJ da Licenciada (Contract PJ Invariant)
* **Diretriz**: O parágrafo de qualificação da Licenciada nos contratos Body Harmony é **estritamente Pessoa Jurídica por padrão**. É proibido utilizar linguagem ambígua como `(ou pessoa física habilitada)` ou `CNPJ/CPF` no texto-base do parágrafo.
* **Ação**:
  * O parágrafo oficial obrigatório é: `"pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{LICENCIADA_CNPJ_CPF}}, com sede na ... neste ato representada por sua sócia"`.
  * O campo no formulário do Wizard deve ser rotulado como **"CNPJ da Licenciada (Pessoa Jurídica)"** com placeholder `00.000.000/0001-00`.
  * A **única** forma de inserir qualificação PF é através do token `{{CLAUSULA_TRANSICAO_CNPJ}}`, injetado ao final do parágrafo PJ quando o toggle de abertura de CNPJ for ativado pelo operador.
  * Novas seeds, migrations e templates jamais devem introduzir texto alternativo PF fora desse mecanismo controlado.

### ✍️ REGRA 10: Completude Bidirecional de Assinaturas (Dual-Signature Invariant)
* **Diretriz**: O status `SIGNED` em um contrato de licenciamento é uma **condição bidirecional**, só atingida quando **ambas** as partes (Licenciante e Licenciada) tiverem assinado digitalmente. Qualquer lógica que marque o contrato como `SIGNED` com apenas uma assinatura é uma violação desta regra.
* **Ação**:
  * Em `sign.php` e qualquer endpoint de processamento de assinatura, verificar a presença de ambos os tipos (`LICENCIANTE` e `LICENCIADA`) na tabela `contract_signatures` antes de atribuir `status = 'SIGNED'`.
  * Enquanto apenas uma parte assinou, o status permanece `PENDING_SIGNATURE`.
  * Na interface do Gestor de Contratos, os botões de copiar link e envio via WhatsApp devem permanecer **visíveis e ativos** enquanto a Licenciada não tiver assinado, independentemente da presença da assinatura da Licenciante.
  * O botão `✍️ Josi` deve converter-se em badge `✓ Josi Assinou` após o registro da assinatura da Licenciante, **sem remover** os controles de ação da Licenciada.

### 🏢 REGRA 11: Invariant de Dados Oficiais da Licenciante (Licenciante Official Data Invariant)
* **Diretriz**: Os dados cadastrais da **LICENCIANTE** (proprietária e outorgante da marca Body Harmony) são estritamente institucionais, imutáveis e baseados no cartão CNPJ oficial da Receita Federal. É terminantemente proibido expor campos de personalização da Licenciante nos formulários de emissão de contratos.
* **Ação**:
  * Em todos os templates, seeds, migrations e documentos compilados, a qualificação obrigatória da Licenciante é:
    `"BODY HARMONY ELETROESTIMULAÇÃO LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 68.016.506/0001-22, com sede na Rua Sebastião da Silva Leite, nº 456, Vila Rosângela, CEP 19.814-370, na cidade de Assis/SP, neste ato representada por sua sócia administradora JOSELENE APARECIDA DA SILVA, brasileira, empresária, portadora do CPF nº 362.082.328-64, residente e domiciliada na Rua Sebastião da Silva Leite, nº 456, Assis/SP"`.
  * Nenhum schema de formulário (`variables_schema`) pode conter a chave `LICENCIANTE_CNPJ` ou qualquer outro campo editável referente à Licenciante. O Wizard de emissão deve iniciar diretamente na qualificação da outra parte (Licenciada, Aluna, Ouvinte ou Parceira).
  * Quaisquer variações de razão social (`EDUCAÇÃO LTDA.`, `ESTÉTICA E CURSOS LTDA`) ou CNPJs anteriores são considerados inválidos e proibidos no repositório.

### 🗄️ REGRA 12: Invariant de Colunas Nativas MySQL (Admin & Licenciadas Invariant)
* **Diretriz**: Consultas SQL direcionadas às tabelas centrais do schema legado (`DATABASE_MASTER_V36_1.sql`) devem respeitar a integridade exata dos nomes e tipos de colunas definidos.
* **Ação**:
  * Em `admin_users`, a coluna de identificação de login é estritamente `username`. É proibido referenciar `admin_users.name`. Em queries com JOIN, mapear `u.username AS admin_name` ou `u.username AS created_by_name`.
  * Em `licenciadas`, a tabela possui `created_at` (TIMESTAMP), mas **não** possui a coluna `updated_at`. É proibido incluir `updated_at` em statements de `INSERT` ou `UPDATE` direcionados à tabela `licenciadas`.
  * Em namespaces PHP (`BodyHarmony\Services\*`), classes nativas de extensões PHP (ex: `ZipArchive`, `DateTime`, `PDOException`) devem sempre ser prefixadas com barra global `\` ou declaradas explicitamente no cabeçalho com `use ZipArchive;`.

### 🔌 REGRA 13: Invariante de Compatibilidade com LazyDb e PDO em Serviços PHP (Database Connection Invariant)
* **Diretriz**: Classes de serviço de backend (`BodyHarmony\Services\*`) devem ser agnósticas quanto ao wrapper de conexão do banco de dados utilizado pelo ambiente de execução (nativa `PDO` em CLI/testes ou `LazyDb` em produção web na Hostinger). É proibido tipar o construtor estritamente como `?PDO $db`.
* **Ação**:
  * Construtores de classes de serviço devem utilizar tipagem aberta `mixed $db` ou `$db`.
  * Controllers HTTP (`api/v1/admin/*.php`) devem resolver a conexão com `global $pdo, $db; $dbConn = $pdo ?? $db;` antes de instanciar os serviços.

### 🌐 REGRA 14: Invariante de Requisições Autenticadas e Chave Canônica de Sessão (Authenticated Client Invariant)
* **Diretriz**: É expressamente proibido realizar chamadas HTTP diretas com `fetch()` nativo desprotegido em componentes, páginas ou serviços para rotas administrativas (`/api/v1/admin/*` ou `/api/v1/gestor/*`). A sessão administrativa é estritamente armazenada no LocalStorage sob a chave `'bh_auth'` (`{ token: string, user: object }`).
* **Ação**:
  * Utilizar estritamente o cliente central `api` ou a função `request()` de `src/services/api.js`, assegurando a injeção automática do cabeçalho `Authorization: Bearer <token>` e o tratamento transparente de sessões expiradas.
  * É expressamente proibido tentar ler chaves legadas ou inexistentes como `localStorage.getItem('token')`.
  * Em uploads de arquivos com `FormData`, delegar para `request(endpoint, { method: 'POST', body: formData })`, permitindo que o cliente central injete a autorização e deixe a definição do boundary multipart para o navegador.

### 🛡️ REGRA 15: Invariante de Roteamento para Identificadores Polimórficos (Polymorphic Identifier Invariant)
* **Diretriz**: No roteador customizado da API PHP (`Core/Router.php`), o token `{id}` converte exclusivamente para a expressão regular numérica estrita `([0-9]+)`. Qualquer rota que processe identificadores polimórficos (como tokens sintéticos `tok_XX`, UUIDs de contratos `bh-lic-*` ou hashes alfanuméricos) é estritamente proibida de utilizar o placeholder `{id}`.
* **Ação**:
  * Utilizar estritamente placeholders alfanuméricos como `{identifier}`, `{token}` ou `{uuid}` na definição da rota (ex: `$router->add('DELETE', '/admin/onboarding/requests/{identifier}', ...)`).
  * Classes de serviço backend (`BodyHarmony\Services\*`) devem tipar os parâmetros receptores como `string|int $id`, detectando dinamicamente prefixos (ex: `tok_`) e delegando operações com suporte a fallback entre tabelas correlatas (`licenciada_onboarding_tokens` vs `licenciada_onboarding_requests`).

### 📐 REGRA 16: Invariante de Envelopamento e Ergonomia do Layout Gestor (Admin Layout & Sidebar Invariant)
* **Diretriz**: Todas as páginas administrativas e painéis do Gestor (`apps/web-app/src/frontend/src/pages/Admin/*` e rotas `/portal-gestor/*` ou `/admin/*`) devem ser obrigatoriamente envelopadas pelo componente mestre `AdminLayout`. É terminantemente proibido criar containers standalone ou headers locais redundantes em páginas administrativas internas.
* **Ação**:
  * O menu lateral (`Sidebar`) deve manter densidade ergonômica compacta (padding de itens $\le$ `0.5rem`, gap entre itens $\le$ `0.2rem`, logotipo com margem inferior contida $\le$ `1rem`), assegurando que a lista completa de navegação caiba em viewports verticais padrão ($\le$ 800px) sem rolagem vertical excessiva.
  * É proibido inserir títulos de texto redundantes (como "Painel Body Harmony") logo abaixo do logotipo oficial no Sidebar.
  * Recursos transversais (Global Search `Ctrl+K`, Gaveta de Ações Rápidas, Preferências Visuais e Modal de Troca de Senha) são de responsabilidade exclusiva do `AdminLayout` e não devem ser reimplementados nas páginas filhas.
  * **Modo Imersivo e Ocultação Global:** O `AdminLayout` deve disponibilizar botão de alternância `☰` no TopBar e listener global para o atalho `Ctrl + B`, permitindo recolher o menu para 0px com transição fluida de 0.25s e persistência no `LocalStorage` (`bh_gestor_sidebar_hidden`).

### 🛡️ REGRA 17: Invariante de Tripla Camada de Acesso e Modo Alternado RBAC (RBAC Tri-Layer Defense)
* **Diretriz**: É expressamente proibido expor módulos administrativos ou rotas internas sem a tripla camada de proteção RBAC (Ocultação Visual Adaptativa, Guarda de Rotas com Toast WhatsApp e Validação Backend).
* **Ação**:
  * Toda nova rota em `App.jsx` deve ser envelopada com `<PermissionRouteGuard page="...">`.
  * Tentativas de acesso direto a URLs não autorizadas devem ser interceptadas pelo `PermissionRouteGuard`, redirecionando ao Dashboard e disparando Toast Luxury com botão para o WhatsApp de suporte oficial (`wa.me/5518996959486`).
  * O Sidebar, Mobile Drawer, Busca Global (`Ctrl+K`), Gaveta de Ações Rápidas e Bento Grid do Dashboard devem aplicar filtragem e auto-ocultação adaptativa em tempo real baseada no hook `usePermissions()`.
  * Toda matriz de permissões deve suportar o **Modo Alternado** (`has_custom_permissions = 1` para matriz própria em `custom_permissions_json` e `0` para herança direta do cargo `role_id`).
  * O editor de permissões deve dispor de Lista Simplificada (Switches ON/OFF) e Toggle de Modo Avançado para ações granulares.

### 🛒 REGRA 18: Invariante de Roteamento Canônico da Loja Virtual (Shop Canonical Route Invariant)
* **Diretriz**: A rota pública oficial e canônica para compra de ingressos de congressos, cursos, workshops e capacitações da marca Body Harmony é estritamente **`/shop`** e o checkout rápido em **`/shop/checkout/:productId`**.
* **Ação**:
  * Qualquer referência legada a `/loja` deve conter redirecionamento defensivo automático via React Router (`<Navigate to="/shop" replace />`).
  * Todos os botões na Navbar, Footer, Busca Global (`Ctrl+K`) e Dashboard do Gestor devem apontar estritamente para `/shop`.

### 💬 REGRA 19: Invariante de Botão Flutuante Único de WhatsApp (Single Global Floating WhatsApp)
* **Diretriz**: O botão flutuante de atendimento do WhatsApp no canto inferior direito é gerenciado **exclusivamente e de forma única** no nível de layout raiz (`App.jsx` via `<WhatsAppButton />`).
* **Ação**:
  * É terminantemente proibido instanciar componentes locais de botão flutuante (`<FloatingWhatsApp>`) dentro de páginas públicas filhas (`ShopPage.jsx`, `HomePage.jsx`, etc.), evitando sobreposições e duplicações visuais.

### 📸 REGRA 20: Invariante de Gestão e Upload de Imagens de Produtos (Shop Product Media Invariant)
* **Diretriz**: A customização visual dos produtos da loja virtual no Portal do Gestor ([`/portal-gestor/shop`](https://bodyharmony.com.br/portal-gestor/shop)) deve suportar upload direto de arquivos e URLs externas, permitindo caminhos relativos de imagem locais e listagem completa (ativos e inativos) para o gestor.
* **Ação**:
  * Uploads diretos devem ser processados via `shopApi.uploadProductImage(productId, file)` no endpoint `POST /api/v1/admin/shop/products/{id}/image`.
  * As imagens devem ser salvas fisicamente em `public_html/uploads/shop/` e registradas no banco de dados como `/uploads/shop/prod_{id}_{timestamp}.{ext}` na coluna `image_url` da tabela `shop_products`.
  * Campos de URL de imagem e links de pagamento no frontend React devem utilizar `<input type="text" />` (em vez de `type="url"` nativo) para permitir caminhos relativos locais (`/uploads/...`) sem bloqueio de validação pelo navegador.
  * A rota `GET /api/v1/admin/shop/products` deve invocar `listProducts($category, false)`, garantindo que produtos inativos continuem visíveis e editáveis pelo Gestor.

### 🎛️ REGRA 21: Invariante de CMS e Controle Granular de Visibilidade da Vitrine (Shop CMS & Granular Visibility Invariant)
* **Diretriz**: Todos os textos, títulos, subtítulos, selos de confiança, anúncios, blocos de suporte e filtros da vitrine pública (`/shop`) devem ser 100% gerenciáveis dinamicamente pelo Gestor Comercial ([`/portal-gestor/shop`](https://bodyharmony.com.br/portal-gestor/shop)) através da tabela `shop_settings`, incluindo controle booleano (`_active`) independente para cada item e subitem.
* **Ação**:
  * Qualquer novo elemento ou seção adicionada à vitrine pública `/shop` deve obrigatoriamente possuir chaves correspondentes na tabela `shop_settings` (armazenadas em `ShopService.php` com fallback seguro padrão).
  * Todo texto configurável deve vir acompanhado de uma chave booleana `[chave]_active` (1 para ativo, 0 para oculto).
  * O painel administrativo em `ShopManager.jsx` (aba "Textos da Vitrine & CMS") deve fornecer Live Preview reativo e switches elegantes para o operador ligar/desligar e editar cada elemento sem necessidade de deploys de código.

### 🌐 REGRA 22: Invariante de Roteamento de Deploy Híbrido (Production Hostinger vs Staging VPS)
* **Diretriz**: O domínio público de produção `bodyharmony.com.br` é servido diretamente pela **Hostinger Web Hosting (`45.152.44.244`)** via WinSCP/FTP (`Operations/deploy-hostinger.ps1`). A VPS Dedicada (`2.25.156.25`) atua em ambiente de microsserviços/staging.
* **Ação**:
  * Todo deploy de frontend SPA (`index.html` e `assets/`) destinado ao domínio público oficial DEVE obrigatoriamente ser sincronizado na **Hostinger Web Hosting (`45.152.44.244`)** via `deploy-hostinger.ps1`.
  * Antes de qualquer sincronização, garantir a unificação dos diretórios de build entre `build/public_html` e `apps/web-app/build/public_html`.
  * É proibido considerar um deploy de frontend público concluído apenas com envio para a VPS (`2.25.156.25`).

### 🎛️ REGRA 23: Invariante de Controle Tipográfico e Formatação Rica no CMS (Typography & Rich CMS Invariant)
* **Diretriz**: Todas as páginas de vendas, congressos e landing pages gerenciadas pelo ecossistema (`/congresso`, `/shop`) devem disponibilizar controles visuais e tipográficos completos na aba correspondente do Portal do Gestor ([`/portal-gestor/shop`](https://bodyharmony.com.br/portal-gestor/shop)).
* **Ação**:
  * O painel CMS deve fornecer controles intuitivos para:
    1. **Alinhamento de Texto**: Comutadores para `Esquerda`, `Centro` ou `Direita`.
    2. **Escala de Títulos e Textos**: Seletores para `Compacto`, `Normal / Equilibrado`, `Grande` e `Titânico`.
    3. **Pesos Tipográficos (Font Weight)**: `Semi-Bold (600)`, `Bold (700)`, `Extra-Bold (800)` and `Black (900)`.
    4. **Espaçamento de Seção (Section Spacing)**: `Compacto`, `Padrão Luxury` e `Amplo`.
  * Toda renderização de textos e títulos deve utilizar o helper defensivo `renderRichText()`, dando suporte transparente à sintaxe inline:
    - `**palavra**` para negrito (`<strong>`).
    - `*ouro:palavra*` para aplicação instantânea do gradiente dourado metálico oficial.
    - `\n` para quebras de linha limpas (`<br />`).
  * É expressamente proibido exigir deploy de código ou edição manual de CSS para ajustes finos de alinhamento, tamanho de fonte ou espaçamento de copys no frontend.

### 🌐 REGRA 24: Invariante de Paridade e Sobrecarga nos Serviços de API Frontend (Frontend API Client Parity Invariant)
* **Diretriz**: Todos os objetos de serviço exportados no cliente central de API (`src/services/api.js` — ex: `onboardingApi`, `contractsApi`, `shopApi`, `rbacApi`) devem manter 100% de paridade nominal e de assinatura com os métodos invocados pelos componentes React, provendo sobrecarga defensiva (*overloading*) para diferentes formatos de parâmetros.
* **Ação**:
  * Antes de qualquer deploy, verificar se todos os métodos chamados em páginas públicas ou administrativas existem no respectivo objeto de `src/services/api.js`.
  * Funções que possam receber tanto tokens quanto payloads diretos em `FormData` (ex: `submitPublic(token, formData)` vs `submitPublicOnboarding(formData)`) devem declarar suporte dinâmico a múltiplos formatos de chamada e aliases para retrocompatibilidade.
  * **Defensividade de Mock e Consumo:** Componentes React consumidores de APIs com múltiplos aliases devem aplicar fallback seguro `const fn = api.primaryMethod || api.aliasMethod;` para garantir resiliência total contra mocks parciais em testes unitários Vitest.
  * Métodos de download binário direto (como arquivos `.zip`) devem fornecer acionamento via `window.open()` ou blob assíncrono seguro.

### 🏷️ REGRA 25: Invariante de Tags Condicionais e Sanitização no Live Preview (Conditional Tags Invariant)
* **Diretriz**: Tags condicionais de documentos (ex: `{{CLAUSULA_TRANSICAO_CNPJ}}`) devem ser tratadas de forma reativa e estrita no Live Preview e no compilador, sendo proibido exibir tokens crus `{{...}}` na interface quando a condição estiver inativa.
* **Ação**:
  * No frontend React (`ContractWizard.jsx`), quando o toggle condicional estiver desligado, substituir imediatamente todas as ocorrências do token por string vazia `""`.
  * Nos templates mestres do banco (`ensure_tables.php`), manter rigorosamente apenas uma única ocorrência canônica da tag posicional.
  * No carregamento de rascunhos existentes (`rendered_html`), aplicar sanitização defensiva para neutralizar tags não preenchidas gravadas em versões legadas.

### 🎙️ REGRA 26: Invariante de Transcrição Verbatim e Vinculação de Fontes no Open Notebook (Verbatim Transcription & Source Graph Invariant)
* **Diretriz**: Toda ingestão de mídia audiovisual (vídeos e áudios de aulas do LMS em `/opt/bodyharmony/private_uploads/lessons/`) no Open Notebook deve assegurar fidelidade palavra por palavra (*verbatim*) com marcação temporal em blocos `[MM:SS - MM:SS]`, sendo proibido o truncamento ou omissão de parâmetros clínicos/técnicos da aula.
* **Ação**:
  * A extração de áudio deve utilizar FFmpeg ($16\text{ kHz}$ mono, canal único) acionado via container `open_notebook_app` através do volume montado `/app/data/`.
  * A transcrição deve ser processada com o motor Whisper (modelo multilíngue, idioma `pt`), estruturando a saída com cabeçalho de metadados e minutagem temporal por segmento.
  * Após a criação da fonte via `POST /api/sources/json`, invocar obrigatoriamente a rota de relacionamento `POST /api/notebooks/{nb_id}/sources/{source_id}` para registrar a aresta `reference` no grafo do SurrealDB, garantindo visibilidade imediata no Smart Book e indexação completa no RAG.

### 💎 REGRA 27: Invariante de Identidade Visual do Smart Book (Smart Book Luxury Invariant)
* **Diretriz**: O módulo de pesquisa e gestão do conhecimento audiovisual (*Smart Book* / Open Notebook em `https://notebook.bodyharmony.com.br`) é uma ferramenta institucional oficial e deve manter 100% de coerência visual e nominal com a marca Body Harmony. É terminantemente proibido exibir marcas, ícones ou esquemas de cores genéricos de terceiros (*Quiet Green*, *LogoPebbles*, referências descontextualizadas).
* **Ação**:
  * **Cores Oficiais:** Utilizar estritamente Navy Blue (`#0A3E60`), Luxury Gold (`#ED7E13`) e tema escuro Deep Navy (`#07131e` / `#0c1d2c`).
  * **Logotipos:** O `AppSidebar` deve renderizar o monograma vetorial **BH** quando colapsado e o logotipo oficial **Body Harmony Smart Book** quando expandido.
  * **Build Standalone:** Em atualizações de frontend Next.js no container `open_notebook_app`, compilar com `output: "standalone"` assegurando a inclusão de `@swc/helpers` e paridade de versão com `react@19` e `react-dom@19`.

### 🧪 REGRA 28: Invariante de Contenção de Features Beta (Beta Feature Containment Invariant)
* **Diretriz**: Toda funcionalidade em estágio Beta (incluindo o SmartBook / IA Notebook e novas ferramentas experimentais) deve ser estritamente contida e invisível para licenciadas ou alunas comuns que não possuam a respectiva flag de autorização ativa no banco de dados.
* **Ação**:
  * No frontend React (`Dashboard.jsx`, `BottomNavbar.jsx`, `MobileDrawer.jsx`), condicionar todos os botões de ação (Hero), Bento Cards, atalhos de carrossel de módulos e links de navegação à flag `hasSmartBook = Boolean(student?.ai_notebook_beta_enabled === 1 || student?.ai_notebook_beta_enabled === true)`.
  * No backend PHP (`lms.php`, `auth_check.php`), validar a flag de permissão antes de gerar tickets de impersonação ou liberar endpoints de IA para a aluna.

### 📱 REGRA 29: Invariante de Shell Mobile-First e Anti-Esmagamento do Smart Book (Smart Book Mobile-First & Anti-Squeeze Invariant)
* **Diretriz**: É terminantemente proibido manter o sidebar lateral de desktop (`AppSidebar` com `w-64` ou `w-16`) fixo no fluxo de página do Smart Book (Open Notebook) em viewports móveis (`< 768px` ou resoluções de iPhone entre 390px e 440px).
* **Ação**:
  * Em telas `< 768px`, o sidebar fixo deve ser ocultado (`hidden md:flex`) e substituído por um **Header Superior Mobile** compacto com botão hamburguer que dispara um **Sheet Drawer retrátil animado** com fechamento automático ao navegar.
  * Todos os cartões de listagem (`NotebookCard`, `NotebookRow`, `RecentlyViewed`) devem declarar obrigatoriamente `min-w-0 flex-1 truncate` e `break-words` em títulos e descrições, com layout de 1 coluna fluida no mobile (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  * Menus de contexto e ações rápidas (3 pontos) devem permanecer visíveis por padrão em dispositivos móveis (`opacity-100 sm:opacity-0`) com alvo de toque ergonômico $\ge 44\times 44$px.
  * O container do iframe embed no Portal da Licenciada (`SmartBookPage.jsx`) deve utilizar altura responsiva dinâmica `height: calc(100dvh - 105px)` com padding contido para eliminar qualquer barra de rolagem dupla no iOS Safari e Chrome Mobile.

### 📱 REGRA 30: Invariante de Moldura Condensada e Linha Única no Portal da Licenciada (Portal Licenciada Condensed Frame Invariant)
* **Diretriz**: É expressamente proibido manter cabeçalhos ou barras de navegação com altura excessiva no Portal da Licenciada (`/portal-licenciada/*`) em viewports móveis (`< 768px`), garantindo que as molduras não consumam mais de 100px verticais somadas.
* **Ação**:
  * **Top Navbar Mobile (`PortalNavbar.jsx`):** Altura estrita $\le 48$px (padrão 46px), logo $\le 24$px (padrão 22px), exibição somente do primeiro nome do aluno/licenciada (sem rótulos redundantes como *"Licenciada Oficial"*), e botões de ação compactos de 34x34px com área de toque invisível expandida $\ge 44\times 44$px via pseudo-elementos (`::after`).
  * **Bottom Navbar (`BottomNavbar.jsx`):** Altura condensada $\le 54$px (padrão 52px), ícones em `1.1rem` e textos em `0.62rem` com `padding: 4px 6px` e `max-width: 68px`, garantindo alinhamento simétrico de até 6 módulos sem quebras em larguras de 390px a 440px.
  * **Subheaders de Linha Única:** Cabeçalhos de páginas internas (como Smart Book) devem renderizar título e botões de ação em uma única linha horizontal (`justify-content: space-between`), ocultando subtítulos prolixos no mobile para liberar altura contínua aos visualizadores e iframes.

### 🌐 REGRA 31: Invariante de Registro Mandatório de Rotas SPA no App.jsx (App Route Registration Invariant)
* **Diretriz**: Toda nova página, módulo ou landing page criada no frontend React (`src/pages/*`) DEVE obrigatoriamente ser registrada de forma atômica no arquivo mestre de rotas ([`App.jsx`](file:///f:/Body-Harmony-Remake/apps/web-app/src/frontend/src/App.jsx)) antes da compilação e deploy.
* **Ação**:
  * É expressamente proibido concluir tarefas de criação de páginas sem declarar o import `lazy()` e a respectiva tag `<Route path="..." element={<Componente />} />` em `App.jsx`.
  * Toda rota pública deve suportar aliases canônicos (ex: `/loja` redirecionando para `/shop`).
  * Toda rota administrativa deve ser protegida com `<ProtectedRoute>` e `<PermissionRouteGuard page="...">` conforme a REGRA 17.
  * O script de teste de rotas ou smoke test deve verificar o carregamento real do componente e garantir que o roteador não caia no fallback de wildcard (`Navigate to="/" replace`).

### 🛡️ REGRA 32: Invariante de Autenticação Distribuída VPS ➔ Hostinger (Distributed Auth Bridge Invariant)
* **Diretriz**: Requisições de validação de tokens entre o microserviço FastAPI na VPS e o backend PHP na Hostinger devem utilizar URLs absolutas com extensão explícita `.php` (`/api/v1/auth/validate-token.php`).
* **Ação**:
  * O `AuthMiddleware` no FastAPI deve injetar cabeçalho `User-Agent` de navegador e consultar o validador com timeout defensivo.
  * O router PHP deve registrar rotas com e sem extensão (`/auth/validate-token` e `/auth/validate-token.php`), aceitando tokens de administradores (`admin_sessions`), dispositivos (`licenciada_devices`) e identificadores diretos (`cpf`/`id`).

### 🗄️ REGRA 33: Invariante da Coluna de Ativação de Licenciadas (Licenciada is_active Invariant)
* **Diretriz**: É terminantemente proibido utilizar o identificador `l.status` em queries SQL direcionadas à tabela `licenciadas`.
* **Ação**: A coluna física oficial no banco de dados (`DATABASE_MASTER_V36_1.sql`) para o estado da conta é estritamente `is_active` (TINYINT). Em endpoints de autenticação e controllers PHP, utilizar `l.is_active` ou `WHERE is_active = 1`.

### 🌐 REGRA 34: Invariante de Roteamento de Módulos LMS para Licenciadas (LMS Module Routing Invariant)
* **Diretriz**: Componentes do Portal da Licenciada e do Smart Book devem consultar a lista de módulos através de `/v1/lms/modules` ou `/v1/aluna/modules`.
* **Ação**: O endpoint `/v1/admin/lms/modules` é estritamente restrito a administradores (retorna 403 Forbidden para alunas sob a REGRA 17). O frontend de consumo nunca deve invocar rotas sob `/admin/` para alimentar interfaces da aluna.

### 🎟️ REGRA 35: Invariante de Lotes Progressivos e Contadores de Urgência no CMS (Ticket Batch & Countdown Invariant)
* **Diretriz**: Toda esteira de venda de ingressos ou produtos escalonados em lotes (Lote 1, 2, 3) deve permitir a gestão dinâmica do lote vigente, dos preços por categoria e da data-limite do contador regressivo diretamente pelo Portal do Gestor ([`/portal-gestor/shop`](https://bodyharmony.com.br/portal-gestor/shop)) sem necessidade de deploy de código.
* **Ação**:
  * **Régua Visual Pública:** Deve identificar com clareza o estado de cada lote: *Encerrado* (cinza, valores tachados e badge `❌ Finalizado`), *Vigente* (destaque dourado, glow e mini-contador regressivo) e *Próximo Lote* (translúcido, antecipando novo valor).
  * **Comutador em 1-Clique:** A mudança do lote ativo no CMS deve atualizar de imediato os badges de status e a contagem regressiva para todos os visitantes.
  * **Resiliência do Timer:** Caso a data-limite expire, o componente deve exibir estado de salvaguarda defensivo (`ÚLTIMAS VAGAS` ou `Virada Iminente`), nunca quebrando a interface com valores negativos ou NaN.

### 🧭 REGRA 36: Invariante de Controle Dinâmico de CTAs de Navegação no CMS (Navigation CTA & Action Buttons Invariant)
* **Diretriz**: Botões de ação, links promocionais e CTAs de alta conversão presentes no cabeçalho superior (`NavbarV2.jsx`) e no rodapé (`FooterV2.jsx`) — tais como *"Loja & Ingressos"*, ingressos de congressos ou campanhas sazonais — devem ser 100% gerenciáveis de forma dinâmica pelo Gestor Comercial ([`/portal-gestor/shop`](https://bodyharmony.com.br/portal-gestor/shop)) sem necessidade de deploy de código.
* **Ação**:
  * **Controles Obrigatórios no CMS:** O painel deve fornecer: (1) Switches de visibilidade independentes para Navbar e Rodapé, (2) Edição do Texto Principal, (3) Edição e Toggle do Selo/Tag de Destaque (ex: `NOVO`, `2026`, `LOTE 2`), e (4) Campo de URL de destino flexível.
  * **Roteamento Híbrido:** O frontend React deve identificar automaticamente se o destino informado é uma rota interna (`/shop`, `/congresso`, `/shop/checkout/...`) renderizando `<Link>` ou uma URL externa (`https://...`) renderizando `<a target="_blank">`.
  * **Live Preview:** O painel de administração em `ShopManager.jsx` deve fornecer simulação visual instantânea da aparência do botão antes da gravação.

### 🧠 REGRA 38: Invariante do Motor de Mapa Mental e Árvores Interativas (Interactive Mind Map & Drill-Down Invariant)
* **Diretriz**: Todo mapa mental ou diagrama de estudos hierárquico gerado no ecossistema SmartBook deve seguir a arquitetura visual e ergonômica de alta fidelidade baseada no Google NotebookLM, utilizando renderização vetorial SVG/D3 com layout horizontal radial (da esquerda para a direita) e interatividade completa de navegação.
* **Ação**:
  * Conexões entre nós devem ser desenhadas com **Curvas Bezier Cúbicas suaves** (`M x1 y1 C ... x2 y2`).
  * Cada nó pai deve possuir botão em pílula `<` (para recolher) e `>` (para expandir) ramificações filhas.
  * Cores graduadas por profundidade: Raiz em Indigo/Navy (`#0A3E60`), Nível 1 em Slate (`#1E293B`), Nível 2+ em Verde Clínico (`#064E3B`) e Dourado Luxury (`#ED7E13`).
  * O componente deve suportar **Canvas Pan & Zoom** (arraste com mouse/touch e zoom com scroll), botão "Expandir tudo / Recolher nós", tela cheia e exportação vetorial em SVG.
  * Toda renderização de mapa mental deve utilizar o `mindmapTreeParser.js`, provendo parsing universal tolerante a falhas (JSON `{ title, children }`, Markdown ou Mermaid). É expressamente proibido renderizar caixas estáticas sem capacidade de drill-down.

### 🛡️ REGRA 39: Invariante de Resiliência de Payload e Sanitização Pydantic na VPS (FastAPI Strict Payload Invariant)
* **Diretriz**: Chamadas HTTP para serviços de IA na VPS Dedicada (`/api/v1/transform/execute`, `/api/v1/rag/*`) devem ser blindadas contra falhas de incompatibilidade de schema do Pydantic (HTTP 422 Unprocessable Content).
* **Ação**:
  * O cliente frontend (`smartbookApi.js`) deve implementar **camada de retry defensivo**: caso o envio primário com campos estendidos (`custom_instructions`, `preset_label`) falhe com erro 422, disparar imediatamente retry automático com payload estrito contendo apenas as chaves canônicas mínimas aceitas pelo schema base (`{ notebook_id, transformation_key, source_ids }`).
  * Manter matriz de aliases bidirecionais (`mindmap` $\leftrightarrow$ `mapa_mental_clinico`, `quiz` $\leftrightarrow$ `quiz_simulado_alunas`, `infographic` $\leftrightarrow$ `infografico_clinico`), garantindo zero mensagens de erro para a Licenciada.

### 🗄️ REGRA 40: Invariante de Resolução Polimórfica de IDs de Cadernos no SurrealDB (SurrealDB Polymorphic Notebook ID Invariant)
* **Diretriz**: Qualquer endpoint ou serviço de IA que consulte o grafo do SurrealDB (`reference`, `artifact`, `transformation_log`, `notebook`) deve resolver o identificador de caderno de forma polimórfica e tolerante a múltiplos esquemas de prefixação.
* **Ação**:
  * O backend (`transform.py`, `rag.py`) deve sempre testar a lista de candidatos:
    - `notebook:lms_mod_{raw_id}` (padrão oficial de sincronização do LMS).
    - `notebook:{raw_id}` (padrão canônico do Open Notebook).
    - `{raw_id}` ou o ID cru recebido do payload.
  * É expressamente proibido assumir que o ID recebido corresponde diretamente a um único prefixo estrito, evitando que consultas no grafo retornem 0 fontes e causem respostas rasas ou sem contexto.

### 🐳 REGRA 41: Invariante de Sincronização e Recarregamento de Código em Containers Docker na VPS (VPS Docker Code Sync & Reload Invariant)
* **Diretriz**: Deploys de serviços backend Python executados em containers Docker na VPS Dedicada (`2.25.156.25`) devem garantir a paridade em tempo de execução entre o sistema de arquivos do host e o espaço de trabalho interno do container.
* **Ação**:
  * O script de deploy oficial (`Operations/deploy-open-notebook-vps.ps1`) deve obrigatoriamente copiar os diretórios modificados (`/opt/open-notebook/api` e `/opt/open-notebook/open_notebook`) diretamente para dentro do container (`open_notebook_app:/app/`) e executar o restart imediato do serviço.
### 🛍️ REGRA 42: Invariante de Exibição Integral de Benefícios e Blindagem de Persistência no Gestor (Shop Features & Database Persistence Invariant)
* **Diretriz**: Todos os benefícios, tópicos inclusos e diferenciais cadastrados em produtos da loja virtual (`shop_products.features_json`) devem ser renderizados integralmente nos cards e modais da vitrine pública (`/shop`), sendo expressamente proibido aplicar cortes artificiais (como `.slice(0, 3)`) no frontend. Além disso, nenhuma rotina de deploy ou inicialização backend pode sobrescrever ou redefinir dados já persistidos pelo Gestor.
* **Ação**:
  * Em `TiltProductCard3D.jsx` e `ProductQuickViewModal.jsx`, iterar sobre `product.features` completo com espaçamento e layout adaptativo.
  * Em `ShopService.php`, rotinas de seed (`seedInitialProducts()`) devem executar exclusivamente se a contagem física de registros for rigorosamente zero (`COUNT(*) === 0`).
  * Mutações em configurações CMS (`shop_settings`) devem sempre operar via `ON DUPLICATE KEY UPDATE` com atualização do timestamp `updated_at`.

### 🏥 REGRA 43: Invariante de Profundidade Clínica e Arsenal de Cabine (Clinical Arsenal & Cabine Utility Invariant)
* **Diretriz**: É expressamente proibido gerar conteúdos no SmartBook Studio que sejam resumos teóricos genéricos, rasos ou acadêmicos. Todo material gerado deve funcionar como ferramenta de trabalho imediata para a Licenciada dentro da cabine de atendimento.
* **Ação**:
  * **Tabelas e Guias de Aplicação**: Devem conter parametrização cirúrgica do equipamento (Canais 1 a 8, Frequência em Hz, Largura de Pulso em µs, Rampas Rise/On/Decay/Off e minutagem minuto a minuto das 3 Fases do Protocolo 3S).
  * **Casos Clínicos e Simulados**: Devem abordar dilemas reais de cabine (ex: flacidez associada a gordura, pós-lipo, diástase, manejo de sensibilidade, cãibras e intercorrências).
  * **Arsenal Comercial**: Todo caderno deve conter argumentos de venda de alto valor, roteiros de consulta de avaliação e quebra de objeções baseadas na biofísica da despolarização síncrona vs musculação convencional.
  * **Voz e Postura da Mentora**: O tom deve incorporar a autoridade prática, firmeza e direcionamento clínico da Dra. Joselene Aparecida da Silva.

### 📐 REGRA 44: Invariante de Benchmark NotebookLM e Fidelidade Estrita (NotebookLM Benchmark Invariant)
* **Diretriz**: O ecossistema NotebookLM MCP atua como o benchmark oficial e régua de qualidade do SmartBook Studio. É expressamente proibido alucinar ou preencher lacunas com dados inventados não mencionados nas fontes originais.
* **Ação**:
  * Antes de qualquer recalibração de prompts ou lançamento de novo módulo de estudo, criar o caderno correspondente no Google NotebookLM via MCP (`create_notebook`, `add_source_text`) com a transcrição verbatim completa.
  * Gerar as mídias de referência (Audio Overview, Video Overview, Mind Map e FAQ com citações `[1]`, `[2]`, `[3]`).
  * Assegurar que o motor próprio do SmartBook Studio replique ou supere a profundidade e a precisão do benchmark oficial.

### ⚡ REGRA 45: Invariante de Checkout Direto Zero Fricção e Iframe Stone (Zero-Friction Direct Checkout Invariant)
* **Diretriz**: É expressamente proibido exigir preenchimento redundante de dados cadastrais do comprador em formulários preliminares locais quando o produto utilizar links diretos de pagamento da adquirente (Stone Pagamentos). Todos os CTAs de compra na vitrine pública (`/shop`) e landing pages (`/congresso`) devem abrir diretamente o ambiente de checkout seguro da adquirente em Modal/Drawer Luxury Iframe embutido na mesma tela.
* **Ação**:
  * Em `ShopPage.jsx`, `CongressoPage.jsx` e suas seções filhas, acionar o componente `StoneCheckoutModal` injetando o `payment_link_url` do produto selecionado.
  * O modal deve manter iluminação Obsidian / Gold (`#ED7E13`), backdrop blur, cabeçalho de segurança SSL e botão alternativo de abertura externa caso o navegador do usuário restrinja iframes.
  * Não redirecionar o comprador para rotas de formulário intermediário (`/shop/checkout/:id`) quando houver `payment_link_url` ativo no produto.

### 💅 REGRA 46: Invariante de Styled-Components e Proibição de Classes Utilitárias Não Compiladas (Styled-Components Exclusivity Invariant)
* **Diretriz**: O ecossistema frontend React (`apps/web-app/src/frontend/`) opera exclusivamente com **`styled-components`** para todos os componentes visuais, páginas, modais e layouts. É terminantemente proibido utilizar classes utilitárias de frameworks externos não integrados (como classes Tailwind `bg-gradient-to-r`, `p-6`, `flex`, `gap-3`) como mecanismo principal de estilização.
* **Ação**:
  * Todo componente visual, modal, gaveta ou página deve declarar seus estilos utilizando blocos `styled.div`, `styled.button`, etc., ou importar componentes estilizados padronizados do Design System.
  * A paleta oficial deve ser estritamente respeitada através das variáveis de tema (`var(--bh-primary, #0A3E60)`, `var(--bh-gold, #ED7E13)`, `var(--bh-bg-card, #ffffff)`).
  * Nomes de pastas e arquivos em imports (`src/components/Modals/...`) devem manter correspondência exata de letras maiúsculas e minúsculas (*case-sensitive*) para garantir compatibilidade com sistemas de arquivos Linux/Hostinger.

### 🔒 REGRA 47: Invariante de Streaming de Anexos Privados e Downloads Autenticados (Private Storage Streaming & Authenticated Download Invariant)
* **Diretriz**: Arquivos e anexos armazenados em diretórios privados (`private_uploads/*`, documentos de onboarding, certidões e comprovantes) jamais devem ser acessados via caminhos estáticos diretos pelo frontend, evitando o redirecionamento indevido para o `index.html` da SPA pelo `.htaccess`. Requisições de download administrativo abertas em nova aba (`window.open`) devem sempre conter o token de autorização.
* **Ação**:
  * Todo documento ou comprovante privado deve ser servido exclusivamente por endpoints de streaming autenticados da API (ex: `GET /api/v1/admin/onboarding/{id}/document/{type}`), enviando headers adequados (`Content-Type`, `Content-Disposition: inline`, `Content-Length`) e lendo o arquivo físico via helper defensivo `resolveUploadPath()`.
  * Em downloads diretos acionados por `window.open`, o método do frontend (`api.js`) DEVE injetar o token administrativo extraído da chave `'bh_auth'` como query parameter (`?token=${encodeURIComponent(token)}`), permitindo validação imediata pelo `AuthMiddleware.php`.
  * Componentes visualizadores (`DocumentSplitInspector.jsx`, `SmartBook`, etc.) devem tratar eventos `onError` com cards de erro informativos e botões de download alternativo, impedindo que falhas de carregamento causem loop ou aninhamento visual da SPA.

### 📐 REGRA 48: Invariante de Densidade Ergonômica, Compactação de Itens e Redução de Espaços Vazios (High-Density UI & Zero Whitespace Waste Invariant)
* **Diretriz**: O ecossistema visual Body Harmony exige alta densidade de informação e ergonomia visual refinada, sendo terminantemente proibido o desperdício de espaço vertical ("dead space") ou o uso de margens/paddings inflados que quebrem listas, menus e painéis em viewports verticais padrão ($\le 800\text{px}$).
* **Ação**:
  * **Compactação de Itens:** Menus laterais, itens de navegação, linhas de tabelas, gavetas (drawers) e cards repetitivos devem manter paddings contidos ($\le 0.5\text{rem}$ a $0.75\text{rem}$) e gaps entre itens adjacentes reduzidos ($\le 0.2\text{rem}$ a $0.5\text{rem}$).
  * **Zero Whitespace Waste:** Logotipos, cabeçalhos de páginas e banners superiores devem manter `margin-bottom \le 1rem` (`16px`), assegurando que todo o bloco de navegação principal e cards de ação caibam acima da dobra (*above-the-fold*).
  * **Responsividade Dinâmica:** Em dispositivos móveis ($360\text{px}$–$432\text{px}$), alvos de toque devem manter $\ge 44\times 44\text{px}$ com estilização visual compacta. Grids de cards devem utilizar `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` com gap $\le 0.75\text{rem}$ a $1\text{rem}$ e tipografia fluida com `clamp()`.

### 📱 REGRA 49: Invariante de Dual-View e Responsividade Mobile-First em Painéis de Gestão (Adaptive Dual-View Invariant)
* **Diretriz**: Em telas administrativas com listagens ricas e múltiplas ações por item ($\ge 3$ botões de ação, ex: `ContractsManager`, `LicenciadasManager`, `LeadsManager`, `Onboarding`), é expressamente proibido depender exclusivamente de tabelas físicas (`<table>`) sem tratamento de visualização mobile, evitando cortes horizontais e barras de rolagem infinitas em telas móveis ($\le 768\text{px}$).
* **Ação**:
  * Implementar o padrão **Dual-View Adaptativo**:
    1. **Desktop View ($\gt 768\text{px}$):** `<DesktopTableContainer>` renderizando a tabela tabular tradicional completa com larguras balanceadas e tooltips.
    2. **Mobile Card View ($\le 768\text{px}$):** `<MobileCardsContainer>` renderizando uma lista vertical de **Cards Luxury**, sem scroll horizontal e com 100% de visibilidade de dados e botões.
  * No Mobile Card:
    - **Header:** Título do item, data e status badge semântico.
    - **Body:** Informações cadastrais e metadados agrupados em container leve.
    - **Ações Primárias:** Botões táteis com alvos $\ge 44\times 44\text{px}$ para ações imediatas (ex: WhatsApp oficial `#25D366`, Copiar Link, Assinaturas).
    - **Ações Secundárias (Icon Tray):** Botões táteis para download, prévia, anexos e edição no Wizard, com ação de exclusão isolada à direita.

### 📄 REGRA 50: Invariante de Resiliência, Schema e Fallback de Templates de Contrato (Contract Template Schema & Fallback Invariant)
* **Diretriz**: É terminantemente proibido que métodos de compilação ou endpoints de atualização de contratos assumam que `$templateHtml` ou `template_id` sejam obrigatoriamente strings não-nulas, ou executem consultas SQL assumindo colunas inexistentes na tabela `contract_templates` (como `status`). A coluna física oficial de controle de ativação é estritamente `is_active` (`TINYINT(1)`).
* **Ação**:
  * Em consultas SQL direcionadas à tabela `contract_templates`, utilizar **estritamente `WHERE is_active = 1`**. É terminantemente proibido incluir `OR status = 'ACTIVE'` ou referenciar `status`.
  * Em `ContractPdfService::renderTemplate(?string $templateHtml, array $variables): string`, a tipagem do primeiro parâmetro deve aceitar `?string` com fallback para string vazia (`$rendered = $templateHtml ?? ''`).
  * No endpoint `api/v1/admin/contracts/index.php` (PUT/PATCH/GET) e em `OnboardingService.php`, quando um contrato não tiver `template_id` ou `rendered_html` associado, o backend deve executar busca defensiva pelo template ativo padrão (`contract_templates WHERE is_active = 1 ORDER BY id ASC LIMIT 1`).
  * Emissões automatizadas (como a Emissão 1-Clique em `OnboardingService.php`) devem resolver o `template_id` oficial, compilar o `rendered_html` completo e salvar o hash SHA-256 no momento da inserção.

### 🏢 REGRA 51: Invariante de Imutabilidade e Auto-Cura da Identidade da Licenciante em Chancelas Digitais (Licenciante Digital Signature & Auto-Heal Invariant)
* **Diretriz**: Todos os dados cadastrais, razão social, CNPJ e representação legal da **LICENCIANTE** são estritamente institucionais, imutáveis e padronizados em constantes públicas da classe de serviço (`ContractPdfService::LICENCIANTE_*`). É terminantemente proibido utilizar fallbacks tipográficos locais, parâmetros variáveis ou dados desatualizados em rotinas de geração de PDF, assinaturas eletrônicas ou chancelas jurídicas (MP 2.200-2/2001 e Lei 14.063/2020).
* **Ação**:
  * Em `ContractPdfService.php`, declarar e manter as constantes públicas canônicas:
    - `LICENCIANTE_NAME = 'JOSELENE APARECIDA DA SILVA (BODY HARMONY)'`
    - `LICENCIANTE_DOCUMENT = 'BODY HARMONY ELETROESTIMULAÇÃO LTDA. (CNPJ 68.016.506/0001-22)'`
    - `LICENCIANTE_EMAIL = 'contato@bodyharmony.com.br'`
    - `LICENCIANTE_CNPJ = '68.016.506/0001-22'`
    - `LICENCIANTE_SOCIA = 'JOSELENE APARECIDA DA SILVA'`
    - `LICENCIANTE_CPF = '362.082.328-64'`
  * No método `ContractPdfService::buildChancelaHtml()`, sobrescrever e forçar obrigatoriamente a identidade da Licenciante a partir dessas constantes, garantindo normalização total do PDF.
  * Os controllers de assinatura (`sign.php`) e validação pública (`validate.php`) devem referenciar exclusivamente essas constantes para qualquer signatário do tipo `LICENCIANTE`.
  * Em `ensure_tables.php` e `heal.php`, manter rotina de auto-heal retroativo em tempo de execução para atualizar registros legados divergentes em `contract_signatures`, `contracts.rendered_html` e `contracts.variables_payload`.
  * No endpoint de download (`api/v1/contracts/download.php`), aplicar regeneração defensiva sob demanda: se o PDF no servidor inexiste ou está desatualizado, recompilar o documento em tempo de execução com `ContractPdfService::generatePdf()` antes do streaming.

### ⚖️ REGRA 52: Invariante de Governança e Retificação Inteligente de Contratos Assinados (Signed Contract Rectification Invariant)
* **Diretriz**: Contratos com status `SIGNED` possuem valor probatório e consentimento jurídico registrado, sendo expressamente proibido que edições acidentais corrompam as assinaturas ou que alterações de cláusulas substanciais passem despercebidas sem re-assinatura.
* **Ação**:
  * No backend PHP (`contracts/index.php`), ao receber `PUT/PATCH` para contratos `SIGNED`:
    1. **Ajustes Cosméticos / Institucionais / Formatação:** Preservam o status `SIGNED` e mantêm as assinaturas digitais ativas, regenerando o HTML e hash SHA-256 de forma transparente.
    2. **Alterações de Dados Críticos da Licenciada** (`LICENCIADA_CNPJ_CPF`, `LICENCIADA_CPF`, `LICENCIADA_RAZAO_SOCIAL`, `LICENCIADA_REPRESENTANTE_NOME`, `TAXA_INICIAL_NUM`, `VALOR_TAXA_INICIAL_NUM`, `LICENCIADA_ENDERECO`): O backend deve transicionar automaticamente o status para `PENDING_SIGNATURE` e limpar a assinatura desatualizada da Licenciada, exigindo nova assinatura via WhatsApp.
  * No frontend React (`ContractWizard.jsx`):
    - Exibir banner luxury no topo indicando o **Modo de Retificação** para contratos com status `SIGNED`.
    - Interceptar a submissão de alterações críticas da Licenciada através de um **Modal de Confirmação Luxury**, listando os campos modificados e alertando o operador sobre a reabertura do fluxo de assinatura antes de persistir as alterações.

### 🛠️ REGRA 53: Integridade de Arquivos JSON & Encoding sem BOM (Clean JSON & UTF-8 Invariant)
* **Diretriz**: Todos os arquivos JSON de especificação, contrato ou configuração no repositório devem ser estritamente salvos no formato UTF-8 puro, sem marca de ordem de byte (Byte Order Mark - BOM) e com sintaxe perfeitamente válida.
* **Ação**:
  * É terminantemente proibido introduzir bytes BOM (`\xef\xbb\xbf`) no início de arquivos JSON. Caso edite arquivos JSON em plataformas Windows, garanta que a codificação salva seja "UTF-8" (e não "UTF-8 com BOM" ou "UTF-8-BOM").
  * O cabeçalho de schema para especificações de contratos JSON Schema deve utilizar estritamente a chave `"$schema"` (e nunca chaves vazias ou em branco `""`).
  * Antes de finalizar qualquer alteração em arquivos de contrato, executar localmente o validador de contratos (`php apps/web-app/src/backend/validate-contracts.php`) para assegurar que a sintaxe e conformidade estrutural permaneçam 100% íntegras.

### 💰 REGRA 54: Invariante de Helpers de Formatação e Escopo Estrito no JSX (Formatting Helpers & Scope Invariant)
* **Diretriz**: É terminantemente proibido invocar funções utilitárias ou formatadores (ex: `formatCurrency()`, `formatDate()`, `formatCpf()`, `formatDocument()`) em expressões JSX, fallbacks de renderização ou handlers de componentes sem que a função esteja explicitamente declarada no escopo do módulo/componente ou importada de módulo de utilitários central.
* **Ação**:
  * Todo helper monetário (`formatCurrency`) deve ser defensivo: tratar `null`, `undefined`, `NaN`, aceitar valores em centavos (`val / 100` para backend standard) e aplicar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
  * É expressamente proibido inserir strings literais de mock (ex: `'R$ 74.400,00'`, `'Marcela e Marina'`) como valor padrão de fallback em operadores `||` ou `??` no JSX. O fallback padrão para valores numéricos e monetários é estritamente `'R$ 0,00'` ou `0`.
  * Antes de qualquer build ou deploy, inspecionar se todas as chamadas `canAccessPage()` utilizam chaves canônicas de páginas registradas em `RbacService.php` (`pages`), mantendo `usePermissions.js` com bypass universal para `admin`/`superadmin` e fallback defensivo para `actions`.

### 🖼️ REGRA 55: Invariante de Avatares com Fallback Resiliente (Avatar & Media Fallback Invariant)
* **Diretriz**: Todo componente React que exiba fotos ou imagens de perfil de licenciadas, usuárias ou alunas (`<AvatarImg />`) deve obrigatoriamente implementar tratamento defensivo de falha de carregamento via `onError`, alternando imediatamente para o elemento de fallback com iniciais.
* **Ação**:
  * Em listagens, tabelas e cards, anexar `onError` que oculta o elemento de imagem quebrado (`style.display = 'none'`) e exibe o nó irmão com iniciais (`style.display = 'flex'`).
  * É expressamente proibido permitir a exibição de ícones nativos de imagem quebrada (*broken image*) na interface visual Luxury.

### 📱 REGRA 56: Invariante de Densidade e Accordions em Painéis Executivos (Executive Cockpit Density Invariant)
* **Diretriz**: Painéis administrativos, dashboards financeiros e cockpits executivos devem preservar a visibilidade imediata das métricas vitais e tabelas principais acima da dobra (*above the fold*) em viewports mobile e desktop.
* **Ação**:
  * Blocos analíticos secundários (como resumos de métodos de pagamento ou panoramas contratuais) devem ser estruturados como **Accordions retráteis compactos** com comutação de estado (`isSectionOpen`) e ícones de expansão (`ChevronDown` / `ChevronUp`).
  * Cards de KPI devem aplicar responsividade mobile-first com `repeat(2, 1fr)` no mobile e `repeat(4, 1fr)` no desktop, blindando valores numéricos com `clamp()` e `white-space: nowrap` contra quebras indesejadas de linha.
  * Botões de ação rápida em linhas de tabela e cabeçalhos devem assegurar alvos de toque ergonômicos mínimos $\ge 44\times 44\text{px}$ no mobile (`@media (max-width: 768px)`).

### ⚡ REGRA 57: Invariante de Endpoints de Leitura Pura e Desacoplamento de Sincronização (Pure Read-Only Endpoints & Sync Isolation Invariant)
* **Diretriz**: Endpoints HTTP de leitura (`GET /api/v1/*`) devem atuar estritamente como consultas puras e de alto desempenho ($\le 50\text{ms}$). É expressamente proibido invocar rotinas pesadas de sincronização em lote (`syncAll()`, varreduras de tabelas mestre, auto-seed massivo ou criação de transações financeiras) de forma síncrona no escopo de requisições `GET`.
* **Ação**:
  * Rotinas de sincronização e reconciliação em lote devem residir exclusivamente em endpoints `POST` dedicados (ex: `POST /api/v1/admin/financial/license-taxes/sync-all`), acionados sob demanda pelo operador através de ações explícitas na interface ou tarefas agendadas (cron/workers).
  * Em métodos de sincronização e propagação entre serviços (`syncFromOnboarding`, `syncFromContract`), empregar sempre consultas defensivas `SELECT *` com fallbacks de colunas opcionais (`$req['cidade'] ?? $req['cidade_celebracao'] ?? ''`), evitando que discrepâncias em colunas legadas quebrem a execução da rotina.

### 🛡️ REGRA 58: Invariante de Liberação de Iframe do Chatwoot no Servidor Web (Chatwoot Iframe CSP Invariant)
* **Diretriz**: Qualquer rota do ecossistema destinada ao envelopamento dentro do sidebar ou modais do Chatwoot (`/portal-gestor/crm/dossier-embed`, `/crm/dossier-embed`) deve ter seus cabeçalhos HTTP liberados tanto no `.htaccess` quanto nos controllers PHP de backend.
* **Ação**:
  * Em `.htaccess`, declarar obrigatoriamente:
    ```apache
    <IfModule mod_headers.c>
        Header unset X-Frame-Options
        Header always set Content-Security-Policy "frame-ancestors 'self' https://crm.bodyharmony.com.br"
    </IfModule>
    ```
  * Em endpoints PHP dedicados a embeds, enviar os headers `Content-Security-Policy: frame-ancestors 'self' https://crm.bodyharmony.com.br;` e `X-Frame-Options: ALLOW-FROM https://crm.bodyharmony.com.br`.

### 📱 REGRA 59: Invariante de Normalização e Resolução do 9º Dígito (Brazilian Phone Normalization Invariant)
* **Diretriz**: Buscas por telefone no ecossistema (CRM, Contratos, Onboarding, Leads) devem operar sob normalização defensiva do 9º dígito e variações de máscara brasileiras.
* **Ação**:
  * Em `CrmBridgeService.php` e serviços de contato, extrair sempre `$clean` (dígitos puros), `$suffix8` (últimos 8 dígitos) e `$suffix9` (últimos 9 dígitos).
  * No MySQL, aplicar a cláusula de matching resiliente:
    `WHERE (whatsapp LIKE :full OR whatsapp LIKE :p8 OR whatsapp LIKE :p9 OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(whatsapp, '(', ''), ')', ''), '-', ''), ' ', ''), '+', '') LIKE :p8)`.

### ⚡ REGRA 60: Invariante de Tolerância a Falhas em Mensageria Externa (WhatsApp Fault Tolerance Invariant)
* **Diretriz**: Chamadas HTTP para serviços externos de mensageria (Evolution API, WhatsApp Bots, Gateways) disparadas a partir de gatilhos do sistema (emissão de contratos, confirmação de agendamentos) nunca podem travar ou interromper a execução do fluxo principal em caso de timeout ou indisponibilidade da instância.
* **Ação**:
  * Envolver requisições HTTP em blocos `try-catch (\Throwable $e)` com `CURLOPT_CONNECTTIMEOUT <= 3` e `CURLOPT_TIMEOUT <= 3`.
  * Em caso de falha, emitir log `[CRM_TRIGGER_WARN]` e retornar `dispatched = true` com a flag `whatsapp_sent = false`.

### ⚛️ REGRA 61: Invariante de Integridade de Imports Lazy no React Router (Lazy Import Integrity Invariant)
* **Diretriz**: Ao introduzir novas páginas ou rotas no roteador central (`App.jsx`), é estritamente proibido sobrescrever ou remover referências lazy de outras rotas existentes no componente.
* **Ação**:
  * Sempre realizar inserções contíguas limpas sem alterar os nós existentes.
  * Executar `npm run build` após cada edição de rotas para assegurar ausência de `ReferenceError`.

### 🗄️ REGRA 62: Invariante de Credenciais de Usuários Administrativos (`password_hash` Invariant)
* **Diretriz**: Na tabela `admin_users`, a coluna física de armazenamento de credenciais criptografadas é estritamente **`password_hash`**. É terminantemente proibido utilizar o identificador `password` em queries SQL, schemas ou chamadas de métodos de serviços backend (`RbacService.php`, `AuthController.php`, etc.).
* **Ação**:
  * Em statements SQL (`INSERT`, `UPDATE`, `SELECT`), referenciar sempre `admin_users.password_hash`.
  * Métodos de serviço como `resetUserPassword($userId, $newPassword)` e `createUser($data)` devem receber senhas em texto puro, aplicar `password_hash($newPassword, PASSWORD_DEFAULT)` e persistir na coluna `password_hash`.
  * Métodos de atualização cadastral (`updateUser`) que recebam a chave opcional `password` devem aplicar a validação mínima ($\ge 6$ caracteres) e gravar em `password_hash`.

### 🔒 REGRA 63: Invariante de Transporte Seguro SSL/HTTPS e Anti-Mixed Content (SSL/HSTS & Mixed Content Invariant)
* **Diretriz**: O domínio canônico `bodyharmony.com.br` e todas as suas rotas e ativos devem operar sob transporte estritamente criptografado HTTPS, com prevenção automática contra conteúdo misto (*Mixed Content*) em todos os navegadores.
* **Ação**:
  * O arquivo `.htaccess.production` deve conter no topo a regra canônica de redirecionamento 301 para HTTPS compatível com proxies e Edge CDN:
    ```apache
    RewriteCond %{HTTPS} off
    RewriteCond %{HTTP:X-Forwarded-Proto} !https
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    ```
  * O `.htaccess.production` deve injetar os cabeçalhos de segurança:
    * `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
    * `Content-Security-Policy: upgrade-insecure-requests; frame-ancestors 'self' https://crm.bodyharmony.com.br;`
    * `X-Content-Type-Options: nosniff`
    * `X-XSS-Protection: 1; mode=block`
    * `Referrer-Policy: strict-origin-when-cross-origin`
  * O `index.html` raiz da SPA React deve conter obrigatoriamente a meta tag:
    `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />`.

### 🐍 REGRA 64: Invariante de Codificação UTF-8 em Scripts CLI e Daemons Python (Python CLI Unicode Encoding Invariant)
* **Diretriz**: Todos os scripts de automação, ferramentas de auditoria, runners de testes e daemons de monitoramento escritos em Python executados no ambiente operacional Windows (`powershell`/`cmd`) devem garantir a reconfiguração defensiva de encoding para UTF-8 no topo do script. É proibido depender do encoding padrão do sistema (`cp1252`), prevenindo erros fatais de `UnicodeEncodeError: 'charmap'` ao imprimir logs com emojis ou caracteres multibyte.
* **Ação**:
  * No cabeçalho de todo script Python (`scripts/*.py`), declarar obrigatoriamente logo após as importações:
    ```python
    import sys
    if sys.platform == 'win32':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except Exception:
            pass
    ```
  - Em chamadas `subprocess.run()` que processem saída de comandos com texto acentuado ou caracteres binários, especificar explicitamente `encoding='utf-8', errors='replace'` (em vez de apenas `text=True`).
### 📐 REGRA 65: Invariante de Componentes Primitivos de UI e Responsividade Adaptativa (Responsive UI Primitives Invariant)
* **Diretriz**: É expressamente proibido construir ou manter tabelas administrativas com layouts fixos em CSS grid rígido ou `styled.table` sem tratamento responsivo para telas pequenas. Toda tabela, barra de abas e grid de métricas do Portal do Gestor e LMS deve herdar os 4 componentes primitivos canônicos de `src/components/ui/`.
* **Ação**:
  * **Tabelas de Dados**: Utilizar `<ResponsiveDataTable>` com colunas configuradas para `truncate`, `maxWidth`, `isTitle`, `isBadge` e `isAction`. Em telas `≤ 1024px`, o componente deve converter automaticamente para Stacked Cards sem sobreposição de texto e com touch targets $\ge 44\times 44\text{px}$.
  * **Grids de Métricas**: Utilizar `<CompactKpiGrid>` com `minmax(180px, 1fr)` e altura contida ($\le 90\text{px}$), evitando desperdício de espaço vertical em viewports padrão ($\le 800\text{px}$).
  * **Navegação por Abas**: Utilizar `<ScrollableTabs>` para qualquer barra de abas com 3 ou mais itens, garantindo rolagem horizontal suave, touch targets $\ge 44\text{px}$ e sem corte de rótulos.
  * **Ações de Linha**: Utilizar `<TableRowActionMenu>` para padronizar 1 ação primária em destaque e agrupar ações secundárias em menu suspenso `...`.
  * **Ícones Lucide-React**: Usar exclusivamente ícones válidos do catálogo `lucide-react` (ex: `ShieldCheck`/`UserCheck` em vez de referências legadas como `UserShield` do FontAwesome).

### 💳 REGRA 66: Invariante de Gateway de Pagamentos Asaas, Antifraude & Webhooks (Asaas Gateway & Payment Invariant)
* **Diretriz**: Qualquer integração ou endpoint financeiro baseado no gateway Asaas API v3 deve seguir estritamente o desacoplamento de ambiente, blindagem criptográfica de webhook, idempotência bancária, suporte a cartões de terceiros e controle de comunicação por e-mail.
* **Ação**:
  1. **Detecção Automática de Sandbox & Fallback Mock**:
     - Chaves com prefixo `$aact_hmlg_` direcionam automaticamente para `https://sandbox.asaas.com/api/v3`.
     - Chaves ausentes, vazias ou rotuladas como `mock` ativam automaticamente o modo Mock simulado com geração de QR Code visual para desenvolvimento local seguro.
  2. **Controle de Notificações Nativas (`ASAAS_DISABLE_NOTIFICATIONS`)**:
     - Todas as chamadas de criação de clientes (`POST /customers`) e cobranças (`POST /payments`) devem enviar `'notificationDisabled' => true` (ou variável de ambiente correspondente), evitando que o Asaas envie e-mails transacionais genéricos e preservando a régua de comunicação luxury exclusiva da Body Harmony.
  3. **Antifraude e Cartão de Terceiros (`creditCardHolderInfo`)**:
     - Ao processar cartão cujo titular difere do participante (`is_same_as_attendee === false`), é obrigatório enviar o objeto `creditCardHolderInfo` preenchido com Nome, CPF sanitizado, Telefone/WhatsApp e CEP da fatura do titular real.
  4. **Blindagem e Idempotência do Webhook**:
     - O endpoint `/api/v1/payments/webhook/asaas` deve interceptar o header `asaas-access-token` / `HTTP_ASAAS_ACCESS_TOKEN` e validar contra `ASAAS_WEBHOOK_SECRET` utilizando `hash_equals()`.
     - Eventos recebidos repetidamente para pagamentos já confirmados/cancelados devem responder `HTTP 200 OK` de forma instantânea e idempotente, sem duplicar registros ou mutar estados estáveis.
  5. **Simulação de Baixas no Sandbox**:
     - Testes automatizados na Sandbox devem utilizar o método oficial `POST /v3/payments/{id}/receiveInCash` informando o valor positivo em Reais para liquidação imediata da cobrança.
  6. **Polling Reativo & Auto-Recuperação de Ingressos**:
     - Modais de checkout PIX devem aplicar polling em background a cada 3.5 segundos, transicionando automaticamente para a tela de confirmação assim que a baixa for detectada.
     - A rota `POST /api/v1/congress/ticket/lookup` deve permitir consulta por CPF formatado/desformatado e por E-mail.

### 🪟 REGRA 67: Invariante de Modais e Bottom Drawers Responsivos (`ResponsiveModal` Invariant)
* **Diretriz**: É expressamente proibido construir ou manter modais com posicionamento ou altura fixa que causem cortes em telas de smartphones ou que fiquem encobertos por teclados virtuais. Todo modal administrativo, operacional ou público deve herdar o componente primitivo `ResponsiveModal.jsx` (`src/components/ui/`).
* **Ação**:
  - **Desktop (`> 768px`)**: Modal centralizado na tela com backdrop blur Luxury (`rgba(10, 62, 96, 0.7)` ou dark `#0c121c`), cantos arredondados (`16px`), max-width configurável e animação suave fade/scale.
  - **Mobile (`≤ 768px`)**: Auto-conversão em **Bottom Drawer** ancorada na base da tela com:
    - Animação suave `translateY` de baixo para cima.
    - Alça visual de arrasto (*drag handle* pill) de $44\text{px}\times 5\text{px}$ centralizada no topo.
    - Altura máxima dinâmica (`calc(100dvh - 24px)` ou `92dvh`).
    - Rolagem interna suave (`overflow-y: auto`, `-webkit-overflow-scrolling: touch`).
    - Cabeçalho e rodapé sticky para que CTAs e botão de fechar nunca fiquem fora de vista.
  - **Controles de Acessibilidade & UX**: Fechamento por tecla `Esc` e clique no backdrop, bloqueio de rolagem do `body` e alvos de toque $\ge 44\times 44\text{px}$.

### 🎟️ REGRA 68: Invariante de Pricing de Alta Conversão e Mega Highlight Box de Crédito (Pricing Luxury Invariant)
* **Diretriz**: Seções de precificação e venda de ingressos na Landing Page do Congresso e Loja Virtual devem seguir o layout dual card luxury com comunicação explícita de valor agregado e conversão direta de crédito para o Licenciamento.
* **Ação**:
  - **Grid em 2 Cards**: Separar claramente a categoria *Experience* (conteúdo e networking acessível) da categoria *VIP Exclusive* (bastidores, mesa de negócios e crédito integral).
  - **Mega Highlight Box de Crédito**: O card VIP deve conter destaque mestre em gradiente dourado sutil (`rgba(237, 126, 19, 0.15)`) comunicando que **100% do valor do ingresso é revertido em desconto direto na adesão à franquia Body Harmony**.
  - **Box Comparativo de Decisão**: Incluir resumo no rodapé da seção orientando de forma transparente o público na escolha do ingresso ideal.
  - **Mobile Ergonomics**: Grid em coluna única (`grid-cols-1 gap-4`) em viewports $\le 768\text{px}$ com botões de CTA $\ge 48\text{px}$ de altura.

### ⚛️ REGRA 69: Invariante de Renderização de Componentes e Ícones Dinâmicos no React (React Dynamic Icon & Element Invariant)
* **Diretriz**: É expressamente proibido utilizar checagens de tipagem ingênuas como `typeof Icon === 'function'` para determinar a renderização de ícones ou componentes recebidos por propriedade. Em empacotamentos de produção (Vite/Rollup com `lucide-react`), ícones e componentes envelopados são objetos `React.forwardRef` (`typeof === 'object'`), o que causa quebra imediata por `Minified React error #31` (*Objects are not valid as a React child*) quando injetados como texto.
* **Ação**:
  * Em todo componente que aceita ícones ou elementos customizados (ex: `CompactKpiGrid`, `ScrollableTabs`, `TableRowActionMenu`, cartões de métricas), utilizar estritamente a resolução defensiva:
    ```jsx
    {IconComponent && (
      React.isValidElement(IconComponent) ? (
        IconComponent
      ) : (
        <IconComponent size={18} strokeWidth={2} />
      )
    )}
    ```
  * Essa abordagem garante compatibilidade universal com elementos JSX instanciados (`<DollarSign size={18} />`), componentes funcionais puros, objetos `React.forwardRef` e `React.memo`.

### 🐘 REGRA 70: Invariante de Acesso Defensivo a Agregações PDO em PHP 8.4 (PDO Summary Aggregations Invariant)
* **Diretriz**: No runtime PHP 8.4, o acesso a índices de texto em valores não-array (como o booleano `false` retornado por `PDOStatement::fetch()` em conjuntos vazios) resulta em `TypeError` fatal que interrompe a requisição com HTTP 500. Toda leitura de agregação de banco de dados deve ser 100% defensiva.
* **Ação**:
  * Aplicar obrigatoriamente o operador coalescente `?? 0` ou `?? null` em todas as colunas de retorno de `fetch()`:
    ```php
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    $totalCents = (int)($row['total_contracted_cents'] ?? 0);
    $totalRecords = (int)($row['total_records'] ?? 0);
    ```
  * Nunca acessar índices diretamente sem garantia prévia de coalescência ou verificação `is_array($row)`.

### 🎨 REGRA 71: Invariante de Interpolação de Keyframes em Styled-Components (Styled-Components Keyframes Invariant)
* **Diretriz**: No `styled-components` v5+, objetos de animação criados via `keyframes\`...\`` **jamais** podem ser interpolados dentro de template strings JS cruas (`${props => props.$active && \`animation: ${anim} ...\`}`). Fazer isso corrompe a árvore de estilos dinâmicos e dispara o erro fatal **Error #12** no runtime do navegador.
* **Ação**:
  * Toda interpolação condicional ou dinâmica contendo `keyframes` deve ser obrigatoriamente envelopada pelo helper `css` do `styled-components`:
    ```javascript
    import styled, { keyframes, css } from 'styled-components';

    // ✅ Correto:
    ${props => props.$isVip && css`
      animation: ${pulseBorder} 3s infinite ease-in-out;
    `}
    ```
  * Nunca usar interpolação inline de `style={{ animation: \`${spin} ...\` }}` em elementos JSX React quando a animação for um objeto `keyframes`.

### 🛡️ REGRA 72: Invariante de Underscores em Headers e Tokens no Proxy Nginx (Nginx Headers Underscore & Token Invariant)
* **Diretriz**: No Nginx, cabeçalhos HTTP com caracteres de sublinhado (como `api_access_token` exigido pela API do Chatwoot) são descartados silenciosamente por padrão (`underscores_in_headers off`), resultando em falhas de autenticação `401 Unauthorized` em chamadas de API através do proxy reverso.
* **Ação**:
  * Em arquivos de configuração de reverse proxy Nginx para microsserviços e APIs com tokens (`crm.bodyharmony.com.br`, `evolution.bodyharmony.com.br`), incluir explicitamente `underscores_in_headers on;` no bloco `server`.
  * Em serviços backend PHP que comunicam com o Chatwoot (`CrmBridgeService`, `CrmHistorySyncService`), passar o token de forma defensiva tanto na URL (`?api_access_token=...`) quanto nos cabeçalhos (`api_access_token` e `api-access-token`), garantindo resiliência contra filtros de cabeçalhos intermediários.

### 📦 REGRA 73: Invariante de Preservação de Timestamps e Enriquecimento no CRM (CRM History Sync & Timestamp Invariant)
* **Diretriz**: Na importação e ingestão retroativa de conversas e mensagens de WhatsApp/canais no CRM Chatwoot, as mensagens devem obrigatoriamente manter a data e hora históricas reais de disparo para assegurar a ordem cronológica estrita nas caixas de entrada dos atendentes.
* **Ação**:
  * Injetar explicitamente o timestamp Unix original no campo `created_at` do payload de mensagens no Chatwoot (`POST /api/v1/accounts/1/conversations/{id}/messages`).
  * Realizar resolução defensiva de contatos contra a tabela `licenciadas` por 8/9 dígitos telefônicos, enriquecendo o registro do contato com CPF, cidade e estado durante a ingestão.
  * Aplicar deduplicação idempotente por hash (`md5(phone|content|minute)`) para impedir duplicações no mesmo lote.

### 🧭 REGRA 74: Invariante de Estúdios de CMS e Gestão Visual Master-Detail (Master-Detail Visual Studio Invariant)
* **Diretriz**: É expressamente proibido construir ou manter formulários densos de CMS com mais de 3 seções ou mais de 20 campos editáveis empilhados de forma linear contínua em telas administrativas. Todo estúdio visual ou editor de landing page deve implementar o padrão Master-Detail Studio.
* **Ação**:
  * **Navegador Lateral de Seções**: No Desktop (`> 1024px`), dispor de sidebar vertical compacta com seções numeradas, ícones dedicados e badges de status de publicação em tempo real (`✓ Ativo` em verde / `Oculto` em vermelho). No Mobile/Tablet (`≤ 1024px`), utilizar abas deslizantes roláveis horizontais ou dropdown seletor no topo.
  * **Painel de Edição Focado**: Renderizar exclusivamente a seção selecionada por vez na área central, dividida em sub-abas claras: **`📝 Textos & Copys`** (conteúdo estruturado em grid) e **`🎨 Tipografia & Design`** (alinhamento, escalas de fonte, pesos e espaçamentos).
  * **Barra Sticky Flutuante no Rodapé**: Fixar barra no rodapé da janela com backdrop blur escuro luxury (`rgba(10, 62, 96, 0.95)`), suporte nativo ao atalho **`Ctrl+S` / `Cmd+S`** com gravação instantânea e atalhos rápidos para Live Preview (Desktop e Mobile 390px).
  * **Retração Automática de Métricas**: Recolher grids de KPIs/estatísticas quando o usuário estiver em abas de estúdio ou edição visual, dedicando 100% da altura da tela ao editor.

### 📊 REGRA 75: Invariante de Ingestão Estrita do Catálogo de Produtos e Densidade de Tabelas (Catalog Ingestion & Table Density Invariant)
* **Diretriz**: O Catálogo de Produtos (`shop_products`) é a Fonte da Verdade Estrita para qualquer oferta, ingresso, plano ou produto exibido no ecossistema Body Harmony. É expressamente proibido manter valores, nomes ou benefícios de produtos hardcoded em templates ou CMS de texto quando tais itens existem no catálogo de produtos.
* **Ação**:
  * **Sincronia Estrita em Landing Pages**: Todas as páginas públicas de venda e tabelas de ingressos (`TabelaIngressos.jsx`, `OfertaExperienceSection.jsx`, `VipSection.jsx`, `/shop`) devem ingerir nome, preço, subtítulo e lista de benefícios (`features`) diretamente do array `products` vindo da API `/api/v1/shop/products`. Edições feitas pelo gestor no catálogo devem refletir imediatamente no frontend.
  * **Padrão Tabela Densa Luxury**: Em listagens do Portal do Gestor (Catálogo de Produtos, Pedidos, Leads), aplicar densidade ergonômica: padding vertical reduzido nas células (`th` e `td` com `padding: 0.55rem 0.85rem`), miniaturas compactas (`48x38px`), inputs de link direto compactos (`height: 30px`) e botões de ação na mesma linha sem quebras ou rolagem vertical artificial.
  * **Lote Vigente com Golden Shader**: O lote ativo/vigente deve ser exibido com destaque mestre através do `GoldenNebulaFluidShader`, mantendo lotes futuros discretos e compactos.

### 🛡️ REGRA 60: Invariante de Defensividade de Strings e Error Boundaries no Frontend (Defensive Rendering Invariant)
* **Diretriz**: É expressamente proibido realizar acessos diretos a métodos de string (como `.charAt()`, `.toLowerCase()`, `.toUpperCase()`, `.trim()`, `.includes()`) ou encadeamentos profundos de propriedades em objetos sem proteção de Optional Chaining (`?.`) e fallbacks defensivos para strings vazias ou nulas (`|| ''`, `|| 'Contato'`). Todas as páginas mestres e módulos críticos (como CRM, Contratos e Financeiro) devem ser envelopados por componentes `<ErrorBoundary />` para garantir recuperação graciosa e prevenção de telas brancas.
* **Ação**:
  * **Acesso a Strings e Avatares:** Utilizar sempre `(item?.name || item?.phone || 'Contato').charAt(0)` em vez de `item.name.charAt(0)`.
  * **Buscas e Filtros:** Utilizar sempre `(item?.name || '').toLowerCase().includes(query.toLowerCase())`.
  * **Envelopamento de Módulos:** Envelopar páginas e workspaces complexos (`CRMHubPage.jsx`, `ContractsManager.jsx`, etc.) com `<ErrorBoundary fallback={<LuxuryErrorFallback />} />`.
  * **Higienização de Payloads Backend:** APIs PHP devem sempre aplicar `COALESCE` e fallbacks em campos de exibição obrigatórios, garantindo que o JSON de saída nunca retorne `null` para propriedades consumidas como string no frontend.

### 📱 REGRA 61: Invariante de CRM Zero-Mock e Telemetria Viva (CRM Zero-Mock & Privacy Invariant)
* **Diretriz**: É terminantemente proibido semear, codificar ou exibir números de telefone hardcoded, fictícios ou particulares nos canais e instâncias de atendimento do CRM. Todos os números ativos devem originar-se exclusivamente da telemetria viva retornada pela Evolution API (`ownerJid` / `number`) após o pareamento oficial do aparelho WhatsApp.
* **Ação**:
  1. Instâncias não pareadas ou desconectadas devem manter estritamente `status = 'DISCONNECTED'` e `phone_number = 'Aguardando Leitura do QR'`, sendo proibido simular status `CONNECTED` com números estáticos.
  2. Em endpoints de conversas e mensagens (`inbox_conversations.php`, `inbox_messages.php`), é expressamente proibido criar loops de fallback sintéticos que gerem mensagens fictícias a partir de tabelas correlatas (como `licenciadas`) quando a API de mensageria estiver vazia ou com lentidão. Caso não existam conversas ativas, retornar estritamente array vazio `[]` com HTTP 200.
  3. É expressamente proibido comitar, registrar em seeds ou utilizar números particulares de operadores em arquivos de código ou banco de dados.

---

## ⚡ Verificação de Inicialização
Ao interagir com o desenvolvedor humano, o agente de IA deve confirmar a leitura destas regras imprimindo a assinatura de boot:
*"Nexus Protocol V3.1 Ativo (PHP 8.4). Comunicação em PT-BR. Caminhos sincronizados. Constituição de IA Verificada."*




---

# Reversa

> Framework de Engenharia Reversa instalado neste projeto.

## Como usar

Digite `reversa` para ativar o Reversa e iniciar ou retomar a análise do projeto.

## Comportamento ao ativar

Quando o usuário digitar `reversa` sozinho em uma mensagem:

1. Ative o skill `reversa` disponível em `.agents/skills/reversa/SKILL.md`
2. Leia o SKILL.md na íntegra e siga exatamente as instruções do Reversa

## Regra não-negociável

Nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto legado.
O Reversa escreve **apenas** em `.reversa/` e `_reversa_sdd/`.
