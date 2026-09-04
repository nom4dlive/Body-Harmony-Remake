# ⚙️ 20-Operations-Manual

> **Status:** Active
> **Version:** 1.0
> **Type:** Handbook
> **Last Update:** 2026-02-07

---

## 1. Visão Geral de Deploy (VPS Unificada Dedicated)

O projeto utiliza um pipeline unificado nativo para deploy sob containers Docker na VPS Hostinger Dedicada. Não realize builds manuais nem uploads por FTP legado.

### 1.1 Arquitetura de Build e Transferência (SSH/Tarball)
O script de deploy compila o frontend estático, empacota as frações do projeto em Tarballs comprimidas e as transfere via SCP seguro diretamente para a VPS, descompactando-as nos containers produtivos.

```mermaid
graph TD
    SRC_REACT[apps/web-app/src] -->|Vite Build| BUILD[apps/web-app/build/public_html]
    BUILD -->|Tarball/SCP| VPS_PUBLIC[/opt/bodyharmony/public]
    SRC_PHP[apps/web-app/src/backend/api] -->|Tarball/SCP| VPS_API[/opt/bodyharmony/api]
    SRC_DB[infrastructure/database] -->|Migrations| VPS_DB[(MySQL Dedicated Container)]
```

### 1.2 Comando Único
Para realizar o deploy completo (Build + Tarball Sync + Rebuild de Containers):
```powershell
.\Operations\deploy-vps.ps1
```

**Opções:**
- `-SkipBuild`: Apenas sincroniza e extrai os tarballs com os arquivos locais já gerados.
- `-ForceRebuildDocker`: Força a reconstrução física das imagens dos containers no host da VPS.

---

## 2. Configuração de Ambiente (.env)

O arquivo `.env` **não** é versionado. Em produção, ele deve residir na raiz do `public_html` e ser protegido via `.htaccess`.

### Variáveis Críticas
```ini
DB_HOST=localhost
DB_NAME=u434024825_bodyharmony
DB_USER=u434024825_admin
DB_PASS=SuaSenhaSegura

# Superadmin Inicial
SUPERADMIN_USER=nom4d
SUPERADMIN_PASS=SenhaNom4d

# JWT / Security
JWT_SECRET=ChaveMuitoLongaEAleatoria
```

> **Segurança:** O script de deploy já configura o `.htaccess` para bloquear acesso web ao `.env`.

---

## 3. Banco de Dados

### 3.1 Reset Total
Para resetar o banco de produção (Cuidado!):
1. Importe `infrastructure/database/DATABASE_MASTER_V36_1.sql` via PHPMyAdmin.
2. Ou use o script de governança (se configurado com acesso remoto).

### 3.2 Migrations
O sistema Nexus possui um gerenciador de migrations em `/portal-gestor` -> `Database Governance`.
- **Upload:** Envie arquivos `.sql` para `infrastructure/database/migrations/`.
- **Execução:** Via painel Nexus.

### 3.3 Migrations de Schema (ALTER TABLE)
Migrations que adicionam colunas devem:
- Sempre usar `ADD COLUMN IF NOT EXISTS` para ser re-executável com segurança.
- Aplicar via script PHP (`apply_v##_patch.php`) quando o CLI MySQL não estiver acessível.
- **Remover** o script temporário após execução bem-sucedida.

---

## 4. 🚨 REGRA FIXA DE BUILD — Clean Build Protocol (V43+)
> **Obrigatório para TODOS os scripts de build e deploy, sem exceção.**

### 4.1 Única Pasta de Build Autorizada
```
f:\Body-Harmony-Remake\apps\web-app\build\public_html\
```
A pasta `f:\Body-Harmony-Remake\build\` é **legada e obsoleta**. Se existir, **REMOVER**:
```powershell
Remove-Item -Recurse -Force "f:\Body-Harmony-Remake\build\"
```

### 4.2 Procedimento de Clean Build (Pré-Deploy)
Antes de qualquer deploy em produção — especialmente após alterações estruturais de assets — executar:

```powershell
# 1. Limpar build local
Remove-Item -Recurse -Force "f:\Body-Harmony-Remake\apps\web-app\build\public_html\api\"
Remove-Item -Recurse -Force "f:\Body-Harmony-Remake\apps\web-app\build\public_html\assets\"
Remove-Item -Force "f:\Body-Harmony-Remake\apps\web-app\build\public_html\index.html" -ErrorAction SilentlyContinue

# 2. Executar deploy unificado da VPS
f:\Body-Harmony-Remake\Operations\deploy-vps.ps1
```

### 4.3 Diagnósticos de Conexão VPS SSH
Se o deploy falhar na conexão ou cópia de arquivos:
1. Verifique as credenciais no arquivo local **`.env.deploy`** na raiz do projeto (não versionado).
2. Confirme se as chaves SSH estão no caminho indicado e autorizadas no arquivo `~/.ssh/authorized_keys` da VPS.
3. Teste a conexão manual via console: `ssh -p [Port] root@[IP]`.

---



## 4. Troubleshooting Comum

### 4.1 "Connection failed"
- Verifique se as credenciais no `.env` da Hostinger batem com o painel "MySQL Databases".
- Confirme se o usuário do banco tem permissões na database.

### 4.2 Tela Branca (Frontend)
- Verifique o console do navegador (`F12`).
- Erros de `API Connection` geralmente indicam que a `API_BASE` no `api.js` está errada ou o backend está offline (500 Internal Server Error).
- Verifique `error_log` na pasta `api` via FTP.

### 4.3 Caracteres Estranhos (Encoding)
- O banco e a conexão PHP devem estar em `utf8mb4`.
- Verifique se `config.php` tem: `$pdo->exec("set names utf8mb4");`.

### 4.4 Senhas Inválidas após Import
- As senhas no banco são hashes `bcrypt`.
- Senha padrão licenciadas: Definida no `.env` (`DEFAULT_STUDENT_PASS`).
- Senha padrão Admin (Josi): Definida no `.env` (`SUPERADMIN_PASS`).

---

## 5. Manutenção

### 5.1 Logs
Acesse logs de erro e acesso via Nexus -> Watchtower ou diretamente via FTP em `api/logs`.

### 5.2 Backup
O Hostinger realiza backups diários, mas recomenda-se exportar o banco via Nexus ("Export Snapshot") antes de grandes mudanças.
