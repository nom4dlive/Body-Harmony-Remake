# 🎯 Objetivo Fullstack
Clonar e sincronizar de forma cirúrgica e inteligente o ecossistema **Body Harmony (Nexus Protocol V3.1)** para a pasta **`Central_de_Projetos`** no Google Drive (`https://drive.google.com/drive/u/0/folders/1iGIhPf5OTo8WZkGr8WGPlQM5Qt0ibePh`), permitindo que agentes de IA autônomos compreendam 100% da arquitetura, regras de negócio, especificações e contratos do repositório sem desperdício de armazenamento em arquivos de mídia, backups e dependências binárias.

---

# 📜 Contratos de API (REGRA 1)
- [x] Contrato de sincronização e mapeamento de metadados em `openspec/contracts/drive/project-clone-manifest.json`
- [x] Validação de árvore de diretórios e integridade dos arquivos transmitidos

---

# 🚫 Espaço Negativo (Fora de Escopo / Exclusões Estritas)
- [ ] `node_modules/`, `vendor/`, `.venv/`, `.git/` e diretórios de cache temporário (`dist/`, `build/`, `.system_generated/`)
- [ ] Arquivos de mídia pesados (`.mp4`, `.mov`, `.avi`, `.mkv`, `.wav`, `.mp3`, vídeos de aulas)
- [ ] Backups de banco de dados brutos (`.sql.gz`, `.tar.gz`, `.zip`, `.vhdx`) e pastas físicas de uploads de pacientes (`uploads/`, `private_uploads/`)
- [ ] Modificação de qualquer código produtivo ou dados no banco de produção (REGRA 2 & Accidental Data Loss Prevention)

---

# 🗄️ Árvore de Diretórios e Escopo de Arquivos Incluídos

### 1. Governança e Regras de Inteligência Artificial
- `AGENTS.md` (Constituição Nexus Protocol V3.1)
- `README.md`, `CHANGELOG.md`
- `openspec/` (100% da documentação: `master/`, `contracts/`, `tracker/`, `deltas/`, `archive/`)

### 2. Código-Fonte da Aplicação (`apps/web-app/`)
- `apps/web-app/src/frontend/src/` (Componentes React, Pages, Services, Contexts, Hooks, CSS)
- `apps/web-app/src/backend/api/` (Controllers PHP 8.4, Services, Core Router, Models, Helpers)
- `apps/web-app/package.json`, `vite.config.js`, `tailwind.config.js`, `composer.json`

### 3. Infraestrutura, Automação & DevOps
- `infrastructure/` (Docker compose, Nginx sites, scripts de inicialização, migrations SQL)
- `Operations/` (Scripts PowerShell e Bash de deploy, provisionamento de inboxes e monitoramento)
- `scripts/` (Scripts CLI de sincronização, seeds, gerador de tokens OAuth2, watchdog)
- Arquivos de configuração de ambiente `.env.example`, `.env.deploy.example`, `.env.crm.example`

---

# ⚙️ Mecanismo de Sincronização Google Drive API
- Script dedicado `scripts/devops/sync_project_to_gdrive.py` utilizando `google-api-python-client` / OAuth2 com `clientId` e `clientSecret`.
- Criação da pasta raiz `Body-Harmony-Remake` dentro de `Central_de_Projetos` (`1iGIhPf5OTo8WZkGr8WGPlQM5Qt0ibePh`).
- Upload recursivo com preservação da estrutura de pastas, deduplicação por hash MD5/tamanho e relatório em tempo real de arquivos enviados.

---

# 🔍 Monitoramento Semântico (Regression Watch)
- [ ] Manter integridade estrita do repositório local `f:\Body-Harmony-Remake` sem alterações destrutivas
- [ ] Verificação de 100% dos arquivos transferidos com status HTTP 200 / Upload Success

---

# 🛡️ Matriz de Risco & Rollback
- **Risco:** Falha de autenticação OAuth2 ou estouro de cota do Google Drive.
- **Mitigação:** Tratamento defensivo com retry exponencial, envio apenas de código/texto e exclusão total de binários pesados.
- **Rollback:** Exclusão da pasta `Body-Harmony-Remake` criada dentro de `Central_de_Projetos` caso o usuário deseje reiniciar o processo.

---

# ✅ Checklist de Execução Atômica
- [ ] 1. Criar contrato de manifesto em `openspec/contracts/drive/project-clone-manifest.json`
- [ ] 2. Desenvolver o script de sincronização inteligente `scripts/devops/sync_project_to_gdrive.py`
- [ ] 3. Executar autenticação OAuth2 / Service Account com a pasta destino `1iGIhPf5OTo8WZkGr8WGPlQM5Qt0ibePh`
- [ ] 4. Realizar o upload estruturado de todos os arquivos de specs, código e infraestrutura
- [ ] 5. Gerar o relatório de auditoria e manifest com todos os links e IDs do Google Drive
