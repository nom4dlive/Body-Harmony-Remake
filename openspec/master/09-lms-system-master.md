# 🎓 09-LMS-System-Master (Phase 6)

> **Status:** Active
> **Version:** 2.0 (Nexus Era)
> **Owner:** Arquiteto Fullstack
> **Last Update:** 2026-06-12

---

## 1. Visão Geral (Overview)

O **LMS (Learning Management System)** da Body Harmony é um ambiente exclusivo para licenciadas, projetado para entregar conteúdo educacional de alta performance com segurança rigorosa.

**Objetivos Críticos:**

1.  **Proteção de Propriedade Intelectual:** Impedir downloads não autorizados e compartilhamento de contas.
2.  **Experiência Premium:** Interface "Netflix-style" fluida, responsiva e visualmente alinhada à Identidade V3.
3.  **Rastreabilidade:** Monitoramento total do progresso e acessos (Audit Log).

---

## 2. Arquitetura de Segurança (Security Layer)

A segurança é o pilar central da Fase 6. Implementaremos um modelo **Zero Trust** adaptado para o ambiente Hostinger (PHP/Apache).

### 2.1. Device Authorization (Device Binding)

- **Conceito:** Cada login bem-sucedido vincula o dispositivo (User-Agent + Token gerado) ao aluno.
- **Regra:**
  - Limite configurável (`students.max_devices`, padrão = 1).
  - Se tentar logar em um novo dispositivo e o limite estourar -> **Bloqueio Automático**.
  - O aluno deve contatar o suporte para "resetar" os dispositivos (evita compartilhamento de senha).
- **Transporte:** Header `X-Device-Token` obrigatório em todas as requisições autenticadas.

### 2.2. Proteção de Ativos (DRM-Lite)

- **Vídeos:**
  - **Hospedagem:** Hostinger (Interno) via `private_uploads/lessons/` e fragmentos HLS em `private_uploads/hls/`.
  - **Entrega HLS (HTTP Live Streaming):** Conversão automatizada via FFmpeg (executado em baixa prioridade com `nice -n 19` via cURL Loopback assíncrono sob SAPI LiteSpeed em produção compartilhada e CLI em desenvolvimento local). Entrega fragmentada de arquivos `.ts` e playlist `.m3u8` com proteção de `.htaccess` CORS (usando header de origem wildcard `*` para compatibilidade cross-subdomain) e cache agressivo na CDN (Cloudflare) configurado para 30 dias (`immutable`).
  - **Entrega MP4 (Fallback):** Motor `api/v1/stream.php` com suporte a `HTTP Range` para busca (seeking).
  - **Segurança:** Assinatura HMAC-SHA256 com expiração configurável para links de fallback MP4.
  - **Cache Management:** Forçar `no-store` em transmissões MP4 e usar Cache-Control de 30 dias (`immutable`) para fragmentos estáticos HLS.
  - **Desempenho:** Buffer de leitura de 1MB para MP4 e download sob demanda de pedaços de 4 segundos para HLS (hls.js).
  - **Robustez:** Fallback de reprodução automático de HLS para MP4 assinado no player React (`AlunaLessonPlayer` e `VideoPlayerWrapper`) com tratadores de erro HLS e Safari nativo que detectam falhas fatais e solicitam URLs assinadas de stream legado em tempo de execução.
  - **Frontend Cleanup:** Coleta de lixo explícita no React (`video.load()`) ao desmontar componentes para liberar RAM.
- **Arquivos (PDFs/Docs):**
  - **Storage:** Pasta `api/protected/files/` fora do `public_html/assets`.
  - **Acesso Direto Bloqueado:** `.htaccess` com `Deny from all`.
  - **Entrega:** Endpoint `api/download.php` valida a sessão, lê o arquivo via PHP (`readfile`) e entrega o stream de dados.

### 2.3. Auditoria (Logs)

- Tabela `lms_access_logs` registra:
  - Login (Sucesso/Falha)
  - Início de Aula (Play)
  - Tentativa de Download
  - IPs suspeitos

---

## 3. Database Schema (Schema V36.1)

O banco de dados foi consolidado (`DATABASE_MASTER_V36_1.sql` + 65 migrations) para suportar a estrutura hierárquica do curso e o controle de acesso a módulos exclusivos.

### Entidades Principais:

1.  **`lms_modules`**: Capítulos ou Módulos do curso.
    - `is_exclusive`: Flag booleano para conteúdo restrito/exclusivo.
2.  **`lms_lessons`**: Aulas individuais.
    - `video_type`: Suporte a múltiplos players (YouTube, Vimeo, Panda).
    - `duration_seconds`: Para cálculo de tempo total.
3.  **`licenciada_course_access`**: Permissões de acesso a módulos exclusivos para licenciadas.
4.  **`lms_progress`**: Tabela pivot (Student <-> Lesson).
    - `progress_percent`: 0 a 100.
    - `is_completed`: Boolean.
    - `last_watched_at`: Timestamp para recurso "Continuar de onde parou".
5.  **`lms_attachments`**: Materiais de apoio vinculados à aula.
    - `file_path`: Caminho relativo **seguro** (não público).

---

## 4. API Specification (Backend PHP)

Endpoints RESTful consumindo JSON.

### 4.1. Autenticação

- `POST /v1/auth/licenciada/login`
  - **Payload:** `{ login: "...", password: "..." }`
  - **Response:** `{ token: "xyz...", student: {...} }`
  - **Logic:** Valida credenciais e enforce Device Binding.

### 4.2. Conteúdo (LMS)

- `GET /v1/lms/modules` (Trilha)
  - **Response:** Lista de Módulos com % de progresso calculado.
- `GET /v1/lms/modules/{id}/lessons` (Detalhe)
  - **Response:** Módulo + Lista de Aulas (com status de `watched`).
- `GET /v1/lms/resources` (Materiais)
  - **Response:** Lista de arquivos disponíveis na biblioteca.

### 4.3. Progresso e Metadados

- `POST /v1/lms/progress`
  - **Payload:** `{ lesson_id: 1, progress_percent: 50, is_completed: false }`
  - **Effect:** Upsert na tabela `lms_progress`.
- `PATCH /v1/lms/lessons/{id}/duration`
  - **Payload:** `{ duration_seconds: 1200 }`
  - **Effect:** Atualiza a duração da aula se for igual a 0.
- `PATCH /v1/lms/lessons/{id}/thumbnail`
  - **Payload:** `{ thumbnail_base64: "data:image/..." }`
  - **Effect:** Salva a miniatura convertida em base64 da aula.

### 4.4. Download Seguro

- `GET /api/download.php?file_id=123`
  - **Header Required:** `X-Device-Token`
  - **Logic:**
    1. Valida Token.
    2. Busca path no DB.
    3. Verifica se arquivo existe em `protected/`.
    4. Seta headers `Content-Type: application/pdf`.
    5. Expele arquivo.

### 4.5. Controle de Acesso Exclusivo (Admin)

- `GET /v1/admin/lms/exclusive-access/list`
  - **Response:** Lista de acessos de licenciadas a módulos exclusivos ativos.
- `GET /v1/admin/lms/exclusive-access/targets`
  - **Response:** Lista de licenciadas e módulos marcados como exclusivos.
- `POST /v1/admin/lms/exclusive-access/grant`
  - **Payload:** `{ licenciada_id: 123, module_id: 45, expires_at: "YYYY-MM-DD HH:MM:SS" | null }`
  - **Response:** `{ success: true, message: "..." }`
- `POST /v1/admin/lms/exclusive-access/revoke`
  - **Payload:** `{ licenciada_id: 123, module_id: 45 }`
  - **Response:** `{ success: true, message: "..." }`

---

## 5. Frontend Architecture (React)

### 5.1. Roteamento (Private Routes)

Novas rotas protegidas pelo `<StudentGuard>`:

- `/lms` (Dashboard/Trilha)
- `/lms/module/:id` (Playlist do Módulo)
- `/lms/lesson/:id` (Sala de Aula - Player Focus)

### 5.2. Componentes Chave

#### `LMSLayout`

- Sidebar colapsável com progresso geral.
- Header com Perfil reduzido.
- Bloqueio de Right-Click (CSS/JS) no conteúdo principal.

#### `VideoPlayer` Wrapper

- Wrapper sobre `react-player`.
- Salva o progresso a cada 15s ou no `onPause`/`onEnded`.
- **Prevenção:** Overlay transparente para dificultar "Save Video As" (embora YouTube iframe seja difícil de bloquear totalmente, o PandaVideo seria ideal).

#### `PDFViewer` (Secure)

- Não usa `<a href="...">` direto.
- Usa `blob` object URL.
- O fetch é feito com header de autorização, e o PDF é renderizado no navegador (ex: `react-pdf`) ou baixado via Blob.

---

## 6. Deployment Strategy

### 6.1. Hostinger Constraints

- **PHP Version:** 8.4+ (V3.1 Standard)
- **Upload Max Size:** Configurar `.htaccess` (`upload_max_filesize`).

### 6.2. File Structure (Source)

```
apps/web-app/
├── src/backend/
│   ├── protected/       <-- PASTA SEGURA (Configurada via script)
│   │   ├── .htaccess    (Deny from all)
│   │   └── files/       (PDFs, Zips)
```

---

## 7. Roadmap de Implementação

1.  **Database & API Core** (✅ Concluído)
2.  **API Download Seguro** (✅ Concluído — `stream.php` com HMAC-SHA256)
3.  **Frontend Authentication V2** (✅ Concluído — Dual-Token + Device Binding)
4.  **Frontend LMS Dashboard** (✅ Concluído — Netflix-style)
5.  **Frontend Lesson Player** (✅ Concluído — Progress Sync a cada 15s)
6.  **Security Audit** (✅ Concluído — Watchtower + Forensics)

---
