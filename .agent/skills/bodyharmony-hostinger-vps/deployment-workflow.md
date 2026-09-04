# Fluxo de Deploy Baseado em SSH/Rsync — Body Harmony VPS

Este guia operacional documenta o fluxo de implantação de ponta a ponta dos serviços de frontend (React/Vite) e backend (PHP 8.4) na VPS Dedicada Hostinger do ecossistema Body Harmony.

## Fluxo Operacional de Deploy

```
1. Preparação Local (Build Frontend) → 2. Sincronização Estáticos e Lógica PHP → 3. Execução das Migrações SQL → 4. Reload dos Containers Docker
```

### Passo 1: Preparação e Compilação Local
Antes de sincronizar arquivos com o servidor remoto, o build do frontend React em `apps/web-app/src/frontend/` deve ser executado para gerar a pasta `build/` consolidada:

```powershell
cd apps/web-app
npm run build
```

### Passo 2: Sincronização com a VPS via Rsync
O envio dos arquivos para o servidor remoto utiliza chaves SSH configuradas localmente de forma segura e automatizada via rsync:

```bash
# Sincronização do Frontend compilado para a pasta de arquivos estáticos da VPS
rsync -avz --delete -e "ssh -i openspec/tracker/Hostinger_VPS/id_ed25519" \
  ./apps/web-app/build/ root@2.25.156.25:/var/www/bodyharmony/public_html/

# Sincronização do Backend PHP para a pasta privada do servidor
rsync -avz --delete -e "ssh -i openspec/tracker/Hostinger_VPS/id_ed25519" \
  --exclude="node_modules" \
  --exclude=".env" \
  ./apps/web-app/src/backend/ root@2.25.156.25:/var/www/bodyharmony/backend/
```

> [!CAUTION]
> **Nunca comite ou exponha a chave SSH privada `id_ed25519`.**
> Mantenha arquivos sensíveis listados no `.gitignore` do repositório para evitar vazamentos de credenciais.

### Passo 3: Execução de Migrações SQL
Com os arquivos sincronizados na VPS, as novas migrações SQL presentes no diretório `infrastructure/database/migrations/` devem ser executadas no banco de dados de produção:

```powershell
# Execução da migração local que dispara o script remoto correspondente
.\Operations\migrate-database-production.ps1
```

### Passo 4: Atualização dos Containers Docker
Para aplicar alterações de infraestrutura ou reconfigurações do docker-compose:

```bash
ssh -i openspec/tracker/Hostinger_VPS/id_ed25519 root@2.25.156.25 "cd /opt/bodyharmony && docker compose up -d --build"
```

---

## Estratégia de Rollback de Emergência

Caso ocorram problemas pós-implantação (erros fatais no backend ou regressões críticas de UI), acione imediatamente o plano de contingência:

### Rollback Rápido de Código
1. Reverta o commit no Git local:
   ```bash
   git revert HEAD
   ```
2. Recompile e re-execute o script de deploy:
   ```powershell
   .\Operations\deploy-vps.ps1
   ```

### Restaurar Banco de Dados
Se uma migração corromper a estrutura de dados:
```bash
ssh -i openspec/tracker/Hostinger_VPS/id_ed25519 root@2.25.156.25 "mysql -u root -p bodyharmony_prod < /var/www/bodyharmony/backups/backup_pre_deploy.sql"
```

### nuclear: Snapshot Hostinger API
Caso precise reverter todo o sistema operacional da VPS para o estado estável anterior:
```bash
curl -X POST "https://developers.hostinger.com/api/vps/v1/virtual-machines/12345/snapshot/restore" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN"
```
