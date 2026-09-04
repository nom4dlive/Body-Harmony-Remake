# 🗺️ Mapeamento Global de Informações: Licenciadas (V43.8)

> **Status:** Ativo | **Última Atualização:** 2026-02-20
> **Objetivo:** Fonte única da verdade (Single Source of Truth) para todo o ecossistema referente às Licenciadas da Body Harmony.

---

## 1. 🗄️ Camada de Dados (SQL Schema Master)

### Tabela Principal: `licenciadas`
| Coluna | Tipo | Descrição / Uso |
|---|---|---|
| `id` | `int(11)` | Identificador Único Universal no Nexus |
| `name` | `varchar(100)` | Nome de Exibição Sanitizado (Ex: `Simône Àssis`) |
| `cpf` | `varchar(14)` | Chave primária de acesso. Armazenado apenas números. |
| `email` | `varchar(100)` | E-mail da licenciada (Fallback Autenticação / Gerado via Sync) |
| `username` | `varchar(50)` | Nome de usuário interno gerado automaticamente |
| `password_hash` | `varchar(255)` | Senha criptografada BCRYPT. Padrão inicial: `Mudar123!` |
| `force_password_change` | `tinyint(1)` | Controla o UX do "Primeiro Acesso", forçando troca da senha (1) |
| `is_active` | `tinyint(1)` | Flag de bloqueio Admin (1 = Ativa, 0 = Inativa) |
| `state` / `location` | `varchar` | Estado (UF) e Cidade de atuação comercial |
| `whatsapp` | `varchar(20)` | Fone numérico para integração API WhatsApp |
| `instagram` | `varchar(50)` | Handle do instagram (com o `@` unificado) |
| `photo_url` | `varchar(255)` | URL absoluta da foto salva em disco (`/uploads/licenciadas/...`) |
| `profile_photo` | `varchar(255)` | Coluna legada mantida para retrocompatibilidade em controllers antigos |
| `instagram_embed_url` | `varchar(255)` | Link opcional de widget do instagram embedado |
| `video_url` | `varchar(255)` | Link opcional de vídeo promo de consultório |
| `mini_gallery` | `longtext` | Lista JSON com URLs de casos clínicos / antes & depois |
| `admin_notes` | `text` | Observações invisíveis à licenciada (Painel Nexus/Admin) |
| `created_at` / `last_login_at` | `timestamp` | Tracking de data de início e último acesso efetivo |
| `max_devices` | `int(11)` | Máximo de dispositivos permitidos (Default: 1) |
| `pinned` | `tinyint(1)` | Destaque Visual (Estrela) na Vitrine Pública / Gestor |

### Tabela Auxiliar: `licenciada_devices`
Gerencia a Prevenção de Pirataria e Sessões Ativas (Auth Duplo V23).
- `id` (INT)
- `licenciada_id` (INT) Relacionamento `licenciadas.id`
- `device_token` (VARCHAR 64) Token persistente da máquina
- `ip_address` (VARCHAR)
- `user_agent` (TEXT)
- `last_used_at` (DATETIME) / `is_active`

---

## 2. 📡 Camada de API (Endpoints Backend)

### Públicos (Sem Auth)
- `GET /api/v1/licenciadas` - Vitrine pública do site de Licenciadas.
- `GET /api/v1/licenciadas/{id}` - Carrega perfil de uma licenciada específica.
- `POST /api/v1/auth/licenciada/login` - Endpoint de acesso do Portal.

### Autenticados (Acesso Restrito Aluna - `AlunaGuard`)
- `GET /api/v1/licenciada/progress` - Visualização de Módulos LMS concluídos.
- `GET /api/v1/licenciada/lessons` - Grade Curricular.
- `GET /api/v1/auth/licenciada/validate` - Validação do `device_token` silenciosa.
- `POST /api/v1/auth/licenciada/change_password` e `first-access` - Alteração biométrica e de Senhas.

### Gestor / Admin (Proteção `Admin`)
- `POST /api/v1/licenciadas` - Cadastro manual via Gestor.
- `PUT /api/v1/licenciadas/{id}` - Edição de perfil (Aplica a lógica de Renaming Dinâmico de Fotos).
- `DELETE /api/v1/licenciadas/{id}` - Exclusão Permanente.
- `GET /api/v1/gestor/lms/licenciadas` - Lista analítica de acessos.
- `GET /api/v1/admin/licenciadas/{id}/devices` - Revogação de acesso Pirata.

---

## 3. ⚛️ Camada de Frontend (Views React & Paths)

### Visão Pública Institucional
- **Página Principal**: `apps/web-app/src/frontend/src/pages/Licenciadas/Licenciadas.jsx`
- **Rota App.jsx**: `/licenciadas` e `/licenciadas-licenciadas` (Fallback de Links Externos).

### Área Logada (Portal Exclusivo)
- **Login**: `/portal-licenciada` (`pages/Portal/Login.jsx`)
- **Dashboard e Menu**: `/portal-licenciada/dashboard`, `/portal-licenciada/minhas-aulas`
- **Primeiro Acesso**: `/portal-licenciada/nova-senha` (Force Change)
- **Perfil**: `apps/web-app/src/frontend/src/pages/Portal/Profile/ProfilePage.jsx`
- **Contexto Global**: `LicenciadaAuthContext.jsx` (Lida com Session e Logout).

### Gestão Administrativa (Admin Dashboard)
- **Manager Corporativo**: `apps/web-app/src/frontend/src/pages/Admin/LicenciadasManager.jsx`
- **Modal de Edição Tabbled**: `apps/web-app/src/frontend/src/pages/Admin/components/LicenciadaModal.jsx`
- **Rota App.jsx**: `/admin/licenciadas`

---

## 4. 📁 Camada de FileSystem e Assets (Hostinger & Local)

### Nomeação Padrão do Nexus (Fotos de Perfil)
A foto sempre seguirá o padrão algorítmico e higienizado estabelecido no controller:
**`{ID}_Nome_SemAcentos_SemEspacos_CPF.extensão`**
*Exemplo: `9012_Simone_Assis_66919738287.png`*

### Caminhos Locais Absolutos (Ambiente de Desenvolvimento)
- **Backup Source**: `f:\Body-Harmony-Remake\backups\Fotos-Licenciadas`
- **Upload Dir (Testes)**: `f:\Body-Harmony-Remake\apps\web-app\src\backend\uploads\licenciadas`

### Caminhos Remotos Absolutos (Hostinger / Produção)
O frontend (`build`) e a montagem física interagem com estas pastas via FTP:
- **Pasta Root Hostinger**: `/domains/bodyharmony.com.br/public_html`
- **Pasta de Uploads**: `/domains/bodyharmony.com.br/public_html/uploads/licenciadas/`
- **URL Pública (Img Src)**: `https://bodyharmony.com.br/uploads/licenciadas/9012_Simone_Assis_66919738287.png`

---
> ⚖️ **Princípio de Governança V3.1:** Qualquer modificação de dados (Inserção/Atualização) deve obrigatoriamente atualizar a tabela estática, reciclar/renomear o arquivo no diretório `/uploads/` caso o nome ou CPF da entidade seja modificado, e ser acompanhada no terminal usando o Nexus Watchtower.
